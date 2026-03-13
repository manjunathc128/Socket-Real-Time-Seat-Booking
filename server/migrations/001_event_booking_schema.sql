-- Event Booking System Database Schema
-- Run this after your existing users table

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    phone_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);


-- 1. Venues table
CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_name  VARCHAR(30)
);

-- 2. Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue_id INTEGER REFERENCES venues(id),
    event_date TIMESTAMP NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    poster_image VARCHAR(30) NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seats table (for seat-specific events)
CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    row_number VARCHAR(10) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOCKED', 'BOOKED')),
    locked_until TIMESTAMP NULL,
    locked_by INTEGER REFERENCES users(id) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, row_number, seat_number)
);

-- 4. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    seat_id INTEGER REFERENCES seats(id) NULL, -- NULL for general admission
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_order_id VARCHAR(255) NULL,
    payment_id VARCHAR(255) NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_method VARCHAR(50)
);
-- 5. Real-time sessions table (for tracking active users)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    socket_id VARCHAR(255) NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);-- Movies table
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    duration INTEGER, -- in minutes
    language VARCHAR(50),
    rating VARCHAR(10),
    release_date DATE,
    poster_image VARCHAR(255),
    backdrop_image VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMING_SOON')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movie shows/screenings table
CREATE TABLE IF NOT EXISTS movie_shows (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    show_date Date NOT NULL,
    show_time VARCHAR(20) NOT NULL CHECK (show_time IN ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT') ),
    price DECIMAL(10,2) NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movie_seats (
	id SERIAL PRIMARY KEY,
	movie_show_id INTEGER REFERENCES movie_shows(id) ON DELETE CASCADE,
	row_number VARCHAR(10) NOT NULL,
	seat_number VARCHAR(10) NOT NULL,
	status VARCHAR(10) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOCKED', 'BOOKED')),
	locked_until TIMESTAMP NULL,
	locked_by INTEGER REFERENCES users(id) NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(movie_show_id, row_number, seat_number)
)

CREATE TABLE IF NOT EXISTS movie_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    movie_show_id INTEGER REFERENCES movie_shows(id),
    movie_seat_id INTEGER REFERENCES movie_seats(id) ,
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    payment_order_id VARCHAR(255) NULL,
    payment_id VARCHAR(255) NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)




-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_seats_event_status ON seats(event_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_sessions_event ON user_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(payment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_order_id ON bookings(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_movies_status ON movies(status);
CREATE INDEX IF NOT EXISTS idx_movie_shows_movie ON movie_shows(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_shows_date ON movie_shows(show_date);
CREATE INDEX IF NOT EXISTS idx_movie_seats_show_status ON movie_seats(movie_show_id, status);

CREATE INDEX IF NOT EXISTS idx_movie_bookings_user ON movie_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_bookings_show ON movie_bookings(movie_show_id);
CREATE INDEX IF NOT EXISTS idx_movie_bookings_seat ON movie_bookings(movie_seat_id);
CREATE INDEX IF NOT EXISTS idx_movie_bookings_payment_id ON movie_bookings(payment_id);

-- Function to automatically release expired locks
CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS void AS $$
BEGIN
    UPDATE seats 
    SET status = 'AVAILABLE', 
        locked_until = NULL, 
        locked_by = NULL
    WHERE status = 'LOCKED' 
    AND locked_until < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_expired_movie_locks()
RETURNS void AS $$
BEGIN 
     UPDATE movie_seats
     SET status = 'AVAILABLE',
         locked_until = NULL,
         locked_by = NULL
     WHERE status = 'LOCKED'
     AND locked_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movies_updated_at ON movies;
CREATE TRIGGER update_movies_updated_at 
    BEFORE UPDATE ON movies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movie_shows_updated_at ON movie_shows;
CREATE TRIGGER update_movie_shows_updated_at 
    BEFORE UPDATE ON movie_shows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


DROP TRIGGER IF EXISTS update_movie_bookings_updated_at ON movie_bookings;
CREATE TRIGGER update_movie_bookings_updated_at
    BEFORE UPDATE ON movie_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--
