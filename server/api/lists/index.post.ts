import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.title || !body.boardId || body.order === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Title, boardId, and order are required'
        })
    }

    try {
        const newList = await prisma.list.create({
            data: {
                title: body.title,
                boardId: body.boardId,
                order: body.order
            }
        })

        return newList
    } catch (error) {
        console.error('Error creating list:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating list'
        })
    }
})