import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking.model';
import { EventModel } from '../models/Event.model';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'node:path';

export const createBooking = async (req: Request, res: Response) => {
    try{
        const { eventId, seatId, quantity} = req.body
        const userId = (req as any).user.id

        const event = await EventModel.findById(eventId)
        if(!event){
            return res.status(404).json({success: false, message: "Event not found"})

        }
        const totalAmount = event.price * quantity
        const bookingReference = `BK-${uuidv4().substring(0, 8).toUpperCase()}`;

        const booking = await BookingModel.create({
            user_id: userId,
            event_id: eventId,
            seat_id: seatId || null,
            quantity,
            total_amount: totalAmount,
            status: 'PENDING',
            booking_reference: bookingReference
        })
        res.status(201).json({success: true, data: booking});

    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
} 

export const getUserBookings = async (req: Request, res: Response) => {
    try{
        const userId = (req as any).user.id
        const bookings = await BookingModel.findByUser(userId)
        res.json({success: true, data: bookings})
    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
}

export const confirmBooking = async (req: Request, res: Response) => {
    try{
        const { bookingId } = req.params;
        const userId = (req as any).user.id;

        // verfiy booking belongs to user and is pending
        const booking = await BookingModel.findById(parseInt(bookingId))
        if(!booking || booking.user_id !== userId || booking.status !== 'PENDING'){
            return res.status(400).json({success: false, message: 'Invalid booking'})
        }

        const confirmed = await BookingModel.confirmBooking(parseInt(bookingId))
        if(!confirmed){
            return res.status(400).json({success: false, message: 'Failed to confirm booking'})
        }
        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            bookingReference: booking.booking_reference
        })

    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
}