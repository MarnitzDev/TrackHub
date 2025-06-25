import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Board ID is required'
        })
    }

    try {
        const deletedBoard = await prisma.board.delete({
            where: { id }
        })

        return { message: 'Board deleted successfully', deletedBoard }
    } catch (error) {
        console.error('Error deleting board:', error)

        // Add more detailed error logging
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