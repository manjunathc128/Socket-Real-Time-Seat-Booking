import { Router } from 'express';
import { getAllEvents, getEventListById, getRecommendedEvents, getEventById } from '../controllers/event.controllers';
import { authenticateToken } from '../middleware/auth.middleware';
const router: Router = Router();

// Event routes

router.get('/', authenticateToken, getAllEvents);
router.get('/venue' , authenticateToken, getEventListById);
router.get('/recommended/:id', authenticateToken, getRecommendedEvents);
router.get('/:id', authenticateToken, getEventById)
// router.get('/,:id', getEventListById);

export default router;