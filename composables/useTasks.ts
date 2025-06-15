import { useUserStore } from '~/stores/userStore'
import { useAuth } from '~/composables/useAuth'
import { ref } from 'vue'

interface Task {
    id: string
    profile_id: string
    title: string
    description: string
    status: string
    column_id: string
    position: number
    created_at: string
    updated_at: string
}

export const useTasks = () => {
    const userStore = useUserStore()
    const { isUserGuest } = useAuth()
    const tasks = ref<Task[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const guestMessage = ref('')

    const fetchTasks = async () => {
        if (isUserGuest.value) {
            guestMessage.value = 'You are using guest mode. Tasks will not be saved.'
            return
        }

        if (!userStore.user) {
            error.value = 'User not authenticated'
            return
        }

        loading.value = true
        error.value = null

        try {
            const { data } = await useFetch('/api/tasks', {
                method: 'GET',
                params: { userId: userStore.user.id }
            })
            tasks.value = data.value as Task[]
        } catch (e) {
            console.error('Error fetching tasks:', e)
            tasks.value = []
            error.value = 'Failed to fetch tasks'
        } finally {
            loading.value = false
        }
    }

    const addTask = async (taskData: Omit<Task, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => {
        if (isUserGuest.value) {
            const newTask: Task = {
                ...taskData,
                id: `temp_${Date.now()}`,
                profile_id: 'guest',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            tasks.value.push(newTask)
            guestMessage.value = 'Task added locally. Sign in to save your tasks.'
            return newTask
        }

        if (!userStore.user) {
            error.value = 'User not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const { data } = await useFetch('/api/tasks', {
                method: 'POST',
                body: { ...taskData, userId: userStore.user.id }
            })
            const newTask = data.value as Task
            tasks.value.push(newTask)
            return newTask
        } catch (e) {
            console.error('Error adding task:', e)
            error.value = 'Failed to add task'
            return null
        } finally {
            loading.value = false
        }
    }

    const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>) => {
        if (isUserGuest.value) {
            const index = tasks.value.findIndex(t => t.id === taskId)
            if (index !== -1) {
                tasks.value[index] = { ...tasks.value[index], ...updates, updated_at: new Date().toISOString() }
            }
            guestMessage.value = 'Task updated locally. Sign in to save your changes.'
            return tasks.value[index]
        }

        if (!userStore.user) {
            error.value = 'User not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const { data } = await useFetch('/api/tasks', {
                method: 'PUT',
                body: { taskId, updates, userId: userStore.user.id }
            })
            const updatedTask = data.value as Task
            const index = tasks.value.findIndex(t => t.id === taskId)
            if (index !== -1) {
                tasks.value[index] = updatedTask
            }
            return updatedTask
        } catch (e) {
            error.value = 'Failed to update task'
            console.error('Error updating task:', e)
            return null
        } finally {
            loading.value = false
        }
    }

    const deleteTask = async (taskId: string) => {
        if (isUserGuest.value) {
            tasks.value = tasks.value.filter(t => t.id !== taskId)
            guestMessage.value = 'Task deleted locally. Sign in to save your changes.'
            return true
        }

        if (!userStore.user) {
            error.value = 'User not authenticated'
            return false
        }

        loading.value = true
        error.value = null

        try {
            await useFetch('/api/tasks', {
                method: 'DELETE',
                body: { taskId, userId: userStore.user.id }
            })
            tasks.value = tasks.value.filter(t => t.id !== taskId)
            return true
        } catch (e) {
            error.value = 'Failed to delete task'
            console.error('Error deleting task:', e)
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        tasks,
        loading,
        error,
        guestMessage,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask
    }
}