import {Request, Response} from 'express';

import { SeatModel } from '../models/Seat.model';
import { UserSessionModel } from '../models/UserSession.model';


export const generateSeatsForEvent = async (req: Request, res: Response) => {
    try{
        const { eventId, totalSeats, seatsPerRow } = req.body;

        await SeatModel.generateSeatsForEvent(eventId, totalSeats, seatsPerRow);
        res.json({success: true, message: 'Seats generated successfully'})
    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
}

export const lockSeat = async (req: Request, res: Response) => {
    try {
        const { seatId, eventId } = req.body;

        console.log('🔒 Lock request:', { seatId, eventId, type: typeof seatId });

        const userId = (req as any).user.id;

        await SeatModel.releaseExpiredLocks()
        const locked = await SeatModel.lockSeat(parseInt(seatId), userId, 300)

        if(!locked) {
            return res.status(409).json({
                success: false,
                message: 'Seat is not available'
            })
        }

        const seat = await SeatModel.findById(parseInt(seatId))
         console.log('📍 Seat locked:', seat);
        const activeUsers = await UserSessionModel.getActiveUsersForEvent(eventId)
         console.log('👥 Active users for event:', activeUsers.length, activeUsers.map(u => ({id: u.user_id, socket: u.socket_id})));

        const io = req.app.get('io')

        if(!io) {
            console.error('❌ Socket.IO instance not found');
        }        
        let emittedCount = 0;
        activeUsers.forEach(user => {
            if(user.user_id !== userId){
                console.log(`📤 Emitting to user ${user.user_id} (socket: ${user.socket_id})`);
                io.to(user.socket_id).emit('seatStatusChanged', {
                    seatId: parseInt(seatId),
                    status: 'LOCKED',
                    lockedBy: userId,
                    expiresIn: 300, //  (req as any).user.username,
                    seat: seat
                });
                emittedCount++;
            }else{
              console.log(`⏭️  Skipping current user ${user.user_id}`);  
            }
        })
        // if(seat){
        //     const io = req.app.get('io');
        //     io.to(`event_${seat.event_id}`).emit('seatStatusChanged', {
        //         seatId: parseInt(seatId),
        //         status: 'LOCKED',
        //         lockedBy: userId,
        //         expiresIn: 300
        //     })
        // }
        console.log(`✅ Emitted seatStatusChanged to ${emittedCount} users`);
        return res.json({
            success: true,
            message: 'Seat locked successfully',
            data: seat,
            lockDuration: 300
        })

    }catch(err: any){
        console.error('❌ Lock seat error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const getEventSeats = async (req: Request, res: Response) => {
    try{    
        const eventId = req.query.eventId as string;
        await SeatModel.releaseExpiredLocks()
        const seats = await SeatModel.getEventSeats(parseInt(eventId));
        const groupedSeats =  seats.reduce((acc, seat) => {
            if(!acc[seat.row_number]){
               acc[seat.row_number] = []     
            }
            acc[seat.row_number].push(seat);
            return acc
        }, {} as Record<string, typeof seats>) 

        res.json({success: true, data: groupedSeats, message: 'Seats fetched successfully'})
    }catch(error: any){
        res.status(500).json({sucess: false, message: error.message})
    }
}