import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const boardId = event.context.params?.boardId
    const { listIds } = await readBody(event)

    if (!boardId || !listIds || !Array.isArray(listIds)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request'
        })
    }

    try {
        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < listIds.length; i++) {
                await tx.list.update({
                    where: { id: listIds[i] },
                    data: { order: i }
                })
            }
        })

        return { message: 'Lists reordered successfully' }
    } catch (error) {
        console.error('Error reordering lists:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to reorder lists'
        })
    }
})