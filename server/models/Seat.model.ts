import pool from './database'

export interface Seat {
    id: number;
    event_id: number;
    row_number: string;
    seat_number: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
    locked_until?: Date;
    locked_by?: number;
    created_at: Date;
}

export class SeatModel {
    static async generateSeatsForEvent(eventId: number, totalSeats: number, seatsPerRow: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Generate row letters A, B, C, etc.
            const totalRows = Math.ceil(totalSeats / seatsPerRow);
            let seatCount = 0;
            
            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                const rowLetter = String.fromCharCode(65 + rowIndex); // A=65, B=66, C=67...
                
                for (let seatNum = 1; seatNum <= seatsPerRow && seatCount < totalSeats; seatNum++) {
                    await client.query(
                        'INSERT INTO seats (event_id, row_number, seat_number, status) VALUES ($1, $2, $3, $4)',
                        [eventId, rowLetter, seatNum.toString(), 'AVAILABLE']
                    );
                    seatCount++;
                }
            }
            
            await client.query('COMMIT');
            return { success: true, totalSeats: seatCount };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
}

    static async lockSeat(seatId: number, userId: number, lockDuration: number = 300): Promise<boolean> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Lock the seat row for update
            const seatResult = await client.query(
                'SELECT * FROM seats WHERE id = $1 AND status = $2 FOR UPDATE',
                [seatId, 'AVAILABLE']
            );
            
            if (seatResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false;
            }
            
            // Lock the seat
            const lockUntil = new Date(Date.now() + lockDuration * 1000);
            await client.query(
                'UPDATE seats SET status = $1, locked_until = $2, locked_by = $3 WHERE id = $4',
                ['LOCKED', lockUntil, userId, seatId]
            );
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getEventSeats(eventId: number): Promise<Seat[]> {
        const result = await pool.query(
            'SELECT * FROM seats WHERE event_id = $1 ORDER BY row_number, seat_number',
            [eventId]
        );
        return result.rows;
    }

    static async findById(seatId: number): Promise<Seat | null> {
        const result = await pool.query(
            'SELECT * FROM seats WHERE id = $1',
            [seatId]
        );
        return result.rows[0] || null;
    }
    static async releaseExpiredLocks(): Promise<void> {
        await pool.query('SELECT release_expired_locks()');
    }
}