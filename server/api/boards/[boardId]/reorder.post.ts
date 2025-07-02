import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const boardId = event.context.params?.boardId

    if (!boardId) {
        console.error('Board ID is missing from the request')
        throw createError({
            statusCode: 400,
            statusMessage: 'Board ID is required'
        })
    }

    const body = await readBody(event)
    const { listIds } = body

    if (!Array.isArray(listIds) || listIds.length === 0) {
        console.error('Invalid listIds:', listIds)
        throw createError({
            statusCode: 400,
            statusMessage: 'listIds must be a non-empty array'
        })
    }

    try {
        // Verify that all listIds belong to the specified board
        const listsInBoard = await prisma.list.findMany({
            where: { boardId: boardId },
            select: { id: true }
        })
        const boardListIds = new Set(listsInBoard.map(list => list.id))
        const invalidListIds = listIds.filter(id => !boardListIds.has(id))

        if (invalidListIds.length > 0) {
            console.error('Invalid list IDs for this board:', invalidListIds)
            throw createError({
                statusCode: 400,
                statusMessage: `Some list IDs do not belong to this board: ${invalidListIds.join(', ')}`
            })
        }

        // Update the order of lists in the database
        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < listIds.length; i++) {
                await tx.list.update({
                    where: { id: listIds[i] },
                    data: { order: i }
                })
            }
        })

        // Fetch the updated lists to return
        const updatedLists = await prisma.list.findMany({
            where: { boardId: boardId },
            orderBy: { order: 'asc' },
            include: { cards: true }
        })

        console.log('Lists reordered successfully:', updatedLists.map(l => ({ id: l.id, order: l.order })))
        return updatedLists
    } catch (error) {
        console.error('Detailed error in reordering lists:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'An error occurred while reordering lists',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    } finally {
        await prisma.$disconnect()
    }
})