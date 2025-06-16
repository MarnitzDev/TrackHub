import { defineEventHandler, readBody, getQuery } from 'h3'
import prisma from '../db'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method
    const query = getQuery(event)

    try {
        switch (method) {
            case 'GET':
                // Fetch tasks
                const { projectId, columnId } = query
                console.log('Received GET request with query:', query)
                if (!projectId) {
                    console.error('Project ID is missing in the request')
                    throw createError({
                        statusCode: 400,
                        message: 'Project ID is required'
                    })
                }
                console.log('Fetching tasks for project:', projectId)
                try {
                    const whereClause: any = { projectId: projectId as string }
                    if (columnId) {
                        whereClause.columnId = columnId as string
                    }
                    const tasks = await prisma.task.findMany({
                        where: whereClause,
                        orderBy: { position: 'asc' }
                    })
                    console.log('Fetched tasks:', tasks)
                    return tasks
                } catch (error) {
                    console.error('Error fetching tasks:', error)
                    throw createError({
                        statusCode: 500,
                        message: 'Failed to fetch tasks',
                        cause: error
                    })
                }

            case 'POST':
                // Add a new task
                const newTaskData = await readBody(event)
                console.log('Received task data:', JSON.stringify(newTaskData, null, 2))

                if (!newTaskData.title || !newTaskData.projectId || !newTaskData.columnId) {
                    console.error('Missing required fields:', {
                        title: newTaskData.title,
                        projectId: newTaskData.projectId,
                        columnId: newTaskData.columnId
                    })
                    throw createError({
                        statusCode: 400,
                        message: 'Task title, project ID, and column ID are required'
                    })
                }

                try {
                    const newTask = await prisma.task.create({
                        data: {
                            title: newTaskData.title,
                            description: newTaskData.description || '',
                            status: newTaskData.status || 'todo',
                            position: newTaskData.position || 0,
                            projectId: newTaskData.projectId,
                            columnId: newTaskData.columnId,
                            userId: newTaskData.userId
                        }
                    })
                    console.log('Created task:', newTask)
                    return newTask
                } catch (error) {
                    console.error('Error creating task:', error)
                    throw createError({
                        statusCode: 500,
                        message: 'Failed to create task',
                        cause: error
                    })
                }

            case 'PUT':
                // Update a task
                const updateData = await readBody(event)
                if (!updateData.id) {
                    throw new Error('Task ID is required for update')
                }
                return await prisma.task.update({
                    where: { id: updateData.id },
                    data: {
                        title: updateData.title,
                        description: updateData.description,
                        status: updateData.status,
                        position: updateData.position,
                        columnId: updateData.columnId
                    }
                })

            case 'DELETE':
                // Remove a task
                const { id } = getQuery(event)
                if (!id) {
                    throw new Error('Task ID is required')
                }
                return await prisma.task.delete({
                    where: { id: id as string }
                })

            default:
                throw new Error(`Method ${method} Not Allowed`)
        }
    } catch (error) {
        console.error('Error in tasks API:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'An error occurred while processing the request'
        })
    }
})