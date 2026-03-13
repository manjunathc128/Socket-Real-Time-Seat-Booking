import { MovieSeatModel } from '../models/MovieSeat.model';
import { MovieModel } from '../models/Movie.model';
import { Request, Response } from 'express';

export const  generateMovieShowsAndSeats = async (req: Request, res: Response) => {
    try{
        const {movieId} = req.params;
        const { showDate, price,totalSeats, availableSeats, seatsPerRow, showTimes } = req.body
        if(!showTimes || !Array.isArray(showTimes) || showTimes.length === 0){
            return res.status(400).json({error: 'showTimes is required and must be a non-empty array'})
        }

        const validShowTimes = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

        for (const showTime of showTimes){
            if(!validShowTimes.includes(showTime)){
                return res.status(400).json({error: `Invalid showTime: ${showTime}. Valid values are: ${validShowTimes.join(', ')}`})
            }
        }

        for (const showTime of showTimes) {
            const show = await MovieModel.createMovieShow(
                parseInt(movieId),
                showTime,
                showDate,
                price,
                totalSeats,
                availableSeats,
                'ACTIVE'
            )
            await MovieSeatModel.generateSeatsForShow(show.id, totalSeats, seatsPerRow )
        }
        res.json({
            success: true,
            message:   `Generated ${showTimes.length} shows with ${totalSeats} seats each  for movie ${movieId}`
        })

    }catch(err: any){
        res.status(500).json({error: err.message})
    }
}

export const lockMovieSeat = async (req: Request, res: Response) => {
    try {
        const { seatId, showId } = req.body;
        const userId = (req as any).user.id;

        await MovieSeatModel.releaseExpiredLocks();
        const locked = await MovieSeatModel.lockSeat(parseInt(seatId), userId, 300);

        if (!locked) {
            return res.status(409).json({
                success: false,
                message: 'Seat is not available'
            });
        }

        const seat = await MovieSeatModel.findById(parseInt(seatId));

        const io = req.app.get('io');
        if (io && seat) {
            
        } 
        return res.json({
            success: true,
            message: 'Seat locked successfully',
            data: seat,
            lockDuration: 300
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getMovieShowSeats = async (req: Request, res: Response) => {
    try {
        const { showId }= req.params ;
        await MovieSeatModel.releaseExpiredLocks();
        const seats = await MovieSeatModel.getShowSeats(parseInt(showId));
        
        const groupedSeats = seats.reduce((acc, seat) => {
            if (!acc[seat.row_number]) {
                acc[seat.row_number] = [];
            }
            acc[seat.row_number].push(seat);
            return acc;
        }, {} as Record<string, typeof seats>);

        res.json({ success: true, data: groupedSeats });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

