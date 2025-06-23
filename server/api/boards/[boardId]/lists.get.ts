import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const boardId = event.context.params?.boardId

        if (!boardId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Board ID is required'
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
            statusCode: 500,
            statusMessage: 'Error fetching lists',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})