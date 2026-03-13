import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config()
const pool = new Pool({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
})


pool.on('connect', () => console.log('Connected to PostgreSQL database'))
pool.on('error', (err) => console.error('Error connecting to PostgreSQL database', err))    

export const testConnection = async () => {
    try{
        const result = await pool.query('SELECT NOW()') ;
        console.log('Connected to PostgreSQL database', result.rows[0].now)
    }catch(err){
        console.error('Error connecting to PostgreSQL database', err)
    }
}


export default pool;