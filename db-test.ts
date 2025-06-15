import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database');

        // Test basic connection
        const timeRes = await client.query('SELECT NOW()');
        console.log('Current time from database:', timeRes.rows[0].now);

        // Get table names in the database
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `);
        const tables = tablesRes.rows.map(row => row.table_name);
        console.log('Tables in the database:', tables);

        // Retrieve data from all tables
        for (const table of tables) {
            try {
                const dataRes = await client.query(`SELECT * FROM "${table}" LIMIT 10`);
                console.log(`\nData from table '${table}' (first 10 rows):`);
                console.log(dataRes.rows);

                // Get column information for the table
                const columnRes = await client.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = $1;
                `, [table]);
                console.log(`\nColumns in '${table}':`);
                console.log(columnRes.rows);
            } catch (tableErr) {
                console.error(`Error querying table '${table}':`, tableErr.message);
            }
        }

        client.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        await pool.end();
    }
}

testConnection();