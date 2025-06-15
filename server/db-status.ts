import { pool } from '../database'

export default defineEventHandler(async (event) => {
    try {
        await pool.query('SELECT 1')
        return { status: 'Connected to PostgreSQL successfully!' }
    } catch (error) {
        console.error('PostgreSQL connection error:', error)
        return { status: 'Failed to connect to PostgreSQL' }
    }
})