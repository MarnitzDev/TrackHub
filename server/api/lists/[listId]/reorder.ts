import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const listId = event.context.params?.listId
    const body = await readBody(event)
    const cardIds = body.cardIds

    if (!listId || !cardIds || !Array.isArray(cardIds)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request'
        })
    }

    try {
        const updatedCards = await prisma.$transaction(
            cardIds.map((cardId, index) =>
                prisma.card.update({
                    where: { id: cardId },
                    data: { order: index, listId: listId }
                })
            )
        )

        return updatedCards
    } catch (error) {
        console.error('Error reordering cards:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to reorder cards'
        })
    }
})