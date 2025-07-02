import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const listId = event.context.params?.listId
    const body = await readBody(event)
    const { cardIds, sourceListId } = body

    if (!listId || !cardIds || !Array.isArray(cardIds)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request'
        })
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Update cards in the destination list
            for (let i = 0; i < cardIds.length; i++) {
                await tx.card.update({
                    where: { id: cardIds[i] },
                    data: { order: i, listId: listId }
                })
            }

            // If there's a source list and it's different from the destination list,
            // we need to reorder the remaining cards in the source list
            if (sourceListId && sourceListId !== listId) {
                const remainingCards = await tx.card.findMany({
                    where: { listId: sourceListId },
                    orderBy: { order: 'asc' }
                })

                for (let i = 0; i < remainingCards.length; i++) {
                    await tx.card.update({
                        where: { id: remainingCards[i].id },
                        data: { order: i }
                    })
                }
            }
        })

        // Fetch and return the updated cards for the destination list
        const updatedCards = await prisma.card.findMany({
            where: { listId: listId },
            orderBy: { order: 'asc' }
        })

        return updatedCards
    } catch (error) {
        console.error('Error reordering cards:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to reorder cards'
        })
    }
})