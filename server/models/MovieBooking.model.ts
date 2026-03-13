import pool from "./database";


export interface MovieBooking {
    id: number;
    user_id: number;
    movie_show_id: number;
    movie_seat_id?: number;
    quantity: number;
    total_amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    booking_reference: string;
    created_at: Date;
    updated_at: Date;
}

export class MovieBookingModel {

    static async create(bookingData: Omit<MovieBooking, 'id' | 'created_at' | 'updated_at'>): Promise<MovieBooking> {
        const client = await pool.connect()
        try{
            const { user_id, movie_show_id, movie_seat_id, quantity, total_amount, status, booking_reference } = bookingData;
            await client.query('BEGIN');
            const result = await client.query(
                `INSERT INTO movie_bookings (user_id, movie_show_id, movie_seat_id, quantity, total_amount, status, booking_reference)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [user_id, movie_show_id, movie_seat_id, quantity, total_amount, status, booking_reference]
                )
            await client.query('COMMIT');
                return result.rows[0];
        }catch(error){
            console.error('Error creating movie booking:', error);
            await client.query('ROLLBACK');
            throw error;
        }finally{
            client.release();
        }
    }

    static async findByUser(userId: number) : Promise<MovieBooking[]> {
        const result = await pool.query(
            `SELECT * FROM movie_bookings WHERE user_id = $1 ORDER_BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }    
    static async findById(bookingId: number): Promise<MovieBooking | null>  {
        const result = await pool.query(
            `SELECT * FROM movie_bookings WHERE id = $1`, [bookingId]
        );
        return result.rows[0] || null
    }

    static async confirmBooking(bookingId: number): Promise<boolean> {
        const client = await pool.connect();

        try{
            await client.query('BEGIN')

            const bookingResult = await client.query(
                `SELECT * FROM movie_bookings WHERE id = $1 AND status = $2`,
                [bookingId, 'PENDING']
            )

            if (bookingResult.rows.length === 0){
                await client.query(
                    `ROLLBACK`
                );
                return false
            }

            const booking = bookingResult.rows[0];

            if(booking.movie_seat_id){
                await client.query(
                    `UPDATE movie_seats SET status = $1, locked_until = NULL, locked_by = NULL WHERE id = $2`,
                    ['BOOKED', booking.movie_seat_id]
                )
            }

            await client.query(
                'UPDATE movie_bookings SET status = $1 WHERE id = $2',
                ['CONFIRMED', bookingId]
            );

            await client.query(
                'UPDATE movie_shows SET available_seats = available_seats - $1 WHERE id = $2',
                [booking.quantity, booking.movie_show_id]
            );

            await client.query('COMMIT');
            return true;
        }catch(error){
            await client.query('ROLLBACK');
            throw error;
        }finally{
            client.release();
        }
    }

    static async updatePaymentOrderId(bookingId: number, orderId: string) : Promise<boolean> {
        const result = await pool.query(
            `UPDATE movie_bookings SET payment_order_id = $1, updated_at = NOW() WHERE id = $2`,
            [orderId, bookingId]
        );
        return result.rowCount ? result.rowCount > 0 : false;    
    }

    static async updatePaymentDetails(bookingId: number, paymentData: {
        payment_id: string;
        order_id: string;
        payment_status: string;
        payment_method: string;
    }) : Promise<boolean>{
        const result = await pool.query(
            `UPDATE movie_bookings 
            SET payment_id = $1,
                payment_order_id = $2,
                payment_status = $3,
                payment_method = $4,
                updated_at = NOW()
            WHERE id = $5
            `, [paymentData.payment_id, paymentData.order_id, paymentData.payment_status, paymentData.payment_method, bookingId]
        )
        return result.rowCount ? result.rowCount > 0: false ;
    }
}