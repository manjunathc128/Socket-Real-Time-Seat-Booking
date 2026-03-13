import pool from "./database";

export interface Booking {
    id: number;
    user_id: number;
    event_id: number;
    seat_id?: number;
    quantity: number;
    total_amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    booking_reference: string;
    created_at: Date;
    updated_at: Date;
}

export class BookingModel {
    static async create(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
        const { user_id, event_id, seat_id, quantity, total_amount, status, booking_reference } = bookingData;
        const result = await pool.query(
            `INSERT INTO bookings (user_id, event_id, seat_id, quantity, total_amount, status, booking_reference) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, event_id, seat_id, quantity, total_amount, status, booking_reference]
        );
        return result.rows[0];
    }

    static async findByUser(userId: number): Promise<Booking[]> {
        const result = await pool.query(
            'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    static async findById(bookingId: number): Promise<Booking | null> {
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        return result.rows[0] || null;
    }

    static async confirmBooking(bookingId: number): Promise<boolean> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Get booking details
            const bookingResult = await client.query(
                'SELECT * FROM bookings WHERE id = $1 AND status = $2',
                [bookingId, 'PENDING']
            );
            
            if (bookingResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false;
            }
            
            const booking = bookingResult.rows[0];
            
            // Update seat status to BOOKED if seat-specific
            if (booking.seat_id) {
                await client.query(
                    'UPDATE seats SET status = $1, locked_until = NULL, locked_by = NULL WHERE id = $2',
                    ['BOOKED', booking.seat_id]
                );
            }
            
            // Update booking status
            await client.query(
                'UPDATE bookings SET status = $1 WHERE id = $2',
                ['CONFIRMED', bookingId]
            );
            
            // Update event available seats
            await client.query(
                'UPDATE events SET available_seats = available_seats - $1 WHERE id = $2',
                [booking.quantity, booking.event_id]
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

    static async updatePaymentOrderId(bookingId: number, orderId: string) : Promise<boolean> {
        try{
            const result = await pool.query('UPDATE bookings SET payment_order_id = $1 WHERE id = $2', 
                [orderId, bookingId]
            );

            return result.rowCount == null ? false :  result?.rowCount > 0;
        } catch (error) {
            console.error('Error updating payment order ID:', error);
            return false 
        }
    }

    static async updatePaymentDetails(bookingId: number, paymentData: {
        payment_id: string;
        order_id: string;
        payment_status: string;
        payment_method: string
    }): Promise<boolean> {
        try{
            const result = await pool.query(`
                UPDATE bookings
                SET payment_id = $1, 
                    payment_order_id = $2, 
                    payment_status = $3, 
                    payment_method = $4, 
                    updated_at = NOW()
                WHERE id = $5    
                `, [
                    paymentData.payment_id,
                    paymentData.order_id,
                    paymentData.payment_status,
                    paymentData.payment_method,
                    bookingId
                ]
            );

            return  result.rowCount == null ? false :  result?.rowCount > 0;
        } catch (error) {
            console.error('Error updating payment details:', error);
            return false 
        }
    }
}