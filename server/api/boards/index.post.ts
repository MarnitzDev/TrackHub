import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)

    if (!session || !session.user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: User not authenticated'
        })
    }

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
                description: body.description,
                user: {
                    connect: {
                        id: session.user.id
                    }
                }
            }
        })

        return newBoard
    } catch (error) {
        console.error('Error creating board:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Error creating board: ${error.message}`
        })
    }
})