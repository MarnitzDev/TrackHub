import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { title, description, listId } = body

    if (!title || !listId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Title and listId are required'
        })
    }

    try {
        const newCard = await prisma.card.create({
            data: {
                title,
                description,
                listId,
            },
        })
        return newCard
    } catch (error) {
        console.error('Error creating card:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating card'
        })
    }
})