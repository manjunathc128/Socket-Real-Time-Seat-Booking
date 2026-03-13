import { Request, Response } from "express";
import { MovieBookingModel } from "../models/MovieBooking.model";
import { MovieModel } from "../models/Movie.model";
import { v4 as uuidv4 } from 'uuid';

export const createMovieBooking = async (req: Request, res: Response) => {
    try {
        const { showId, seatId, quantity } = req.body;
        const userId = (req as any).user.id;

        const show = await MovieModel.findShowById(showId);
        if (!show) {
            return res.status(404).json({ success: false, message: "Show not found" });
        }

        const totalAmount = show.price * quantity;
        const bookingReference = `MB-${uuidv4().substring(0, 8).toUpperCase()}`;

        const booking = await MovieBookingModel.create({
            user_id: userId,
            movie_show_id: showId,
            movie_seat_id: seatId || null,
            quantity,
            total_amount: totalAmount,
            status: 'PENDING',
            booking_reference: bookingReference
        });

        res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserMovieBookings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const bookings = await MovieBookingModel.findByUser(userId);
        res.json({ success: true, data: bookings });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
