import api from "../axiosService";

interface Booking {
    id: number;
    user_id: number;
    event_id: number;
    seat_id?: number;
    quantity: number;
    total_amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    booking_reference: string;
}

interface CreateBookingResponse {
    success: boolean;
    data: Booking;
}

export const bookingService = {
    createBooking: (data: {
        eventId : number;
        seatId: number;
        quantity: number;

    }): Promise<CreateBookingResponse> => api.post('/api/bookings/create', data),
    getUserBookings: (): Promise<{success: boolean; data: Booking[]}> => api.post('/api/bookings/')
}