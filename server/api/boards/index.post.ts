import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'
import path from 'path'

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
            update: {},
            create: {
                email: session.user.email,
                name: session.user.name || null,
            },
        })

        // Extract only the filename from the backgroundImage path
        const backgroundImageName = body.backgroundImage ? path.basename(body.backgroundImage) : null

        // Now create the board and link it to the user
        const newBoard = await prisma.board.create({
            data: {
                title: body.title,
                description: body.description,
                backgroundImage: backgroundImageName,
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