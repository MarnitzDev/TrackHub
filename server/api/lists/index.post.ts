import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        // Validate the request body
        if (!body.title || !body.boardId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Title and boardId are required'
            })
        }

        // Create a new list
        const newList = await prisma.list.create({
            data: {
                title: body.title,
                boardId: body.boardId,
            }
        })

        return newList

    } catch (error) {
        console.error('Error creating list:', error)

        if (error.code === 'P2003') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid boardId provided'
            })
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'An error occurred while creating the list'
        })
    }
})