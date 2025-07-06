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
        initializeCards(cards: Card[]) {
            this.cards = cards;
        },
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
                console.log('Editing card:', cardId, 'with data:', updatedData);

                const response = await $fetch(`/api/cards/${cardId}`, {
                    method: 'PUT',
                    body: updatedData
                });

                console.log('Received updated card from server:', response);

                if (response && response.updatedCard) {
                    const updatedCard = response.updatedCard;

                    // Update the card in this store
                    this.updateCardInStore(updatedCard);

                    // Update the card in the list store
                    const listStore = useListStore();
                    listStore.updateCard(updatedCard.listId, updatedCard);

                    // If this card is currently selected, update the selectedCard
                    if (this.selectedCard && this.selectedCard.id === updatedCard.id) {
                        this.selectedCard = { ...updatedCard };
                    }

                    console.log('Card updated in stores:', updatedCard);
                    console.log('Current cardStore state:', this.cards);
                    console.log('Current listStore state:', listStore.lists);

                    return updatedCard;
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Error editing card:', error);
                throw error;
            }
        },

        updateCardInStore(updatedCard: Card) {
            console.log('Updating card in cardStore:', updatedCard);
            const index = this.cards.findIndex(card => card.id === updatedCard.id);
            if (index !== -1) {
                this.cards[index] = { ...updatedCard };
                console.log('Card updated in cardStore');
            } else {
                console.log('Card not found in cardStore, adding it');
                this.cards.push(updatedCard);
            }
            // Force reactivity
            this.cards = [...this.cards];
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

                // Remove the card from the local state
                this.cards = this.cards.filter(card => card.id !== cardId)

                // If the deleted card was selected, clear the selection
                if (this.selectedCard && this.selectedCard.id === cardId) {
                    this.selectedCard = null
                }

                // Update the list store
                const listStore = useListStore()
                listStore.removeCardFromList(cardId)

                return { success: true, message: 'Card deleted successfully' }
            } catch (error) {
                console.error('Error deleting card:', error)
                return { success: false, message: 'Failed to delete card' }
            }
        },

        // Add this method to sync cards with a specific list
        syncCardsWithList(listId: string, cards: any[]) {
            this.cards = this.cards.filter(card => card.listId !== listId)
            this.cards.push(...cards)
        },

        /**
         * Moves a card from one list to another.
         * @param params - Object containing cardId, fromListId, toListId, and newIndex.
         */
        async moveCard({ cardId, fromListId, toListId, newIndex }: { cardId: string, fromListId: string, toListId: string, newIndex: number }) {
            try {
                const listStore = useListStore()

                // Find the card in the source list or in the cardStore
                let card = this.cards.find(c => c.id === cardId)
                if (!card) {
                    const sourceList = listStore.lists.find(l => l.id === fromListId)
                    if (!sourceList) {
                        console.error('Source list not found:', fromListId)
                        throw new Error('Source list not found')
                    }
                    card = sourceList.cards.find(c => c.id === cardId)
                }

                if (!card) {
                    console.error('Card not found:', cardId)
                    throw new Error('Card not found')
                }

                // Update the card's listId
                card.listId = toListId

                // Remove the card from the source list
                listStore.removeCardFromList(fromListId, cardId)

                // Add the card to the destination list
                listStore.addCardToList(toListId, card, newIndex)

                // Get the updated order of cards in the destination list
                const updatedList = listStore.lists.find(l => l.id === toListId)
                if (!updatedList) {
                    console.error('Destination list not found:', toListId)
                    throw new Error('Destination list not found')
                }

                const updatedCardIds = updatedList.cards.map(c => c.id)

                // Call the reorder API
                const response = await $fetch(`/api/lists/${toListId}/reorder`, {
                    method: 'POST',
                    body: { cardIds: updatedCardIds }
                })

                // Update the local state with the response
                if (response && response.updatedList) {
                    this.syncCardsWithList(toListId, response.updatedList.cards)
                    listStore.updateListCards(toListId, response.updatedList.cards)
                }

                // Ensure the card is in the cardStore
                this.updateCardInStore(card)

                return card
            } catch (e: any) {
                console.error('Error moving card:', e)
                throw e
            }
        }
    },
})