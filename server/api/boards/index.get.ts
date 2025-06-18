import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const session = await getServerSession(event)

        if (!session || !session.user || !session.user.email) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized: User not authenticated or email not available'
            })
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            })
        }

        // Fetch boards for the user
        const boards = await prisma.board.findMany({
            where: {
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return boards
    } catch (error) {
        console.error('Error fetching boards:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching boards'
        })
    }
})