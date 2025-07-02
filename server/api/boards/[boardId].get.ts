import { PrismaClient } from '@prisma/client'

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
        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                lists: {
                    include: {
                        cards: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        if (!board) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Board not found'
            })
        }

        return board
    } catch (error) {
        console.error('Error fetching board:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching board'
        })
    }
})