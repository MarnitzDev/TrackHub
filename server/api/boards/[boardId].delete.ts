import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const boardId = event.context.params?.boardId

    if (!boardId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Board ID is required'
        })
    }

    try {
        const deletedBoard = await prisma.board.delete({
            where: { id: boardId }
        })

        return { message: 'Board deleted successfully', deletedBoard }
    } catch (error) {
        console.error('Error deleting board:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma error code:', error.code)
            console.error('Prisma error message:', error.message)

            if (error.code === 'P2025') {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Board not found'
                })
            }
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Error deleting board',
            stack: error instanceof Error ? error.stack : undefined
        })
    }
})