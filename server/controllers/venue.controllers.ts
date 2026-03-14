import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { VenueModel } from '../models/Venue.model';

export const getAllVenues = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const offset = parseInt(req.params.offset)  || 0
        const limit = parseInt(req.params.limit) || 10

        if(offset < 0 || (limit < 0 || limit > 20)){
            res.status(400).json({success: false, error: 'Invalid offset or limit values'})
        }
        const result = await VenueModel.findAllVenues(offset, limit)
        
        res.status(200).json({success: true, data: result, message: 'Venues fetched successfully'})
    
    }catch(err: any){
        console.error('Error in getAllVenues controller:', err);
        res.status(500).json({success: false, error: err.message})
    }
}

export const getRecommendedVenues = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 1;
        const venues = await VenueModel.findRecommended(limit, offset);
        res.status(200).json({success: true, data: venues, message: 'Venues fetched successfully'});
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch recommended venues' });
    }
};

export const getVenueFilters = async (req: Request, res: Response) => {
    try{    
        const venues = await VenueModel.findAllForFilter();
        res.json({data: venues})
    }catch(err: any){
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
}
