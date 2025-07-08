import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'
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
        let user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || null,
                }
            })
        }

        const backgroundImage = body.backgroundImage
            ? path.basename(body.backgroundImage)
            : undefined

        const newBoard = await prisma.board.create({
            data: {
                title: body.title,
                description: body.description || '',
                ...(backgroundImage && { backgroundImage }),
                userId: user.id
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