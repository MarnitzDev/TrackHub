import { defineStore } from 'pinia'
import { Card } from '@prisma/client'
import { useListStore } from './listStore'

export const useCardStore = defineStore('card', {
    state: () => ({
        cards: [] as Card[],
        loading: false,
        error: null as string | null,
    }),
    actions: {
        /**
         * Creates a new card.
         * @param cardData - Data for the new card.
         * @returns The newly created card.
         */
        async createCard(cardData: Partial<Card>) {
            try {
                const newCard = await $fetch('/api/cards', {
                    method: 'POST',
                    body: cardData
                })
                this.cards.push(newCard)
                const listStore = useListStore()
                listStore.addCardToList(newCard.listId, newCard)
                return newCard
            } catch (e: any) {
                console.error('Error creating card:', e)
                throw e
            }
        },

        /**
         * Edits an existing card.
         * @param cardId - The ID of the card to edit.
         * @param updatedData - The updated data for the card.
         */
        async editCard(cardId: string, updatedData: Partial<Card>) {
            try {
                const updatedCard = await $fetch(`/api/cards/${cardId}`, {
                    method: 'PUT',
                    body: updatedData
                })
                const index = this.cards.findIndex(card => card.id === cardId)
                if (index !== -1) {
                    this.cards[index] = updatedCard
                }
                return updatedCard
            } catch (error) {
                console.error('Error editing card:', error)
                throw error
            }
        },

        /**
         * Deletes a card.
         * @param cardId - The ID of the card to delete.
         */
        async deleteCard(cardId: string) {
            try {
                await $fetch(`/api/cards/${cardId}`, {
                    method: 'DELETE'
                })
                this.cards = this.cards.filter(c => c.id !== cardId)
                const listStore = useListStore()
                listStore.removeCardFromList(cardId)
            } catch (e: any) {
                console.error('Error deleting card:', e)
                throw e
            }
        },

        /**
         * Moves a card from one list to another.
         * @param params - Object containing cardId, fromListId, toListId, and newIndex.
         */
        async moveCard({ cardId, fromListId, toListId, newIndex }: { cardId: string, fromListId: string, toListId: string, newIndex: number }) {
            try {
                const updatedCard = await $fetch(`/api/cards/${cardId}/move`, {
                    method: 'PUT',
                    body: { fromListId, toListId, newIndex }
                })
                const listStore = useListStore()
                listStore.moveCard({ cardId, fromListId, toListId, newIndex })
                return updatedCard
            } catch (e: any) {
                console.error('Error moving card:', e)
                throw e
            }
        },
    },
})