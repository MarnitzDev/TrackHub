import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)

    if (!session || !session.user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const listId = event.context.params?.id

    if (!listId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'List ID is required'
        })
    }

    try {
        // First, delete all cards associated with this list
        await prisma.card.deleteMany({
            where: { listId: listId }
        })

        // Then, delete the list itself
        const deletedList = await prisma.list.delete({
            where: { id: listId }
        })

        return { message: 'List and associated cards deleted successfully', deletedList }
    } catch (error) {
        console.error('Error deleting list:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error deleting list'
        })
    } finally {
        await prisma.$disconnect()
    }
})