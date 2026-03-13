import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { createMoviePaymentOrder, verifyMoviePayment } from '../controllers/moviePayment.controllers';

const router: Router = Router();

router.post('/create-order', authenticateToken, createMoviePaymentOrder);
router.post('/verify', authenticateToken, verifyMoviePayment);

export default router;
