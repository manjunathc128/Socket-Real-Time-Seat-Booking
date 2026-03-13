import pool from './database';

export interface Movie {
    id: number;
    title: string;
    description?: string;
    genre?: string;
    duration?: number;
    language?: string;
    rating?: string;
    release_date?: Date;
    poster_image?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'COMING_SOON';
    created_at: Date;
    updated_at: Date;
}

export interface MovieShow {
    id: number;
    movie_id:number;
    show_time : 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    Show_date: Date;
    price: number;
    total_seats: number;
    available_seats: number;
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface MovieSeat {
    id: number;
    movie_show_id: number;
    row_number: string;
    seat_number: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
    locked_until?: Date;
    locked_by?: number;
}

export class MovieModel {
    static async findAll({genre, language}: {genre: string, language: string}): Promise<Movie[]> {
        const result = await pool.query(
            `SELECT * FROM movies 
                WHERE status IN ($1, $2) 
                AND genre ILIKE $3 AND language ILIKE $4
                ORDER BY release_date ASC
            `,
            ['ACTIVE', 'COMING_SOON', genre, language]
        );
        return result.rows;
    }

    static async findById(id: number): Promise<Movie | null> {
        const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    static async findRecommended(limit: number = 10): Promise<Movie[]> {
        const result = await pool.query(
            'SELECT * FROM movies WHERE status = $1 ORDER BY created_at DESC LIMIT $2',
            ['ACTIVE', limit]
        );
        return result.rows;
    }
    static async findMovieShows(movieId: number): Promise<MovieShow[]> {
        const result = await pool.query(
            'SELECT * FROM movie_shows WHERE movie_id = $1 AND status = $2 ORDER BY show_time',
            [movieId, 'ACTIVE']
        );
        return result.rows;
    }

    static async findMovieShowSeats(showId: number): Promise<Record<string, MovieSeat[]>> {
        const result = await pool.query(
            'SELECT * FROM movie_seats WHERE movie_show_id = $1 ORDER BY row_number, seat_number',
            [showId]
        );
        
        return result.rows.reduce((acc: Record<string, MovieSeat[]>, seat: MovieSeat) => {
            if (!acc[seat.row_number]) acc[seat.row_number] = [];
            acc[seat.row_number].push(seat);
            return acc;
        }, {});
    }

    static async findShowById(showId: number) : Promise<MovieShow | null> {
        const result = await pool.query(
            `SELECT * FROM movie_shows WHERE id = $1`,
            [showId]
        )
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    static async createMovieShow(movieId: number, showTime: string, showDate: Date, price: number, totalSeats: number, availableSeats: number, status: string){
        const client = await pool.connect();
        try{
            
            await client.query('BEGIN');

            let res = await client.query(
                `INSERT INTO movie_shows (movie_id, show_time, show_date, price, total_seats, available_seats, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [movieId, showTime, showDate, price, totalSeats, availableSeats, status]
            )
            await client.query('COMMIT');
            return res.rows[0];
        }catch(error){
            console.error('Error creating movie show:', error);
            throw error;
        }finally{
            client.release();
        }
    }
}
