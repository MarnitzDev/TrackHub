import { defineStore } from 'pinia'
import { Card } from '@prisma/client'
import { useListStore } from './listStore'

export const useCardStore = defineStore('card', {
    state: () => ({
        cards: [] as Card[],
        loading: false,
        error: null as string | null,
        selectedCard: null as Card | null,
    }),
    actions: {
        /**
         * Opens a card by setting it as the selected card.
         * @param card - The card to be opened.
         */
        openCard(card: Card) {
            this.selectedCard = card
        },

        /**
         * Closes the currently selected card.
         */
        closeCard() {
            this.selectedCard = null
        },

        /**
         * Creates a new card.
         * @param cardData - Data for the new card.
         * @returns The newly created card.
         */
        async createCard(cardData: Partial<Card>) {
            try {
                const response = await $fetch('/api/cards', {
                    method: 'POST',
                    body: cardData
                })

                if (response && response.card) {
                    const newCard = response.card
                    this.cards.push(newCard)

                    const listStore = useListStore()
                    listStore.addCardToList(newCard.listId, newCard)

                    return newCard
                } else {
                    throw new Error('Invalid response from server')
                }
            } catch (e: any) {
                console.error('Error creating card:', e)
                if (e.statusCode === 400) {
                    // Handle validation errors
                    throw new Error(e.statusMessage || 'Invalid card data')
                } else if (e.statusCode === 500) {
                    // Handle server errors
                    throw new Error('Server error occurred while creating card')
                }
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
                if (this.selectedCard && this.selectedCard.id === cardId) {
                    this.selectedCard = updatedCard
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
                // Attempt to delete from the server first
                await $fetch(`/api/cards/${cardId}`, {
                    method: 'DELETE'
                })

                // If server deletion is successful, update local state
                const cardIndex = this.cards.findIndex(c => c.id === cardId)
                if (cardIndex !== -1) {
                    this.cards.splice(cardIndex, 1)
                }
                if (this.selectedCard && this.selectedCard.id === cardId) {
                    this.selectedCard = null
                }

                // Assuming you have a listStore
                const listStore = useListStore()
                listStore.removeCardFromList(cardId)

                return { success: true, message: 'Card deleted successfully' }
            } catch (error) {
                console.error('Error deleting card:', error)
                return { success: false, message: 'Failed to delete card' }
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