import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)

    if (!session || !session.user || !session.user.email) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: User not authenticated or email not available'
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
        // First, ensure the user exists in the database
        const user = await prisma.user.upsert({
            where: { email: session.user.email },
            update: {}, // No updates needed if the user exists
            create: {
                email: session.user.email,
                name: session.user.name || null,
                // Add any other fields that are required for your User model
            },
        })

        // Now create the board and link it to the user
        const newBoard = await prisma.board.create({
            data: {
                title: body.title,
                description: body.description,
                user: {
                    connect: {
                        email: session.user.email
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