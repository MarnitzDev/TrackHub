import { defineStore } from 'pinia'
import { Board } from '~/types' // Assuming you have a Board type defined

export const useBoardStore = defineStore('board', {
    state: () => ({
        boards: [] as Board[],
        loading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchBoards() {
            this.loading = true
            this.error = null
            try {
                const response = await $fetch('/api/boards')
                this.boards = response
            } catch (error) {
                console.error('Error fetching boards:', error)
                this.error = 'Failed to fetch boards'
            } finally {
                this.loading = false
            }
        },

        async createBoard(boardData: { title: string; description?: string }) {
            this.loading = true
            this.error = null
            try {
                const newBoard = await $fetch('/api/boards', {
                    method: 'POST',
                    body: boardData,
                })
                this.boards.push(newBoard)
                return newBoard
            } catch (error) {
                console.error('Error creating board:', error)
                this.error = 'Failed to create board'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteBoard(boardId: string) {
            this.loading = true
            this.error = null
            try {
                await $fetch(`/api/boards/${boardId}`, {
                    method: 'DELETE',
                })
                this.boards = this.boards.filter(board => board.id !== boardId)
            } catch (error) {
                console.error('Error deleting board:', error)
                this.error = 'Failed to delete board'
                throw error
            } finally {
                this.loading = false
            }
        },

        clearBoards() {
            this.boards = []
            this.error = null
        },
    },
})