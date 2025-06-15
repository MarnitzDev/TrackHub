import { defineEventHandler, readBody, getQuery } from 'h3'
import prisma from '../db'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method

    try {
        switch (method) {
            case 'GET':
                // Fetch projects
                const { id } = getQuery(event)
                if (id) {
                    // Fetch a single project
                    return await prisma.project.findUnique({
                        where: { id: id as string },
                        include: { columns: true }
                    })
                } else {
                    // Fetch all projects
                    return await prisma.project.findMany({
                        include: { columns: true }
                    })
                }

            case 'POST':
                // Create a new project
                const newProjectData = await readBody(event)
                return await prisma.project.create({
                    data: {
                        title: newProjectData.title,
                        description: newProjectData.description,
                        userId: newProjectData.userId || undefined
                    }
                })

            case 'PUT':
                // Update a project
                const updateData = await readBody(event)
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