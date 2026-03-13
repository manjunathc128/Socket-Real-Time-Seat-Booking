import pool from './database';

export interface Event {
    id: number;
    title: string;
    description?: string;
    venue_id: number;
    event_date: Date;
    price: number;
    poster_image?: string;
    total_seats: number;
    available_seats: number;
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
    created_at: Date;
    updated_at: Date;
}


export class EventModel {
    static async findById(id: number): Promise<Event | null> {
        const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    static async findEventsByVenueId(venueId: number, offset: number = 0, limit: number = 10): Promise<Event[] | null> {
        const result = await pool.query(`
            SELECT * FROM events WHERE venue_id = $1
            AND status = $2 ORDER BY event_date ASC OFFSET $3 LIMIT $4
        `, [venueId, 'ACTIVE', offset, limit]);
        return result.rows || null;
    }

    static async findAll(): Promise<Event[]> {
        const result = await pool.query('SELECT * FROM events WHERE status = $1 ORDER BY id', ['ACTIVE']);
        return result.rows;
    }

    static async findRecommended(limit: number = 10): Promise<Event[]> {
        const result = await pool.query(
            'SELECT * FROM events WHERE status = $1 ORDER BY event_date DESC LIMIT $2',
            ['ACTIVE', limit]
        )
        return result.rows;
    }

    static async create(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
        const { title, description, venue_id, event_date, price, total_seats, available_seats, status } = eventData;
        const result = await pool.query(
            `INSERT INTO events (title, description, venue_id, event_date, price, total_seats, available_seats, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [title, description, venue_id, event_date, price, total_seats, available_seats, status]
        );
        return result.rows[0];
    }
}
