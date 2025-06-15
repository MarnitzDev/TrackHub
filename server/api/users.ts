
import { defineEventHandler, readBody } from 'h3'
import prisma from '../db'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method

    try {
        switch (method) {
            case 'POST':
                // Create or update a user
                const userData = await readBody(event)
                const user = await prisma.user.upsert({
                    where: { auth0Id: userData.auth0Id },
                    update: {
                        email: userData.email,
                        name: userData.name,
                    },
                    create: {
                        email: userData.email,
                        name: userData.name,
                        auth0Id: userData.auth0Id,
                    },
                })
                return user

            case 'GET':
                // Fetch a user by auth0Id
                const { auth0Id } = event.context.params
                if (!auth0Id) {
                    throw new Error('auth0Id is required')
                }
                const existingUser = await prisma.user.findUnique({
                    where: { auth0Id },
                })
                if (!existingUser) {
                    return { error: 'User not found' }
                }
                return existingUser

            case 'PUT':
                // Update an existing user
                const updateData = await readBody(event)
                const updatedUser = await prisma.user.update({
                    where: { auth0Id: updateData.auth0Id },
                    data: {
                        email: updateData.email,
                        name: updateData.name,
                    },
                })
                return updatedUser

            case 'DELETE':
                // Delete a user
                const deleteData = await readBody(event)
                await prisma.user.delete({
                    where: { auth0Id: deleteData.auth0Id },
                })
                return { message: 'User deleted successfully' }

            default:
                throw new Error(`Method ${method} Not Allowed`)
        }
    } catch (error) {
        console.error('Error in users API:', error)
        return { error: error.message }
    }
})