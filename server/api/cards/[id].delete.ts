import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params.id

    try {
        await prisma.card.delete({
            where: { id },
        })
        return { message: 'Card deleted successfully' }
    } catch (error) {
        console.error('Error deleting card:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error deleting card'
        })
    }
})