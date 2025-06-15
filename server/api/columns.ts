import { defineEventHandler, readBody, getQuery } from 'h3'
import prisma from '../db'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method

    try {
        switch (method) {
            case 'GET':
                // Fetch columns
                const { projectId } = getQuery(event)
                if (!projectId) {
                    throw new Error('Project ID is required')
                }
                return await prisma.column.findMany({
                    where: { projectId: projectId as string },
                    orderBy: { position: 'asc' },
                    include: { tasks: true }
                })

            case 'POST':
                // Add a new column
                const newColumnData = await readBody(event)
                return await prisma.column.create({
                    data: {
                        title: newColumnData.title,
                        position: newColumnData.position,
                        projectId: newColumnData.projectId
                    }
                })

            case 'PUT':
                // Update a column
                const updateData = await readBody(event)
                return await prisma.column.update({
                    where: { id: updateData.id },
                    data: {
                        title: updateData.title,
                        position: updateData.position
                    }
                })

            case 'DELETE':
                // Remove a column
                const { id } = getQuery(event)
                if (!id) {
                    throw new Error('Column ID is required')
                }
                return await prisma.column.delete({
                    where: { id: parseInt(id as string) }
                })

            default:
                throw new Error(`Method ${method} Not Allowed`)
        }
    } catch (error) {
        console.error('Error in columns API:', error)
        return { error: error.message }
    }
})