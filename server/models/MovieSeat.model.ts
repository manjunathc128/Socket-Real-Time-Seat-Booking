import pool from './database';


export interface MovieSeat {
    id: number;
    movie_show_id: number;
    row_number: string;
    seat_number: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
    locked_until?: Date;
    locked_by?: number;
    created_at: Date;
}

export class MovieSeatModel {
    static async generateSeatsForShow(showId: number, totalSeats: number, seatsPerRow: number ){
        const client = await pool.connect();

        try{
            await client.query('BEGIN');

            const totalRows = Math.ceil(totalSeats / seatsPerRow);
            let seatCount = 0;

                for(let rowIndex = 0; rowIndex < totalRows; rowIndex++){
                    const rowLetter = String.fromCharCode(65 + rowIndex);

                    for(let seatNum = 1; seatNum <= seatsPerRow && seatCount < totalSeats; seatNum++){
                        await client.query(
                            `INSERT INTO movie_seats (movie_show_id, row_number, seat_number, status) 
                            VALUES ($1, $2, $3, $4)`,
                            [showId, rowLetter, seatNum.toString(), 'AVAILABLE']
                        )
                        seatCount++;
                    } 
                }  
            await client.query('COMMIT');
            return {success: true, totalSeats: seatCount}
            }catch(err){           
                        await client.query('ROLLBACK');
                        throw err
                    }
                
            finally{
                    client.release();  
            }
        }


        static async lockSeat(seatId: number, userId: number, lockDuration: number = 300): Promise<boolean> {
            const client = await pool.connect();
            try{
                await client.query('BEGIN');

                const seatResult = await client.query(
                    'SELECT * FROM movie_seats WHERE id = $1 AND status = $2 FOR UPDATE',
                    [seatId, 'AVAILABLE']
                )

                if(seatResult.rows.length === 0){
                    await client.query('ROLLBACK');
                    return false;
                }
                const lockUntil = new Date(Date.now() + lockDuration * 1000);
                await client.query(
                    `UPDATE movie_seats SET  status = $1, locked_until = $2, locked_by = $3 
                    WHERE id = $4`,
                    ['LOCKED', lockUntil, userId, seatId]
                );
                await client.query('COMMIT');
                return true;
            }catch(err){
                await client.query('ROLLBACK');
                throw err;
            }finally{
                client.release()
            }    
        
        }


       static async getShowSeats(showId: number): Promise<MovieSeat[]> {
        const result = await pool.query(
            `SELECT * FROM movie_seats WHERE movie_show_id = $1 ORDER BY row_number, seat_number
            `, [showId]
        )
        return result.rows;
    }

    static async findById(seatId: number): Promise<MovieSeat | null> {
        try{
            const result = await pool.query(
                'SELECT * FROM movie_seats WHERE id = $1',
                [seatId]
            )
            return result.rows[0] || null
        
            }
        catch(err){
            throw err

        }    
    }  

    static async releaseExpiredLocks(): Promise<void> {
        await pool.query(
            `UPDATE movie_seats 
             SET status = 'AVAILABLE', locked_until = NULL, locked_by = NULL
             WHERE status = 'LOCKED' AND locked_until < NOW()
            `
        )
    }
}    