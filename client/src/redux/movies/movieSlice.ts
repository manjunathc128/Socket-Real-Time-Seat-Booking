import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { movieService } from '@/services/movies/movieService';
import { movieBookingService } from '@/services/movies/movieBooking.service';

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  release_date: string;
  poster: string;
  trailer_url: string;
  rating: number;
}

interface recommendedMovies {
    data: Movie[]
}

interface MovieById {
  data: Movie
}

interface MovieFilterRes {
  data: {
    genres: [
      {id: number, name: string}
    ],
    languages: [
      {id: number, name: string}
    ],
  }
}

export interface MovieShow {
    id: number;
    movie_id:number;
    show_time : 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    Show_date: Date;
    price: number;
    total_seats: number;
    available_seats: number;
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface MovieSeat {
    id: number;
    movie_show_id: number;
    row_number: string;
    seat_number: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
    locked_until?: Date;
    locked_by?: number;
}


export const fetchRecommendedMovies = createAsyncThunk
  < 
    recommendedMovies,
    void,
    {rejectValue: string} 
  >
(
  'movies/fetchRecommended',
  async (_, {rejectWithValue}) => {
    try{
    return await movieService.getRecommended();
    }catch(err: any){
      return rejectWithValue(err.response.data.error)
    }
  }
);

export const fetchAllMovies = createAsyncThunk
<
void,
{genre: string | null, language: string | null},
{rejectValue: string}

>
(
  'movies/fetchAll',
  async (params, thunkAPI) => {
    try{
      return await movieService.getAll(params);
    }catch(err: any){
      console.log(err, 'on fetch events')
      const errorRes = err.response.data.error || 'failed'
      return thunkAPI.rejectWithValue(errorRes)
    }  
  }
);

export const fetchMovieById = createAsyncThunk
<
  MovieById,
  number,
  {rejectValue: string}
>(
  'movies/fetchById',
  async (id: number, thunkAPI) => {
    try{
      return await movieService.getById(id);
    }catch(err: any){
      thunkAPI.rejectWithValue(err.response.data.error || 'error')
    }  
  }
);

export const fetchMovieFilters = createAsyncThunk
<MovieFilterRes, void, {rejectValue: string}>
(
  'movies/fetchFilters',
  async(_, {rejectWithValue}) => {
    try{
      return await movieService.getMoviesFilters();
    }catch(err: any){
      return rejectWithValue(err.response.data.error)
    }
  }
)

export const fetchMovieShows = createAsyncThunk
<MovieShow[], number, {rejectValue: string}>
(
  'movies/fetchShows',
  async(movieId: number, {rejectWithValue}) => {
    try{
      const res = await movieService.getMovieShows(movieId);
      return res.data;
    }catch(err: any){
      return rejectWithValue(err.response.data.error)
    }
  }
)

export const fetchMovieShowSeats = createAsyncThunk
<MovieSeat[], number, {rejectValue: string}>
(
  'movies/fetchSeats',
  async(showId: number, {rejectWithValue}) => {
    try{
      const res = await movieService.getMovieShowSeats(showId);
      return res.data;
    }catch(err: any){
      return rejectWithValue(err.response.data.error)
    }
  }
)

export const lockMovieSeat = createAsyncThunk<
  any,
  { seatId: number; showId: number },
  { rejectValue: string }
>(
  'movies/lockSeat',
  async ({ seatId, showId }, { rejectWithValue }) => {
    try {
      return await movieBookingService.lockSeat(seatId, showId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to lock seat');
    }
  }
);

export const createMovieBooking = createAsyncThunk<
  any,
  { showId: number; seatId: number; quantity: number },
  { rejectValue: string }
>(
  'movies/createBooking',
  async ({ showId, seatId, quantity }, { rejectWithValue }) => {
    try {
      return await movieBookingService.createBooking(showId, seatId, quantity);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create booking');
    }
  }
);

interface initialState {
  recommendedMovies: [];
  loading: boolean;
  error: string | null;
  movieById: MovieById | null;
  movieFilters: MovieFilterRes["data"] | {
    genres: [],
    languages: []
  };
  movieShows: MovieShow[] | null;
  movieSeats: Record<string, MovieSeat[] > | null;
}

const iniitialState : initialState = {
    recommendedMovies: [],
    loading: false,
    error: null,
    movieById: null,
    movieFilters: {
        genres: [],
        languages: []
    },
    movieShows: null,
    movieSeats: null,
}


const movieSlice = createSlice({
  name: 'movies',
  initialState: iniitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendedMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecommendedMovies.fulfilled, (state, action) => {
        state.recommendedMovies = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchRecommendedMovies.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch recommended movies';
        state.loading = false;
      })
      .addCase(fetchAllMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllMovies.fulfilled, (state, action) => {
        state.recommendedMovies = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchAllMovies.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch all movies';
        state.loading = false;
      })
      .addCase(fetchMovieById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.movieById = action.payload;
        state.loading = false;
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch movie';
        state.loading = false;
      })
      .addCase(fetchMovieFilters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMovieFilters.fulfilled, (state, action) => {
        state.movieFilters = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchMovieFilters.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch filters';
        state.loading = false;
      })
      .addCase(fetchMovieShows.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMovieShows.fulfilled, (state, action) => {
        state.movieShows = action.payload;
        state.loading = false;
      })
      .addCase(fetchMovieShows.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch shows';
        state.loading = false;
      })
      .addCase(fetchMovieShowSeats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMovieShowSeats.fulfilled, (state, action) => {
        state.movieSeats = action.payload;
        state.loading = false;
      })
      .addCase(fetchMovieShowSeats.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch seats';
        state.loading = false;
      })
  },
});

export default movieSlice.reducer;
