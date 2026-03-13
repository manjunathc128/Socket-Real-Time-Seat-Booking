import pool from './database';


export interface User {
    id: number;
    username: string;
    email?: string | null;
    full_name?: string | null;
    phone_number?: string | null;
    password: string;
    created_at: Date;
}

export class UserModel {
    static async findByUsername(username: string): Promise<User>{
        try{
            const query = 'SELECT * FROM users WHERE username = $1'
            const result =  await pool.query(query, [username]);
            return result.rows.length > 0 && result.rows[0];
        }catch(err){
            console.error('Error finding user by username:', err);
            throw err
        }
    }
    static async createUser(username: string, password: string): Promise<User>{
        try{
            const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *'
            const result = await pool.query(query, [username, password]);
            return result.rows[0];
        }catch(err){
            console.error('Error creating user:', err);
            throw err
        }
    }

}