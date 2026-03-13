import fs from 'fs';
import path from 'path';
import pool from '../models/database';

export async function runMigrations() {
    try {
        console.log('🚀 Running database migrations...');
        
        const migrationPath = path.join(__dirname, '../migrations/001_event_booking_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        await pool.query(migrationSQL);
        
        console.log('✅ Database migrations completed successfully');
        
        // Insert sample data
        // await insertSampleData();
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

async function insertSampleData() {
    try {
        console.log('📝 Inserting sample data...');
        
        // Insert sample venue
        const venueResult = await pool.query(`
            INSERT INTO venues (name, address, capacity) 
            VALUES ('Tech Conference Hall', '123 Tech Street, Silicon Valley', 100)
            ON CONFLICT DO NOTHING
            RETURNING id
        `);
        
        let venueId;
        if (venueResult.rows.length > 0) {
            venueId = venueResult.rows[0].id;
        } else {
            const existingVenue = await pool.query('SELECT id FROM venues LIMIT 1');
            venueId = existingVenue.rows[0]?.id;
        }
        
        if (venueId) {
            // Insert sample event
            const eventResult = await pool.query(`
                INSERT INTO events (title, description, venue_id, event_date, price, total_seats, available_seats) 
                VALUES (
                    'JavaScript Conference 2024', 
                    'Annual JavaScript developers conference', 
                    $1, 
                    $2, 
                    99.99, 
                    100, 
                    100
                )
                ON CONFLICT DO NOTHING
                RETURNING id
            `, [venueId, new Date('2024-12-31 10:00:00')]);
            
            const eventId = eventResult.rows[0]?.id;
            
            if (eventId) {
                // Insert sample seats (10 rows, 10 seats each)
                const seatInserts = [];
                for (let row = 1; row <= 10; row++) {
                    for (let seat = 1; seat <= 10; seat++) {
                        seatInserts.push(`(${eventId}, 'R${row}', 'S${seat}')`);
                    }
                }
                
                await pool.query(`
                    INSERT INTO seats (event_id, row_number, seat_number) 
                    VALUES ${seatInserts.join(', ')}
                    ON CONFLICT DO NOTHING
                `);
                
                console.log('✅ Sample data inserted successfully');
            }
        }
        
    } catch (error: any) {
        console.log('⚠️  Sample data insertion failed (might already exist):', error.message);
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
            console.log('🎉 Setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error);
            process.exit(1);
        });
}