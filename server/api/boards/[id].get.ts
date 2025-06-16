import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params.id

    try {
        const board = await prisma.board.findUnique({
            where: { id },
            include: {
                lists: {
                    include: {
                        cards: true
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