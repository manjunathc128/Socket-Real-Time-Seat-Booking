import pool from './database';

export interface UserSession {
    id: number;
    user_id: number;
    event_id: number;
    socket_id: string;
    last_activity: Date;
    created_at: Date;
}

export class UserSessionModel {
    static async createOrUpdate(userId: number, eventId: number, socketId: string): Promise<void>{
        await pool.query(`
            INSERT INTO user_sessions (user_id, event_id, socket_id, last_activity)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (user_id, event_id)
            DO UPDATE SET
                socket_id = $3,
                last_activity = NOW()
            `, [userId, eventId, socketId])
    }

    static async getActiveUsersForEvent(eventId: number): Promise<UserSession[]>{
        const result = await pool.query(`
            SELECT us.* , u.username   
            FROM user_sessions us
            JOIN users u ON us.user_id = u.id
            WHERE us.event_id = $1
            AND us.last_activity > NOW() - INTERVAL '5 minutes'
            `, [eventId])
        return result.rows    
    }

    static async removeBySocketId(socketId: string): Promise<void> {
        await pool.query(`
                DELETE FROM user_sessions
                WHERE socket_id = $1
                `, [socketId]
            );
            
    }

    static async updateActivity(socketId: string): Promise<void> {
        await pool.query(`
            UPDATE user_sessions
            SET last_activity = NOW()
            WHERE socket_id = $1
            `, [socketId]
       )
    }

    static async cleanupInactiveSessions(): Promise<void> {
        await pool.query(`
            DELETE FROM user_sessions
            WHERE last_activity < NOW() - INTERVAL '10 minutes'
            `)
    }
}