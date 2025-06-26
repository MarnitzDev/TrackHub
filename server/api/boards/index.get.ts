
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

        // Fetch all boards for the user
        const boards = await prisma.board.findMany({
            where: {
                user: {
                    email: session.user.email
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                lists: {
                    include: {
                        cards: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        return boards
    } catch (error) {
        console.error('Error fetching boards:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Error fetching boards',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})