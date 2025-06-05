
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useUserStore } from '~/stores/userStore'
import { useAuth } from '~/composables/useAuth'

interface Column {
    id: number
    title: string
    tasks: Task[]
}

export const useColumns = () => {
    const supabase = useSupabaseClient()
    const userStore = useUserStore()
    const { isUserGuest } = useAuth()
    const columns = ref<Column[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchColumns = async () => {
        if (isUserGuest.value) {
            columns.value = [
                { id: 1, title: 'To Do', tasks: [] },
                { id: 2, title: 'In Progress', tasks: [] },
                { id: 3, title: 'Done', tasks: [] }
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
            const { data, error: supabaseError } = await supabase
                .from('columns')
                .select('*')
                .eq('profile_id', userStore.user.id)
                .order('id', { ascending: true })

            if (supabaseError) throw supabaseError

            columns.value = data?.map(column => ({
                ...column,
                tasks: []
            })) || []
        } catch (e) {
            console.error('Error fetching columns:', e)
            columns.value = []
        } finally {
            loading.value = false
        }
    }

    const addColumn = async (columnData: { title: string }) => {
        if (isUserGuest.value) {
            const newColumn = { id: columns.value.length + 1, ...columnData, tasks: [] }
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
            const { data, error: supabaseError } = await supabase
                .from('columns')
                .insert({ ...columnData, profile_id: userStore.user.id })
                .select()
                .single()

            if (supabaseError) throw supabaseError

            columns.value.push({ ...data, tasks: [] })
            return data
        } catch (e) {
            console.error('Error adding column:', e)
            error.value = 'Failed to add column'
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        columns,
        loading,
        error,
        fetchColumns,
        addColumn
    }
}