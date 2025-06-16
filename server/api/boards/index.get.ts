import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const boards = await prisma.board.findMany()
        return boards
    } catch (error) {
        console.error('Error fetching boards:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching boards'
        })
    }
})