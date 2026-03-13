import { Container, Title, Box } from '@mantine/core';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendedMovies } from '@/redux/movies/movieSlice';
import { fetchRecommendedEvents } from '@/redux/event/eventSlice';
import { fetchRecommendedVenues } from '@/redux/venues/venueSlice';
import { RootState, AppDispatch } from '@/redux/store';
import CarouselSection from './CarouselSection';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recommendedMovies } = useSelector((state: RootState) => state.movies);
  const { recommendedVenues } = useSelector((state: RootState) => state.venue);
  const { events } = useSelector((state: RootState) => state.event);

  useEffect(() => {
    try{
        dispatch(fetchRecommendedMovies());
        dispatch(fetchRecommendedVenues({offset:1, limit: 10}));
    }catch(err){
        console.error("Error fetching data:", err);
    }
  }, [dispatch]);

  return (
    <Box bg="#F8F9FA" mih="100vh" py="xl">
      <Container size="xl">
        <CarouselSection title="Recommended Movies" items={recommendedMovies} type="movie" />
        <CarouselSection title="Upcoming Events on Venues" items={recommendedVenues?.data?.venues} type="venue" />
      </Container>
    </Box>
  );
};

export default Home;
