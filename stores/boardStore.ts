import { defineStore } from 'pinia'
import { Board } from '@prisma/client'

export const useBoardStore = defineStore('board', {
    state: () => ({
        boards: [] as Board[],
        loading: false,
        error: null as string | null,
        editingBoard: null as Board | null,
    }),
    actions: {
        async fetchBoards() {
            console.log('boardStore: fetchBoards')
            this.loading = true
            this.error = null
            try {
                const data = await $fetch('/api/boards')
                this.boards = data
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
                const data = await $fetch('/api/boards', {
                    method: 'POST',
                    body: boardData
                })
                await this.fetchBoards()
                return data
            } catch (e: any) {
                console.error('Error creating board:', e)
                throw e
            }
        },

        setEditingBoard(board: Board | null) {
            console.log('boardStore: setEditingBoard', board)
            this.editingBoard = board ? { ...board } : null
        },

        async updateBoard(boardData: { id: string, title: string, description?: string }) {
            console.log('boardStore: updateBoard', boardData)
            this.loading = true
            this.error = null
            try {
                await $fetch(`/api/boards/${boardData.id}`, {
                    method: 'PUT',
                    body: boardData
                })
                await this.fetchBoards()
                this.setEditingBoard(null)
            } catch (e: any) {
                console.error('Error updating board:', e)
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async destroyBoard(id: string): Promise<boolean> {
            console.log('boardStore: destroyBoard')
            try {
                await $fetch(`/api/boards/${id}`, {
                    method: 'DELETE',
                })
                await this.fetchBoards()
                return true
            } catch (e: any) {
                console.error('Error deleting board:', e)
                return false
            }
        },
    },
})