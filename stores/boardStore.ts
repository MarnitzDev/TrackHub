import {defineStore} from 'pinia'
import {Board} from '@prisma/client'

export const useBoardStore = defineStore('board', {
    state: () => ({
        boards: [] as Board[],
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchBoards() {
            console.log('boardStore: fetchBoards')
            this.loading = true
            this.error = null
            try {
                const {data} = await useFetch('/api/boards')
                this.boards = data.value
            } catch (e: any) {
                console.error('Error fetching boards:', e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },
        async createBoard(boardData: { title: string, description?: string }) {
            console.log('boardStore: createBoard')
            try {
                const {data, error} = await useFetch('/api/boards', {
                    method: 'POST',
                    body: boardData
                })
                if (error.value) {
                    throw new Error(error.value.message || 'Failed to create board')
                }
                await this.fetchBoards()
                return data.value
            } catch (e: any) {
                console.error('Error creating board:', e)
                throw e
            }
        },
        async destroyBoard(id: string): Promise<boolean> {
            console.log('boardStore: destroyBoard')
            try {
                const {error} = await useFetch(`/api/boards/${id}`, {
                    method: 'DELETE',
                })
                if (error.value) {
                    throw new Error(error.value.message || 'Failed to delete board')
                }
                await this.fetchBoards()
                return true
            } catch (e: any) {
                console.error('Error deleting board:', e)
                return false
            }
        },
    },
})