import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Text, Paper, SegmentedControl, Box } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchMovieById, fetchMovieShows, fetchMovieShowSeats } from '@/redux/movies/movieSlice';
import { useSocket } from '@/context/SocketContext';
import MovieHeader from './MovieHeader';
import MovieSeatSelection from './MovieSeatSelection';

const MovieDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket();
  const { movieById, movieShows, movieSeats, loading } = useSelector((state: RootState) => state.movies);
  const [selectedShowTime, setSelectedShowTime] = useState<string>('');

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieById(Number(id)));
      dispatch(fetchMovieShows(Number(id)));
    }
    if(socket) {
      socket.emit('joinMovie', Number(id));
      return () => {
        socket.emit('leaveMovie', Number(id))
      }
    }
  }, [id, dispatch, socket]);

  useEffect(() => {
    const selectedShow = movieShows?.find(s => s.show_time === selectedShowTime);
    if (selectedShow) {
      dispatch(fetchMovieShowSeats(selectedShow.id));
    }
  }, [selectedShowTime, movieShows, dispatch]);

  if (loading || !movieById) return <Text>Loading...</Text>;

  const selectedShow = movieShows?.find(s => s.show_time === selectedShowTime);

  return (
    <Box>
      <MovieHeader movie={movieById.data} />

      <Container size="xl" py="xl">
        {movieShows && movieShows.length > 0 && (
          <Paper p="xl" shadow="sm" mb="xl">
            <Text size="lg" fw={600} mb="md">Select Show Time</Text>
            <SegmentedControl
              value={selectedShowTime}
              onChange={setSelectedShowTime}
              data={movieShows.map(show => ({
                value: show.show_time,
                label: `${show.show_time} - ₹${show.price}`
              }))}
            />
            
            {selectedShowTime && movieSeats && selectedShow && (
              <Box mt="xl">
                <Text size="lg" fw={600} mb="md">Select Your Seats</Text>
                <MovieSeatSelection 
                  seats={movieSeats} 
                  showId={selectedShow.id}
                  showPrice={selectedShow.price}
                  onPaymentSuccess={() => dispatch(fetchMovieShowSeats(selectedShow.id))}
                />
              </Box>
            )}
          </Paper>
        )}

        <Paper p="xl" shadow="sm">
          <Text size="lg" fw={600} mb="md">About the movie</Text>
          <Text>{movieById.data.description}</Text>
        </Paper>
      </Container>
    </Box>
  );
};

export default MovieDetails;
