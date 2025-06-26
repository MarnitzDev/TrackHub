import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const body = await readBody(event)

    console.log('Received update data for board:', body)

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Board ID is required'
        })
    }

    if (!body.title && !body.description && body.backgroundImage === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No valid fields to update'
        })
    }

    try {
        const updatedBoard = await prisma.board.update({
            where: { id },
            data: {
                ...(body.title !== undefined && { title: body.title }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.backgroundImage !== undefined && { backgroundImage: body.backgroundImage }),
            },
        })

        return updatedBoard
    } catch (error) {
        console.error('Error updating board:', error)

        if (error.code === 'P2025') {
            throw createError({
                statusCode: 404,
                statusMessage: 'Board not found'
            })
        }

        throw createError({
            statusCode: 500,
            statusMessage: `Error updating board: ${error.message}`
        })
    }
})