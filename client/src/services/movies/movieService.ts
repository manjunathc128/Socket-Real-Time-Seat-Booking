import api from '../axiosService';

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
  data: [
    genres: [
      {id: number, name: string}
    ],
    languages: [
      {id: number, name: string}
    ],
  ]
}

export const movieService = {
  getRecommended: async (): Promise<recommendedMovies> => api.get('api/movies/recommended'),
  
  getAll: async (param : {genre: string | null, language: string | null}) => api.get('api/movies', {params: param}),

  getById: async (id: number): Promise<MovieById>  => api.get(`api/movies/${id}`),

  getMoviesFilters : async () : Promise<MovieFilterRes> => api.get('api/movies/filters'),

  getMovieShows : async (movieId: number) => api.get(`api/movies/${movieId}/shows`),

  getMovieShowSeats : async (showId: number) => api.get(`api/movies/shows/${showId}/seats`, {params: {showId}})
};
