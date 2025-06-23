import { defineStore } from 'pinia'
import { List, Card } from '@prisma/client'

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
        async createList(listData: Partial<List>) {
            try {
                const data = await $fetch('/api/lists', {
                    method: 'POST',
                    body: listData
                })
                this.lists.push({ ...data, cards: [] })
                return data
            } catch (e: any) {
                console.error('Error creating list:', e)
                throw e
            }
        },
        async updateList(listData: Partial<List>) {
            try {
                const data = await $fetch(`/api/lists/${listData.id}`, {
                    method: 'PUT',
                    body: listData
                })
                const index = this.lists.findIndex(l => l.id === data.id)
                if (index !== -1) {
                    this.lists[index] = { ...this.lists[index], ...data }
                }
                return data
            } catch (e: any) {
                console.error('Error updating list:', e)
                throw e
            }
        },
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
        async reorderLists(boardId: string, listIds: string[]) {
            try {
                await $fetch(`/api/boards/${boardId}/reorder-lists`, {
                    method: 'PUT',
                    body: { listIds }
                })
                // Update local state
                this.lists = listIds.map(id => this.lists.find(l => l.id === id)!).filter(Boolean)
            } catch (e: any) {
                console.error('Error reordering lists:', e)
                throw e
            }
        },
        async addCardToList(listId: string, card: Card) {
            const list = this.lists.find(l => l.id === listId)
            if (list) {
                list.cards.push(card)
            }
        },
        async removeCardFromList(listId: string, cardId: string) {
            const list = this.lists.find(l => l.id === listId)
            if (list) {
                list.cards = list.cards.filter(c => c.id !== cardId)
            }
        },
        async moveCard({ cardId, fromListId, toListId, newIndex }: { cardId: string, fromListId: string, toListId: string, newIndex: number }) {
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