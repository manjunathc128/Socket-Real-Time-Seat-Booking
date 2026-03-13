import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, SimpleGrid, Text, Loader, Center, Pagination } from '@mantine/core';
import { fetchEventsById } from '@/redux/event/eventSlice';
import { fetchVenueFilters } from '@/redux/venues/venueSlice';
import { RootState, AppDispatch } from '@/redux/store';
import FilterList from '@/components/FilterList';
import ItemCard from '@/features/home/ItemCard';

const Events = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading: eventsLoading } = useSelector((state: RootState) => state.event);
  const { venueFilters, loading: filtersLoading } = useSelector((state: RootState) => state.venue);
  
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    dispatch(fetchVenueFilters());
  }, [dispatch]);

  useEffect(() => {
    if (selectedVenue) {
      const offset = (page - 1) * limit;
      dispatch(fetchEventsById({id: selectedVenue, offset, limit}));
    }
  }, [dispatch, selectedVenue, page]);

  const filters = [
    {
      title: 'Venues',
      options: Array.isArray(venueFilters) ? venueFilters : [],
      selected: selectedVenue,
      onChange: (venueId: number | null) => {
        setSelectedVenue(venueId);
        setPage(1);
      }
    }
  ];

  if (eventsLoading || filtersLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="xl" py="xl">
      <Grid>
        <Grid.Col span={3}>
          <FilterList filters={filters} />
        </Grid.Col>
        <Grid.Col span={9}>
          <Text size="xl" fw={600} mb="md">Events in Bengaluru</Text>
          {selectedVenue ? (
            <>
              <SimpleGrid cols={3} spacing="lg">
                {events?.data?.map((event: any) => (
                  <ItemCard key={event.id} item={event} type="event" />
                ))}
              </SimpleGrid>
              {events?.data && events.data.length > 0 && (
                <Center mt="xl">
                  <Pagination value={page} onChange={setPage} total={Math.ceil(events.data.length / limit)} />
                </Center>
              )}
            </>
          ) : (
            <Text c="dimmed">Select a venue to view events</Text>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Events;
