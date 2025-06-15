
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUserStore } from '~/stores/userStore'

export const useColumns = () => {
    const { isUserGuest } = useAuth()
    const userStore = useUserStore()
    const columns = ref<Column[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchColumns = async (projectId: string) => {
        if (isUserGuest.value) {
            columns.value = [
                { id: 1, title: 'To Do', position: 0, tasks: [] },
                { id: 2, title: 'In Progress', position: 1, tasks: [] },
                { id: 3, title: 'Done', position: 2, tasks: [] }
            ]
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await fetch(`/api/columns?projectId=${projectId}`)
            if (!response.ok) throw new Error('Failed to fetch columns')
            columns.value = await response.json()
        } catch (e) {
            console.error('Error fetching columns:', e)
            error.value = 'Failed to fetch columns'
        } finally {
            loading.value = false
        }
    }

    const addColumn = async (projectId: string, title: string = 'New Column') => {
        loading.value = true
        error.value = null
        try {
            const response = await fetch('/api/columns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId, title }),
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add column')
            }
            const newColumn = await response.json()
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

    const removeColumn = async (columnId: number) => {
        if (isUserGuest.value) {
            columns.value = columns.value.filter(col => col.id !== columnId)
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await fetch(`/api/columns?id=${columnId}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to remove column')
            columns.value = columns.value.filter(col => col.id !== columnId)
        } catch (e) {
            console.error('Error removing column:', e)
            error.value = 'Failed to remove column'
        } finally {
            loading.value = false
        }
    }

    const updateColumnPositions = async (updatedColumns: Column[]) => {
        if (isUserGuest.value) {
            columns.value = updatedColumns
            return
        }

        loading.value = true
        error.value = null

        try {
            const updatePromises = updatedColumns.map(column =>
                fetch('/api/columns', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: column.id,
                        title: column.title,
                        position: column.position
                    })
                })
            )
            await Promise.all(updatePromises)
            columns.value = updatedColumns
        } catch (e) {
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
        removeColumn,
        updateColumnPositions
    }
}