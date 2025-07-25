import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Read the request body
    const body = await readBody(event)

    // Validate the request body
    if (!body || !body.title || !body.listId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Title and listId are required'
        })
    }

    try {
        const newCard = await prisma.card.create({
            data: {
                title: body.title,
                description: body.description || '',
                listId: body.listId,
                order: body.order || 0,
                // Add any other fields that are part of your Card model
            }
        })

        return { message: 'Card created successfully', card: newCard }
    } catch (error) {
        console.error('Error creating card:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma error code:', error.code)
            console.error('Prisma error message:', error.message)

            if (error.code === 'P2003') {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid listId: The specified list does not exist'
                })
            }
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating card',
            stack: error instanceof Error ? error.stack : undefined
        })
    }
})