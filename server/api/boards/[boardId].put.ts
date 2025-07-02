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

    const body = await readBody(event)

    if (!body || Object.keys(body).length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Request body is required'
        })
    }

    try {
        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: {
                title: body.title,
                description: body.description,
                backgroundImage: body.backgroundImage,
                // Add any other fields that can be updated
            }
        })

        return updatedBoard
    } catch (error) {
        console.error('Error updating board:', error)

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
            statusMessage: 'Error updating board',
            stack: error instanceof Error ? error.stack : undefined
        })
    }
})