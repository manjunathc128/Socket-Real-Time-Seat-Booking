import {Request, Response } from 'express';
import { EventModel } from '../models/Event.model';

export const getAllEvents = async (req: Request, res: Response) => {
    try{
        const events = await EventModel.findAll()
        res.status(200).json({success: true, data: events})
    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
}

export const getEventById = async (req: Request, res: Response) => {
    try{
        const {id} = req.params
        const event = await EventModel.findById(parseInt(id))
        if( !event ) {
            return res.status(404).json({success: false, message: 'Event not found'})
        }
        res.json({success: true, data: event, message:'Event fetched successfully'})
    } catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
}

export const getEventListById = async (req: Request, res: Response) => {
    try{
        const {id, offset = '0', limit = '10'} = req.query

        console.log('req param id', id , typeof id)
        
        if (!id || typeof id !== 'string') {
            return res.status(400).json({success: false, message: 'Invalid ID parameter'})
        }
        
        const parsedId = parseInt(id)
        const parsedOffset = parseInt(offset as string) || 0 ;
        const parsedLimit = parseInt(limit as string) || 10;
        
        if (isNaN(parsedId)) {
            return res.status(400).json({success: false, message: 'Invalid ID parameter'})
        }
        
        const event = await EventModel.findEventsByVenueId(parsedId, parsedOffset, parsedLimit)
        if(!event){
            return res.status(404).json({success: false, message: 'Event not found'})  
        }
        res.json({success: true, data: event, message:'Event fetched successfully'})
    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
}

export const getRecommendedEvents = async (req: Request, res: Response) => {
    try{
        const limit = parseInt(req.params.limit) || 10;
        const events = await EventModel.findRecommended(limit)
        res.json({success: true, data: events})
    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }
}