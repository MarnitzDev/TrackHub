import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUserStore } from '~/stores/userStore'

interface Column {
    id: number | string;
    title: string;
    position: number;
    tasks: any[];
    projectId: string;
}

export const useColumns = () => {
    const { isUserGuest } = useAuth()
    const userStore = useUserStore()
    const columns = ref<Column[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchColumns = async (projectId: string) => {
        if (isUserGuest.value) {
            columns.value = [
                { id: 'guest-1', title: 'To Do', position: 0, tasks: [], projectId },
                { id: 'guest-2', title: 'In Progress', position: 1, tasks: [], projectId },
                { id: 'guest-3', title: 'Done', position: 2, tasks: [], projectId }
            ]
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await fetch(`/api/columns?projectId=${projectId}`)
            if (!response.ok) throw new Error('Failed to fetch columns')
            const fetchedColumns = await response.json()

            // Fetch tasks for each column
            const tasksPromises = fetchedColumns.map(async (column: Column) => {
                const tasksResponse = await fetch(`/api/tasks?columnId=${column.id}`)
                if (tasksResponse.ok) {
                    column.tasks = await tasksResponse.json()
                } else {
                    column.tasks = []
                }
                return column
            })

            columns.value = await Promise.all(tasksPromises)
        } catch (e) {
            console.error('Error fetching columns:', e)
            error.value = 'Failed to fetch columns'
        } finally {
            loading.value = false
        }
    }

    const addColumn = async (projectId: string, title: string = 'New Column') => {
        if (!projectId || !title) {
            error.value = 'Column title and project ID are required'
            return null
        }

        if (isUserGuest.value) {
            const newColumn: Column = {
                id: `guest-${Date.now()}`,
                title,
                position: columns.value.length,
                tasks: [],
                projectId
            }
            columns.value.push(newColumn)
            return newColumn
        }

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

    const removeColumn = async (columnId: number | string) => {
        if (isUserGuest.value) {
            columns.value = columns.value.filter(col => col.id !== columnId)
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await fetch(`/api/columns/${columnId}`, {
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
                fetch(`/api/columns/${column.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
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

    const addTaskToColumn = async (columnId: string | number, task: Omit<Task, 'id'>) => {
        const column = columns.value.find(col => col.id === columnId)
        if (!column) {
            error.value = 'Column not found'
            return null
        }

        if (isUserGuest.value) {
            const newTask: Task = {
                ...task,
                id: `guest-task-${Date.now()}`,
                columnId
            }
            column.tasks.push(newTask)
            return newTask
        }

        loading.value = true
        error.value = null

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...task, columnId }),
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add task')
            }
            const newTask = await response.json()
            column.tasks.push(newTask)
            return newTask
        } catch (e) {
            console.error('Error adding task:', e)
            error.value = 'Failed to add task'
            return null
        } finally {
            loading.value = false
        }
    }

    const getColumnTasks = computed(() => {
        return (columnId: string | number) => {
            const column = columns.value.find(col => col.id === columnId)
            return column ? column.tasks : []
        }
    })

    return {
        columns,
        loading,
        error,
        fetchColumns,
        addColumn,
        removeColumn,
        updateColumnPositions,
        addTaskToColumn,
        getColumnTasks
    }
}