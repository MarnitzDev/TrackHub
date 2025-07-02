import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const cardId = event.context.params?.cardId

    if (!cardId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Card ID is required'
        })
    }

    // Read the request body
    const body = await readBody(event)

    // Validate the request body
    if (!body || Object.keys(body).length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Request body is required'
        })
    }

    try {
        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: {
                title: body.title,
                description: body.description,
                listId: body.listId,
                order: body.order,
                // Add any other fields that can be updated
            }
        })

        return { message: 'Card updated successfully', updatedCard }
    } catch (error) {
        console.error('Error updating card:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma error code:', error.code)
            console.error('Prisma error message:', error.message)

            if (error.code === 'P2025') {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Card not found'
                })
            }
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Error updating card',
            stack: error instanceof Error ? error.stack : undefined
        })
    }
})