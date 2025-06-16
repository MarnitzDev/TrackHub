import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const cards = await prisma.card.findMany()
        return cards
    } catch (error) {
        console.error('Error fetching cards:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching cards'
        })
    }
})