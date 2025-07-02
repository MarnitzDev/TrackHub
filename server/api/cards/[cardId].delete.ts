import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const cardId = event.context.params?.cardId

    if (!cardId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Card ID is required'
        })
    }

    try {
        const deletedCard = await prisma.card.delete({
            where: { id: cardId }
        })

        return { message: 'Card deleted successfully', deletedCard }
    } catch (error) {
        console.error('Error deleting card:', error)

        // Add more detailed error logging
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma error code:', error.code)
            console.error('Prisma error message:', error.message)

            if (error.code === 'P2025') {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Card not found'
                })
            }
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Error deleting card',
            stack: error instanceof Error ? error.stack : undefined
        })
    }
})