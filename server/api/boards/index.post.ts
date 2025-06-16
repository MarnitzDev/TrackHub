import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.title) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Title is required'
        })
    }

    try {
        const newBoard = await prisma.board.create({
            data: {
                title: body.title,
                description: body.description || ''
            }
        })
        return newBoard
    } catch (error) {
        console.error('Error creating board:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating board'
        })
    }
})