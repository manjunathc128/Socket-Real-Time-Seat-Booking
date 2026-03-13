import { Router } from 'express';
import { createBooking, getUserBookings , confirmBooking } from '../controllers/booking.controllers';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = Router();

// Booking routes (protected)
router.post('/create', authenticateToken, createBooking);
router.post('/', authenticateToken, getUserBookings);
router.post('/:bookingId/confirm', authenticateToken, confirmBooking );


export default router;