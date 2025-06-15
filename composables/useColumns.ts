import { useAuth } from '~/composables/useAuth'
import { ref } from 'vue'
import { useUserStore } from '~/stores/userStore'

export const useColumns = () => {
    const userStore = useUserStore()
    const { isUserGuest } = useAuth()
    const columns = ref<Column[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchColumns = async () => {
        if (isUserGuest.value) {
            columns.value = [
                { id: 1, title: 'To Do', position: 0, tasks: [] },
                { id: 2, title: 'In Progress', position: 1, tasks: [] },
                { id: 3, title: 'Done', position: 2, tasks: [] }
            ]
            return
        }

        if (!userStore.user) {
            error.value = 'User not authenticated'
            return
        }

        loading.value = true
        error.value = null

        try {
            const pool = getPool()
            const result = await pool.query(
                'SELECT * FROM columns WHERE profile_id = $1 ORDER BY position ASC',
                [userStore.user.id]
            )
            columns.value = result.rows.map(column => ({
                ...column,
                tasks: []
            }))
        } catch (e) {
            console.error('Error fetching columns:', e)
            columns.value = []
            error.value = 'Failed to fetch columns'
        } finally {
            loading.value = false
        }
    }

    const addColumn = async (columnData: { title: string }) => {
        if (isUserGuest.value) {
            const newColumn = {
                id: columns.value.length + 1,
                ...columnData,
                position: columns.value.length,
                tasks: []
            }
            columns.value.push(newColumn)
            return newColumn
        }

        if (!userStore.user) {
            error.value = 'User not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const result = await pool.query(
                'INSERT INTO columns (title, profile_id, position) VALUES ($1, $2, $3) RETURNING *',
                [columnData.title, userStore.user.id, columns.value.length]
            )
            const newColumn = { ...result.rows[0], tasks: [] }
            columns.value.push(newColumn)
            return newColumn
        } catch (e) {
            console.error('Error adding column:', e)
            error.value = 'Failed to add column'
            return null
        } finally {
            loading.value = false
        }
    }

    const updateColumnPositions = async (updatedColumns: Column[]) => {
        if (isUserGuest.value) {
            columns.value = updatedColumns
            return
        }

        if (!userStore.user) {
            error.value = 'User not authenticated'
            return
        }

        loading.value = true
        error.value = null

        try {
            // Start a transaction
            await pool.query('BEGIN')

            for (const column of updatedColumns) {
                await pool.query(
                    'UPDATE columns SET position = $1, title = $2 WHERE id = $3 AND profile_id = $4',
                    [column.position, column.title, column.id, userStore.user.id]
                )
            }

            // Commit the transaction
            await pool.query('COMMIT')

            columns.value = updatedColumns
        } catch (e) {
            // Rollback the transaction in case of error
            await pool.query('ROLLBACK')
            console.error('Error updating column positions:', e)
            error.value = 'Failed to update column positions'
        } finally {
            loading.value = false
        }
    }

    return {
        columns,
        loading,
        error,
        fetchColumns,
        addColumn,
        updateColumnPositions
    }
}