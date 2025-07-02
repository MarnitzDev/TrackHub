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

    const boardId = event.context.params?.boardId
    const listId = event.context.params?.listId

    if (!boardId || !listId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Board ID and List ID are required'
        })
    }

    try {
        // First, delete all cards associated with this list
        await prisma.card.deleteMany({
            where: { listId: listId }
        })

        // Then, delete the list itself
        const deletedList = await prisma.list.delete({
            where: {
                id: listId,
                boardId: boardId // Ensure the list belongs to the specified board
            }
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