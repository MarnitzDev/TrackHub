import { ref } from 'vue'
import { useFetch } from 'nuxt/app'

export const useBoard = () => {
    const boards = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchBoards = async () => {
        loading.value = true
        error.value = null
        try {
            const { data, error: fetchError } = await useFetch('/api/boards')
            if (fetchError.value) {
                throw new Error(fetchError.value.message || 'Failed to fetch boards')
            }
            boards.value = data.value
        } catch (e: any) {
            console.error('Error fetching boards:', e)
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    const createBoard = async (boardData: { title: string, description?: string }) => {
        try {
            const { data, error } = await useFetch('/api/boards', {
                method: 'POST',
                body: boardData
            })
            if (error.value) {
                throw new Error(error.value.message || 'Failed to create board')
            }
            await fetchBoards() // Refresh the board list
            return data.value
        } catch (e: any) {
            console.error('Error creating board:', e)
            throw e
        }
    }

    const destroy = async (id: string): Promise<boolean> => {
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