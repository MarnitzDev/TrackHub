
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useUserStore } from '~/stores/userStore'

interface Task {
    id: string
    title: string
    description: string
    status: string
    position: number
    projectId: string
    columnId: string
    userId: string
    createdAt: string
    updatedAt: string
}

export const useTasks = () => {
    const { user } = useAuth()
    const userStore = useUserStore()
    const tasks = ref<Task[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchTasks = async (projectId: string, columnId?: string) => {
        if (!user.value) {
            console.error('No user logged in')
            return
        }

        if (!projectId) {
            console.error('Project ID is required to fetch tasks');
            return;
        }

        loading.value = true
        error.value = null

        try {
            let url = `/api/tasks?userId=${user.value.id}&projectId=${projectId}`
            if (columnId) {
                url += `&columnId=${columnId}`
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const fetchedTasks = await response.json()
            tasks.value = fetchedTasks
            console.log('Fetched tasks:', tasks.value)
        } catch (err) {
            console.error('Error fetching tasks:', err)
            error.value = 'Failed to fetch tasks'
        } finally {
            loading.value = false
        }
    }

    const addTask = async (taskData: Partial<Task>) => {
        if (!user.value) return null
        loading.value = true
        error.value = null
        try {
            if (!taskData.title || !taskData.projectId || !taskData.columnId) {
                throw new Error('Task title, project ID, and column ID are required')
            }
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...taskData, userId: user.value.id })
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to add task')
            }
            const newTask = await response.json()
            tasks.value.push(newTask)
            return newTask
        } catch (e) {
            console.error('Error adding task:', e)
            error.value = e.message || 'Failed to add task'
            return null
        } finally {
            loading.value = false
        }
    }

    const updateTask = async (taskId: number, updates: Partial<Task>) => {
        try {
            if (!updates.title || !updates.projectId || !updates.columnId) {
                throw new Error('Task title, project ID, and column ID are required')
            }
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    const deleteTask = async (taskId: string) => {
        if (!user.value) return false
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.value.id })
            })
            if (!response.ok) throw new Error('Failed to delete task')
            tasks.value = tasks.value.filter(t => t.id !== taskId)
            console.log('Deleted task:', taskId)
            return true
        } catch (e) {
            console.error('Error deleting task:', e)
            error.value = 'Failed to delete task'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask
    }
}