import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        // Check user authentication
        const session = await getServerSession(event)
        if (!session || !session.user || !session.user.email) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized: User not authenticated'
            })
        }

        const boardId = event.context.params?.boardId

        if (!boardId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Board ID is required'
            })
        }

        // Check if the board exists and belongs to the user
        const board = await prisma.board.findFirst({
            where: {
                id: boardId,
                user: {
                    email: session.user.email
                }
            }
        })

        if (!board) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Board not found or access denied'
            })
        }

        const lists = await prisma.list.findMany({
            where: { boardId },
            include: {
                cards: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })

        return lists
    } catch (error) {
        console.error('Error fetching lists:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Error fetching lists',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})