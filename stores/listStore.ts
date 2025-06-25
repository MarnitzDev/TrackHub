import { defineStore } from 'pinia'
import { List, Card } from '@prisma/client'
import { useBoardStore } from './boardStore'

interface ListWithCards extends List {
    cards: Card[]
}

export const useListStore = defineStore('list', {
    state: () => ({
        lists: [] as ListWithCards[],
        loading: false,
        error: null as string | null,
    }),
    actions: {
        /**
         * Fetches lists for a specific board.
         * @param boardId - The ID of the board to fetch lists for.
         */
        async fetchLists(boardId: string) {
            console.log("listStore: fetchLists, boardId:", boardId);
            if (!boardId) {
                console.error("fetchLists called with undefined boardId");
                this.error = "Invalid board ID";
                return;
            }
            this.loading = true
            this.error = null
            try {
                const data = await $fetch(`/api/boards/${boardId}/lists`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                console.log("API response:", data)
                this.lists = Array.isArray(data) ? data : []
            } catch (e: any) {
                console.error('Error fetching lists:', e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        /**
         * Creates a new list.
         * @param listData - Partial data for the new list.
         * @returns The newly created list with cards.
         */
        async createList(listData: Partial<List>) {
            try {
                const data = await $fetch('/api/lists', {
                    method: 'POST',
                    body: listData
                })

                const newList: ListWithCards = { ...data, cards: [] }
                this.lists.push(newList)

                const boardStore = useBoardStore()
                if (boardStore) {
                    boardStore.addListToCurrentBoard(newList)
                }

                console.log('New list created:', newList)
                return newList
            } catch (e: any) {
                console.error('Error creating list:', e)
                throw e
            }
        },

        /**
         * Edits an existing list.
         * @param listId - The ID of the list to edit.
         * @param updatedData - The updated data for the list.
         */
        async editList(listId: string, updatedData: Partial<List>) {
            try {
                const updatedList = await $fetch(`/api/lists/${listId}`, {
                    method: 'PUT',
                    body: updatedData
                })
                const index = this.lists.findIndex(list => list.id === listId)
                if (index !== -1) {
                    this.lists[index] = { ...this.lists[index], ...updatedList }
                }
            } catch (error) {
                console.error('Error editing list:', error)
                throw error
            }
        },

        /**
         * Deletes a list.
         * @param listId - The ID of the list to delete.
         */
        async deleteList(listId: string) {
            try {
                await $fetch(`/api/lists/${listId}`, {
                    method: 'DELETE'
                })
                this.lists = this.lists.filter(l => l.id !== listId)
            } catch (e: any) {
                console.error('Error deleting list:', e)
                throw e
            }
        },

        /**
         * Reorders lists within a board.
         * @param boardId - The ID of the board containing the lists.
         * @param listIds - An array of list IDs in their new order.
         */
        async reorderLists(boardId: string, listIds: string[]) {
            try {
                await $fetch(`/api/boards/${boardId}/reorder-lists`, {
                    method: 'PUT',
                    body: { listIds }
                })
                this.lists = listIds.map(id => this.lists.find(l => l.id === id)!).filter(Boolean)
            } catch (e: any) {
                console.error('Error reordering lists:', e)
                throw e
            }
        },

        /**
         * Adds a card to a specific list.
         * @param listId - The ID of the list to add the card to.
         * @param card - The card to be added.
         */
        addCardToList(listId: string, card: Card) {
            const list = this.lists.find(l => l.id === listId)
            if (list) {
                list.cards.push(card)
            }
        },

        /**
         * Removes a card from a specific list.
         * @param cardId - The ID of the card to be removed.
         */
        removeCardFromList(cardId: string) {
            this.lists.forEach(list => {
                list.cards = list.cards.filter(c => c.id !== cardId)
            })
        },

        /**
         * Moves a card from one list to another.
         * @param params - Object containing cardId, fromListId, toListId, and newIndex.
         */
        moveCard({ cardId, fromListId, toListId, newIndex }: { cardId: string, fromListId: string, toListId: string, newIndex: number }) {
            const fromList = this.lists.find(l => l.id === fromListId)
            const toList = this.lists.find(l => l.id === toListId)
            if (fromList && toList) {
                const card = fromList.cards.find(c => c.id === cardId)
                if (card) {
                    fromList.cards = fromList.cards.filter(c => c.id !== cardId)
                    toList.cards.splice(newIndex, 0, card)
                }
            }
        },
    },
})