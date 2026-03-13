import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, SimpleGrid, Text, Loader, Center } from '@mantine/core';
import { fetchAllMovies, fetchMovieFilters } from '@/redux/movies/movieSlice';
import { RootState, AppDispatch } from '@/redux/store';
import FilterList from '@/components/FilterList';
import ItemCard from '@/features/home/ItemCard';

const Movies = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recommendedMovies, movieFilters, loading } = useSelector((state: RootState) => state.movies);
  
  const [selectedGenre, setSelectedGenre] = useState<string  | null>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string  | null>('');

  useEffect(() => {
    dispatch(fetchMovieFilters());
    dispatch(fetchAllMovies({genre: selectedGenre, language: selectedLanguage}));
  }, [dispatch, selectedGenre, selectedLanguage]);

  const filters = [
    {
      title: 'Genres',
      options: movieFilters && movieFilters.genres ? movieFilters.genres : [] ,
      selected: selectedGenre,
      onChange: setSelectedGenre
    },
    {
      title: 'Languages',
      options: movieFilters && movieFilters.languages ? movieFilters.languages : [],
      selected: selectedLanguage,
      onChange: setSelectedLanguage
    }
  ];

  if (loading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="xl" py="xl">
      <Grid>
        <Grid.Col span={3}>
          <FilterList filters={filters} multiple={true}  />
        </Grid.Col>
        <Grid.Col span={9}>
          <Text size="xl" fw={600} mb="md">Movies in Bengaluru</Text>
          <SimpleGrid cols={3} spacing="lg">
            {recommendedMovies?.map((movie: any) => (
              <ItemCard key={movie.id} item={movie} type="movie" />
            ))}
          </SimpleGrid>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Movies;
