import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params.id
    const body = await readBody(event)

    console.log('Received update data:', body)

    // Ensure that at least one field is being updated
    if (!body.title && !body.description && body.order === undefined && !body.listId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No valid fields to update'
        })
    }

    try {
        const updatedCard = await prisma.card.update({
            where: { id },
            data: {
                ...(body.title !== undefined && { title: body.title }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.order !== undefined && { order: body.order }),
                ...(body.listId !== undefined && { listId: body.listId }),
            },
        })

        return updatedCard
    } catch (error) {
        console.error('Error updating card:', error)

        if (error.code === 'P2025') {
            throw createError({
                statusCode: 404,
                statusMessage: 'Card not found'
            })
        }

        throw createError({
            statusCode: 500,
            statusMessage: `Error updating card: ${error.message}`
        })
    }
})