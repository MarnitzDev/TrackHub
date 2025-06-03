import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useUserStore } from '~/stores/userStore'

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
    const supabase = useSupabaseClient()
    const userStore = useUserStore()
    const tasks = ref<Task[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchTasks = async () => {
        if (!userStore.user) {
            error.value = 'User not authenticated'
            return
        }

        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('tasks')
                .select('*')
                .eq('profile_id', userStore.user.id)
                .order('position', { ascending: true })

            if (supabaseError) throw supabaseError

            tasks.value = data || []
        } catch (e) {
            console.error('Error fetching tasks:', e)
            tasks.value = []
        } finally {
            loading.value = false
        }
    }

    const addTask = async (taskData: Omit<Task, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => {
        if (!userStore.user) {
            error.value = 'User not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
                ...taskData,
                profile_id: userStore.user.id,
            }

            const { data, error: supabaseError } = await supabase
                .from('tasks')
                .insert(newTask)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            tasks.value.push(data)
            return data
        } catch (e) {
            error.value = 'Failed to add task'
            console.error('Error adding task:', e)
            return null
        } finally {
            loading.value = false
        }
    }

    const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>) => {
        if (!userStore.user) {
            error.value = 'User not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', taskId)
                .eq('profile_id', userStore.user.id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const index = tasks.value.findIndex(t => t.id === taskId)
            if (index !== -1) {
                tasks.value[index] = { ...tasks.value[index], ...data }
            }

            return data
        } catch (e) {
            error.value = 'Failed to update task'
            console.error('Error updating task:', e)
            return null
        } finally {
            loading.value = false
        }
    }

    const deleteTask = async (taskId: string) => {
        if (!userStore.user) {
            error.value = 'User not authenticated'
            return false
        }

        loading.value = true
        error.value = null

        try {
            const { error: supabaseError } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)
                .eq('profile_id', userStore.user.id)

            if (supabaseError) throw supabaseError

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
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
    }
}