
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
    getters: {
        sortedLists: (state) => [...state.lists].sort((a, b) => a.order - b.order),
    },
    actions: {
        async fetchLists(boardId: string) {
            if (!boardId) {
                console.error("fetchLists called with undefined boardId");
                this.error = "Invalid board ID";
                return;
            }
            this.loading = true;
            this.error = null;
            try {
                const data = await $fetch(`/api/boards/${boardId}/lists`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                this.lists = Array.isArray(data) ? data : [];
            } catch (e: any) {
                console.error('Error fetching lists:', e);
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async createList(listData: Partial<List>) {
            try {
                const boardId = listData.boardId;
                const data = await $fetch(`/api/boards/${boardId}/lists`, {
                    method: 'POST',
                    body: listData
                });

                const newList: ListWithCards = { ...data, cards: [] };
                this.lists.push(newList);

                const boardStore = useBoardStore();
                if (boardStore) {
                    boardStore.addListToCurrentBoard(newList);
                }

                return newList;
            } catch (e: any) {
                console.error('Error creating list:', e);
                throw e;
            }
        },

        async editList(boardId: string, listId: string, updatedData: Partial<List>) {
            try {
                if (typeof listId !== 'string') {
                    throw new Error('Invalid listId: must be a string');
                }
                const updatedList = await $fetch(`/api/boards/${boardId}/lists/${listId}`, {
                    method: 'PUT',
                    body: updatedData
                });
                const index = this.lists.findIndex(list => list.id === listId);
                if (index !== -1) {
                    this.lists[index] = { ...this.lists[index], ...updatedList };
                }
            } catch (error) {
                console.error('Error editing list:', error);
                throw error;
            }
        },

        async deleteList(boardId: string, listId: string) {
            if (!boardId || !listId) {
                console.error('deleteList called with undefined boardId or listId');
                throw new Error('Invalid board ID or list ID');
            }
            try {
                await $fetch(`/api/boards/${boardId}/lists/${listId}`, {
                    method: 'DELETE'
                });
                this.lists = this.lists.filter(l => l.id !== listId);
            } catch (e: any) {
                console.error('Error deleting list:', e);
                throw e;
            }
        },

        async reorderLists(boardId: string, newOrder: { id: string, order: number }[]) {
            if (!boardId) {
                console.error('reorderLists called with undefined boardId');
                throw new Error('Invalid board ID');
            }
            try {
                const updatedLists = await $fetch(`/api/boards/${boardId}/reorder`, {
                    method: 'POST',
                    body: { listIds: newOrder.map(item => item.id) }
                });

                if (Array.isArray(updatedLists)) {
                    this.updateListOrder(updatedLists);
                } else {
                    throw new Error('Unexpected server response format');
                }
            } catch (error) {
                console.error('Error reordering lists:', error);
                if (error.response) {
                    console.error('Error response:', await error.response.text());
                }
                await this.fetchLists(boardId);
                throw error;
            }
        },

        updateListOrder(newOrder: { id: string, order: number }[]) {
            this.lists = newOrder.map(item => {
                const list = this.lists.find(l => l.id === item.id);
                return { ...list, order: item.order } as ListWithCards;
            });
        },

        addCardToList(listId: string, card: Card) {
            const list = this.lists.find(l => l.id === listId);
            if (list) {
                if (!Array.isArray(list.cards)) {
                    list.cards = [];
                }
                list.cards.push(card);
                this.lists = [...this.lists];
            }
        },

        removeCardFromList(cardId: string) {
            this.lists.forEach(list => {
                list.cards = list.cards.filter(c => c.id !== cardId);
            });
        },

        moveCard({ cardId, fromListId, toListId, newIndex }: { cardId: string, fromListId: string, toListId: string, newIndex: number }) {
            const fromList = this.lists.find(l => l.id === fromListId);
            const toList = this.lists.find(l => l.id === toListId);
            if (fromList && toList) {
                const card = fromList.cards.find(c => c.id === cardId);
                if (card) {
                    fromList.cards = fromList.cards.filter(c => c.id !== cardId);
                    toList.cards.splice(newIndex, 0, card);
                }
            }
        },

        async reorderCards(listId: string, newOrder: string[]) {
            const list = this.lists.find(l => l.id === listId);
            if (list) {
                try {
                    const updatedCards = await $fetch(`/api/lists/${listId}/reorder`, {
                        method: 'POST',
                        body: { cardIds: newOrder }
                    });

                    if (Array.isArray(updatedCards)) {
                        list.cards = updatedCards.map(updatedCard => ({
                            ...list.cards.find(c => c.id === updatedCard.id),
                            ...updatedCard
                        }));
                        this.lists = [...this.lists];
                    } else {
                        throw new Error('Unexpected server response format');
                    }
                } catch (error) {
                    console.error('Error reordering cards:', error);
                    throw error;
                }
            }
        },
    },
});