import { Router } from 'express';
import { getAllMovies, getMovieById, getRecommendedMovies, getMovieFilters, getMovieShows} from '../controllers/movie.controllers';
import { generateMovieShowsAndSeats, lockMovieSeat, getMovieShowSeats } from '../controllers/movieSeat.controllers';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = Router();

router.get('/', getAllMovies);
router.get('/recommended', authenticateToken , getRecommendedMovies);
router.get('/filters', getMovieFilters);
router.get('/:id', getMovieById);
router.get('/:movieId/shows', authenticateToken, getMovieShows);
router.get('/shows/:showId/seats', authenticateToken, getMovieShowSeats)
router.post('/:movieId/generate-shows', authenticateToken, generateMovieShowsAndSeats)

router.post('/seats/lock', authenticateToken, lockMovieSeat)

export default router;


// api/movies/seats?