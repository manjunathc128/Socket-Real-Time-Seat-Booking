import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { lockSeat, getEventSeats,generateSeatsForEvent } from '../controllers/seat.controllers';

const router: Router = Router();
router.post('/:eventId/generate-seats', authenticateToken, generateSeatsForEvent);
router.post('/lock', authenticateToken, lockSeat);
router.get('/', authenticateToken, getEventSeats);

export default router;