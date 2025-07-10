import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

console.log('Prisma instance created')

export default prisma