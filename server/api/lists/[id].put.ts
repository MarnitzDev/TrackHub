
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'List ID is required',
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
            where: { id },
            data: { title: body.title },
        })

        return updatedList
    } catch (error) {
        console.error('Error updating list:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'An error occurred while updating the list',
        })
    }
})