import { Request, Response } from 'express';
import { MovieModel } from '../models/Movie.model';


export const getAllMovies = async (req: Request, res: Response) => {
    try {
        const {genre, language} : {genre: string, language: string }= req.query as {genre: string, language: string}
        const movies = await MovieModel.findAll({genre, language});
        res.json({data: movies});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMovieById = async (req: Request, res: Response) => {
    try {
        const movie = await MovieModel.findById(parseInt(req.params.id));
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({data: movie});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
};

export const getRecommendedMovies = async (req: Request, res: Response) => {
    try {
        const movies = await MovieModel.findRecommended();
        res.json({data: movies});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recommended movies' });
    }
};

export const getMovieFilters = async (req: Request, res: Response) => {
    try{
        const filters = {
            genres: [
                {id: 'Action', name: 'Action'}, 
                {id: 'Comedy', name: 'Comedy'},
                {id: 'Drama', name: 'Drama'},
                {id: 'Sci-Fi', name: 'Sci-Fi'},
                {id: 'Thriller', name: 'Thriller'},
                {id: 'Romance', name: 'Romance'},
                {id: 'Horror', name: 'Horror'}
            ],
            languages: [
                {id: 'English', name: 'English'},
                {id: 'Hindi', name: 'Hindi'},
                {id: 'Telugu', name: 'Telugu'},
                {id: 'Kannada', name: 'Kannada'},
                {id: 'Tamil', name: 'Tamil'},
                {id: 'Malayalam', name: 'Malayalam'}
            ]                     
        }
        res.status(200).json({data: filters})
    }catch(err: any){
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
}

export const getMovieShows = async (req: Request, res: Response) => {
    try{
        const { movieId } = req.params;
        const shows = await MovieModel.findMovieShows(parseInt(movieId))
        res.json({success: true, data: shows})
    }catch(err: any){
        res.status(500).json({ error: 'Failed to fetch shows' });
    }
}

export const getMovieShowSeats = async (req: Request, res: Response) => {
    try{
        const { showId } = req.params;
        const seats = await MovieModel.findMovieShowSeats(parseInt(showId))
        res.json({success: true, data: seats})
    }catch(err: any){
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
}
