import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    try {
        const user = await prisma.user.upsert({
            where: { auth0Id: body.auth0Id },
            update: {
                email: body.email,
                name: body.name
            },
            create: {
                email: body.email,
                name: body.name,
                auth0Id: body.auth0Id
            }
        })

        return user
    } catch (error) {
        console.error('Error saving user:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Error saving user: ${error.message}`
        })
    }
})