import { lockSeat } from '@/redux/seats/seatSlice';
import api from '../axiosService';

export const movieBookingService = {
    lockSeat :  (seatId: number, showId: number) => api.post('/api/movies/seats/lock', {seatId, showId}),
    createBooking : (showId: number, seatId: number, quantity: number) =>   api.post('/api/movie-bookings', {showId, seatId, quantity}), 
    createPaymentOrder : (bookingId: number) => api.post('/api/movie-payments/create-order', {bookingId}),
    verifyPayment : (paymentData: any) => api.post('/api/movie-payments/verify', paymentData)


}