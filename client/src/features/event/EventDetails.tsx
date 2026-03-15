import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Image, Text, Group, Badge, Stack, Paper } from '@mantine/core';
import { IconStar, IconCalendar, IconMapPin } from '@tabler/icons-react';
import { getEventImage } from '@/utils/movieImageMapping';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchEventById } from '@/redux/event/eventSlice';
import { fetchSeatsByEventId } from '@/redux/seats/seatSlice';
import SeatSelection from '@/features/seats/SeatSelection';
import { useSocket } from '@/context/SocketContext';

const EventDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { event, loading } = useSelector((state: RootState) => state.event);
  const socket = useSocket();

  useEffect(() => {
    (async () => {
        if (id) {
            await dispatch(fetchEventById(Number(id)));
            await dispatch(fetchSeatsByEventId({ eventId: Number(id) }));
        }
    })()
  }, [id, dispatch]);

  useEffect(() => {
    if(socket?.connected && id){
      socket.emit('joinEvent', Number(id));

      return () => {
        socket.emit('leaveEvent', Number(id))
      }
    }
  }, [socket?.connected, id])


  if (loading || !event) return <Text>Loading...</Text>;

  return (
    <Box>
      <Box
        style={{
          backgroundImage: `linear-gradient(90deg, rgb(26, 26, 26) 24.97%, rgb(26, 26, 26) 38.3%, rgba(26, 26, 26, 0.04) 97.47%, rgb(26, 26, 26) 100%), url(${getEventImage(event.data.poster_image)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container size="xl" py="xl">
          <Group align="flex-start" gap="xl">
            <Image src={getEventImage(event.data.poster_image)} alt={event.data.title} w={300} radius="md" />
            <Stack flex={1} c="white">
              <Text size="xl" fw={700}>{event.data.title}</Text>
              <Group>
                <Badge leftSection={<IconStar size={14} />} color="yellow" variant="filled">
                  {event.data.status}
                </Badge>
              </Group>
              <Group gap="xl">
                <Group gap="xs">
                  <IconCalendar size={18} />
                  <Text size="sm">{new Date(event.data.event_date).toLocaleDateString()}</Text>
                </Group>
                <Badge>₹{event.data.price}</Badge>
                <Badge>{event.data.available_seats}/{event.data.total_seats} seats</Badge>
              </Group>
              <Text size="sm" lineClamp={3}>{event.data.description}</Text>
            </Stack>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        <Paper p="xl" shadow="sm" mb="xl">
          <Text size="lg" fw={600} mb="md">Select Your Seats</Text>
          <SeatSelection />
        </Paper>

        <Paper p="xl" shadow="sm">
          <Text size="lg" fw={600} mb="md">About the event</Text>
          <Text>{event.data.description}</Text>
        </Paper>
      </Container>
    </Box>
  );
};

export default EventDetails;
