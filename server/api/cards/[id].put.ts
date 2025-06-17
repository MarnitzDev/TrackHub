import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params.id
    const body = await readBody(event)

    console.log('Received update data:', body)

    try {
        const updatedCard = await prisma.card.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                order: body.order,
                listId: body.listId,
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