import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { createMovieBooking, getUserMovieBookings } from '../controllers/movieBooking.controllers';

const router = Router();

router.post('/', authenticateToken, createMovieBooking);
router.get('/user', authenticateToken, getUserMovieBookings);

export default router;
