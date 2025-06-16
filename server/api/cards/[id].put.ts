import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params.id

    try {
        const card = await prisma.card.findUnique({
            where: { id },
        })
        if (!card) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Card not found'
            })
        }
        return card
    } catch (error) {
        console.error('Error fetching card:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching card'
        })
    }
})