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
        isCreateModalOpen: false,
        isEditModalOpen: false,
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
                const data: BoardWithLists[] = await $fetch('/api/boards')
                this.boards = data.map(board => ({
                    ...board,
                    backgroundImageUrl: board.backgroundImage
                        ? `/images/board-backgrounds/${board.backgroundImage}`
                        : '/images/board-backgrounds/default.png'
                }))
            } catch (e: any) {
                console.error('Error fetching boards:', e)
                if (e.statusCode === 400 && e.statusMessage === 'Board ID is required') {
                    // This error suggests there are no boards, so we'll set an empty array
                    this.boards = []
                } else {
                    this.error = e.message
                }
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
            this.loading = true
            this.error = null
            try {
                const newBoard = await $fetch('/api/boards', {
                    method: 'POST',
                    body: boardData
                })
                this.boards.push(newBoard)
                return newBoard
            } catch (e: any) {
                console.error('Error creating board:', e)
                this.error = e.message
                throw e
            } finally {
                this.loading = false
                this.isCreateModalOpen = false
            }
        },

        /**
         * Sets the board to be edited.
         * @param board - The board to be edited or null to clear.
         */
        setEditingBoard(board: Board | null) {
            console.log('boardStore: setEditingBoard', board)
            this.editingBoard = board ? { ...board } : null
            this.isEditModalOpen = !!board
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
                const updatedBoard = await $fetch(`/api/boards/${boardData.id}`, {
                    method: 'PUT',
                    body: boardData
                })

                // Update the board in the local state
                const index = this.boards.findIndex(board => board.id === boardData.id)
                if (index !== -1) {
                    this.boards[index] = {
                        ...this.boards[index],
                        ...updatedBoard,
                        backgroundImageUrl: updatedBoard.backgroundImage
                            ? `/images/board-backgrounds/${updatedBoard.backgroundImage}`
                            : '/images/board-backgrounds/default.png'
                    }
                    // Force reactivity
                    this.boards = [...this.boards]
                }

                this.setEditingBoard(null)
            } catch (e: any) {
                console.error('Error updating board:', e)
                this.error = e.message
                throw e
            } finally {
                this.loading = false
                this.isEditModalOpen = false
            }
        },

        /**
         * Deletes a board by its ID.
         * @param id - The ID of the board to delete.
         * @returns A boolean indicating whether the deletion was successful.
         */
        async destroyBoard(id: string): Promise<boolean> {
            console.log('boardStore: destroyBoard', id)
            this.loading = true
            this.error = null
            try {
                await $fetch(`/api/boards/${id}`, {
                    method: 'DELETE',
                })

                // Remove the board from the local state
                this.boards = this.boards.filter(board => board.id !== id)

                return true
            } catch (e: any) {
                console.error('Error deleting board:', e)
                this.error = e.message
                return false
            } finally {
                this.loading = false
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
        },

        /**
         * Sets the create modal open state.
         * @param isOpen - Boolean indicating whether the create modal should be open.
         */
        setCreateModalOpen(isOpen: boolean) {
            this.isCreateModalOpen = isOpen
        },

        /**
         * Sets the edit modal open state.
         * @param isOpen - Boolean indicating whether the edit modal should be open.
         */
        setEditModalOpen(isOpen: boolean) {
            this.isEditModalOpen = isOpen
        },
    },
})