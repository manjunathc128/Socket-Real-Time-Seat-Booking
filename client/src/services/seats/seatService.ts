import api from "../axiosService";

export interface Seat {
    id: number;
    event_id: number;
    row_number: string;
    seat_number: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
    locked_until?: Date;
    locked_by?: number;
    created_at: Date;
}


interface SeatResponse {
    success: boolean;
    data: Record<string, Seat[]>
    message: string
}

interface LockSeatResponse {
    success: boolean;
    data: Seat;
    message: string;
}

export interface seatService {
    getSeatsByEventId : (params :{eventId: number}) =>  Promise<SeatResponse>;
    lockSeat: ({seatId, eventId}: {seatId: number, eventId: number}) => Promise<LockSeatResponse>;
}

export const seatService: seatService = {
    getSeatsByEventId : (params: {eventId: number}) => api.get('/api/seats/', {params: params}),
    lockSeat: ({seatId, eventId}: {seatId: number, eventId: number}) => api.post('/api/seats/lock', {seatId: seatId, eventId: eventId })
}