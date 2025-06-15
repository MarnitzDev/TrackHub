
import { defineEventHandler, readBody, getQuery } from 'h3'
import prisma from '../db'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method

    try {
        switch (method) {
            case 'GET':
                // Fetch projects
                const { id, userId } = getQuery(event)
                if (id) {
                    // Fetch a single project
                    return await prisma.project.findUnique({
                        where: { id: id as string },
                        include: { columns: true }
                    })
                } else if (userId) {
                    // Fetch all projects for a specific user
                    return await prisma.project.findMany({
                        where: { userId: userId as string },
                        include: { columns: true }
                    })
                } else {
                    // Fetch all projects (consider adding pagination for large datasets)
                    return await prisma.project.findMany({
                        include: { columns: true }
                    })
                }

            case 'POST':
                const body = await readBody(event)
                if (body.action === 'addColumn') {
                    // Add a new column to the project
                    const { projectId, title } = body
                    if (!projectId || !title) {
                        throw new Error('Project ID and column title are required')
                    }
                    const lastColumn = await prisma.column.findFirst({
                        where: { projectId },
                        orderBy: { position: 'desc' },
                    })
                    const newPosition = lastColumn ? lastColumn.position + 1 : 0
                    return await prisma.column.create({
                        data: {
                            title,
                            position: newPosition,
                            projectId,
                        }
                    })
                } else {
                    // Create a new project
                    const { title, description, userId } = body
                    if (!title || !userId) {
                        throw new Error('Project title and user ID are required')
                    }
                    return await prisma.project.create({
                        data: {
                            title,
                            description,
                            userId,
                        }
                    })
                }

            case 'PUT':
                // Update a project
                const updateData = await readBody(event)
                if (!updateData.id) {
                    throw new Error('Project ID is required')
                }
                return await prisma.project.update({
                    where: { id: updateData.id },
                    data: {
                        title: updateData.title,
                        description: updateData.description
                    }
                })

            case 'DELETE':
                // Delete a project
                const { id: deleteId } = getQuery(event)
                if (!deleteId) {
                    throw new Error('Project ID is required')
                }
                // First, delete all columns associated with the project
                await prisma.column.deleteMany({
                    where: { projectId: deleteId as string }
                })
                // Then delete the project
                return await prisma.project.delete({
                    where: { id: deleteId as string }
                })

            default:
                throw new Error(`Method ${method} Not Allowed`)
        }
    } catch (error) {
        console.error('Error in projects API:', error)
        return { error: error.message }
    }
})