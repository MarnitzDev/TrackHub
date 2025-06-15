import { pool } from '~/server/database'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method
    const query = getQuery(event)
    const body = await readBody(event)

    if (method === 'GET') {
        const result = await pool.query('SELECT * FROM tasks WHERE profile_id = $1', [query.userId])
        return result.rows
    } else if (method === 'POST') {
        // Handle POST request
        const { userId, title, description, status, columnId, position } = body
        const result = await pool.query(
            'INSERT INTO tasks (profile_id, title, description, status, column_id, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, title, description, status, columnId, position]
        )
        return result.rows[0]
    } else if (method === 'PUT') {
        // Handle PUT request
        const { taskId, updates, userId } = body
        const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 3}`).join(', ')
        const values = Object.values(updates)
        const result = await pool.query(
            `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $1 AND profile_id = $2 RETURNING *`,
            [taskId, userId, ...values]
        )
        return result.rows[0]
    } else if (method === 'DELETE') {
        // Handle DELETE request
        const { taskId, userId } = body
        await pool.query('DELETE FROM tasks WHERE id = $1 AND profile_id = $2', [taskId, userId])
        return { success: true }
    }
})