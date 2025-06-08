import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { useAuth } from '~/composables/useAuth'
import { pool } from '~/config/database'

interface Task {
    id?: string
    profile_id: string
    title: string
    description: string
    status: 'todo' | 'in_progress' | 'done'
    column_id: number
    position: number
    created_at?: string
    updated_at?: string
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
            const result = await pool.query(
                'SELECT * FROM tasks WHERE profile_id = $1 ORDER BY position ASC',
                [userStore.user.id]
            )
            tasks.value = result.rows
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
            const result = await pool.query(
                'INSERT INTO tasks (profile_id, title, description, status, column_id, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [userStore.user.id, taskData.title, taskData.description, taskData.status, taskData.column_id, taskData.position]
            )
            const newTask = result.rows[0]
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
            const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 3}`).join(', ')
            const values = Object.values(updates)
            const result = await pool.query(
                `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $1 AND profile_id = $2 RETURNING *`,
                [taskId, userStore.user.id, ...values]
            )
            const updatedTask = result.rows[0]
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
            await pool.query(
                'DELETE FROM tasks WHERE id = $1 AND profile_id = $2',
                [taskId, userStore.user.id]
            )
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