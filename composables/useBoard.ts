import { ref } from 'vue'
import { useUserStore } from '~/stores/userStore'

export const useBoard = () => {
    const userStore = useUserStore()
    const boards = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchBoards = async () => {
        if (!userStore.isAuthenticated) {
            error.value = 'User is not authenticated'
            return
        }

        loading.value = true
        error.value = null
        try {
            const { data } = await useFetch('/api/boards')
            boards.value = data.value
        } catch (e: any) {
            console.error('Error fetching boards:', e)
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    const createBoard = async (boardData: { title: string, description?: string }) => {
        if (!userStore.isAuthenticated) {
            throw new Error('User is not authenticated')
        }

        try {
            const { data, error } = await useFetch('/api/boards', {
                method: 'POST',
                body: boardData
            })
            if (error.value) {
                throw new Error(error.value.message || 'Failed to create board')
            }
            await fetchBoards()
            return data.value
        } catch (e: any) {
            console.error('Error creating board:', e)
            throw e
        }
    }

    const destroy = async (id: string): Promise<boolean> => {
        if (!userStore.isAuthenticated) {
            throw new Error('User is not authenticated')
        }

        try {
            const { error } = await useFetch(`/api/boards/${id}`, {
                method: 'DELETE',
            })

            if (error.value) {
                throw new Error(error.value.message || 'Failed to delete board')
            }

            await fetchBoards() // Refresh the board list
            return true
        } catch (e: any) {
            console.error('Error deleting board:', e)
            return false
        }
    }

    const confirmDestroy = (id: string, onConfirm: () => void) => {
        if (!userStore.isAuthenticated) {
            console.error('User is not authenticated')
            return
        }

        // Implement confirmation logic here
        // For now, we'll just call destroy directly
        destroy(id).then((success) => {
            if (success) {
                onConfirm()
            }
        })
    }

    return {
        boards,
        loading,
        error,
        fetchBoards,
        createBoard,
        destroy,
        confirmDestroy,
    }
}