import { Router } from 'express';
import { getAllVenues, getRecommendedVenues, getVenueFilters } from '../controllers/venue.controllers';
import { authenticateToken } from '../middleware/auth.middleware';

const VenueRouter: Router = Router()

VenueRouter.get('/', getAllVenues)
VenueRouter.get('/recommended', getRecommendedVenues)
VenueRouter.get('/filters', authenticateToken, getVenueFilters)

export default VenueRouter;