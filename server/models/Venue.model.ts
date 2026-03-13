import pool from './database'

export class VenueModel {
    static async findAllVenues(offset: number = 0, limit: number = 10 ) {
        try{
            const query = `
               SELECT 
                    v.id, 
                    v.name, 
                    v.address, 
                    v.capacity, 
                    v.image_name,
                    v.created_at,
                COUNT(*) OVER() as total_count
               FROM venues  v
               ORDER BY v.id ASC
               LIMIT $1 OFFSET $2 
            `
           const res =  await pool.query(query, [limit, offset])

           return {

            venues : res.rows.map(row => ({
                id: row.id,
                name: row.name,
                address: row.address,
                capacity: row.capacity,
                description: row.description,
                image_name: row.image_name,
                created_at: row.created_at,
            
            })),
            total_count: parseInt(res.rows[0]?.total_count) || 0,
            offset: offset,
            limit: limit,

           }


        }catch(err){
            throw new Error(err)
        }
    } 

    static async findRecommended(limit: number = 10, offset: number = 1) {
        try{
            const query = `
                SELECT id, name, address, capacity, image_name, created_at
                FROM venues
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2 
            `;
            const res = await pool.query(query, [limit, offset]);

            return {

                venues : res.rows.map(row => ({
                    id: row.id,
                    title: row.name,
                    address: row.address,
                    capacity: row.capacity,
                    description: row.description,
                    image_name: row.image_name,
                    created_at: row.created_at,
                
                })),
                total_count: parseInt(res.rows[0]?.total_count) || 0,
                offset: offset,
                limit: limit,

            }

        }catch(err: any){
            throw new Error(err)
        }
    
    }

    static async findAllForFilter(){
        try{
            const query = `
                SELECT id, name FROM venues;
            `
            const res = await pool.query(query)
            return res.rows
        }catch(err: any){
            throw new Error(err)
        }
    }
}