import { defineStore } from 'pinia'
import { Board, List } from '@prisma/client'

interface BoardWithLists extends Board {
    lists?: List[]
    backgroundImage?: string
}

export const useBoardStore = defineStore('board', {
    state: () => ({
        boards: [] as BoardWithLists[],
        loading: false,
        error: null as string | null,
        editingBoard: null as BoardWithLists | null,
    }),

    actions: {
        /**
         * Fetches all boards from the API and updates the store.
         * Sets loading state and handles errors.
         */
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

        /**
         * Creates a new board with the given data.
         * @param boardData - The data for the new board.
         * @returns The created board data.
         */
        async createBoard(boardData: { title: string, description?: string, backgroundImage?: string }) {
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

        /**
         * Sets the board to be edited.
         * @param board - The board to be edited or null to clear.
         */
        setEditingBoard(board: Board | null) {
            console.log('boardStore: setEditingBoard', board)
            this.editingBoard = board ? { ...board } : null
        },

        /**
         * Updates an existing board with the given data.
         * @param boardData - The updated data for the board.
         */
        async updateBoard(boardData: { id: string, title: string, description?: string, backgroundImage?: string }) {
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

        /**
         * Deletes a board by its ID.
         * @param id - The ID of the board to delete.
         * @returns A boolean indicating whether the deletion was successful.
         */
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

        /**
         * Adds a new list to the current board.
         * @param newList - The new list to be added.
         */
        addListToCurrentBoard(newList: List) {
            console.log('boardStore: addListToCurrentBoard', newList)
            const boardIndex = this.boards.findIndex(board => board.id === newList.boardId)
            if (boardIndex !== -1) {
                const currentBoard = this.boards[boardIndex]
                if (!Array.isArray(currentBoard.lists)) {
                    currentBoard.lists = []
                }
                currentBoard.lists.push(newList)
                // Update the board in the boards array and trigger reactivity
                this.boards[boardIndex] = { ...currentBoard }
                // Force reactivity on the entire boards array
                this.boards = [...this.boards]
            } else {
                console.error('Current board not found when adding new list')
            }
        }
    },
})