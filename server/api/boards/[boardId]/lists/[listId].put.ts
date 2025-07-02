import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const boardId = event.context.params?.boardId
    const listId = event.context.params?.listId

    if (!boardId || !listId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Board ID and List ID are required',
        })
    }

    const body = await readBody(event)

    if (!body.title) {
        throw createError({
            statusCode: 400,
            statusMessage: 'List title is required',
        })
    }

    try {
        const updatedList = await prisma.list.update({
            where: {
                id: listId,
                boardId: boardId // Ensure the list belongs to the correct board
            },
            data: {
                title: body.title,
                // You can add other fields to update here if needed
            },
        })

        return updatedList
    } catch (error) {
        console.error('Error updating list:', error)
        if (error.code === 'P2025') {
            throw createError({
                statusCode: 404,
                statusMessage: 'List not found or does not belong to the specified board',
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'An error occurred while updating the list',
        })
    }
})