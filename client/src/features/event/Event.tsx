import { useSearchParams, useParams } from "react-router-dom";
import { Container, Grid, Card, Group,Text, Button, Badge, Image, Center, Loader } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchEventsById } from "@/redux/event/eventSlice";
import { fetchSeatsByEventId } from "@/redux/seats/seatSlice";

import { Suspense, lazy, useEffect, useTransition } from "react";
// import { useSocket } from '@/hooks/useSocket';
import { useSocket } from '@/context/SocketContext';
import { getEventImage } from '@/utils/imageMapping';
import dayjs from "dayjs";

const SeatSelection = lazy(() => import('@/features/seats/SeatSelection'))
export interface Event {
    id: number;
    title: string;
    description?: string;
    venue_id: number;
    event_date: Date;
    price: number;
    image_name: string;
    total_seats: number;
    available_seats: number;
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
    created_at: Date;
    updated_at: Date;
}

const Events = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { events, loading, error } = useSelector((state: RootState) => state.event)
    const { seats, seatLoading, seatError } = useSelector((state: RootState) => state.seat)
    const [searchParams, setSearchParams] = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const { id } = useParams<{ id: string }>()
    const socket = useSocket()
    
    useEffect(() => {
        try{
            const venueId = id || searchParams.get('venueId')
            if(venueId) {
                dispatch(fetchEventsById({id: parseInt(venueId)})).unwrap()
            }
        }catch(err: any){

        }    
    }, [id, searchParams, dispatch])

    const handleEventClick = (eventId: number) => {
        try{  
            console.log('Emitting joinEvent:', eventId);
            localStorage.debug = 'socket.io-client:socket';
            if(socket?.connected){
                socket?.emit('joinEvent', eventId)
            }
            
            startTransition( async () => {
                await dispatch(fetchSeatsByEventId({eventId})).unwrap()
                modals.open({
                        title: `Select Seats for Event ${eventId}`,
                        children: <Suspense fallback={<Center h={300}><Loader /></Center>}> <SeatSelection/> </Suspense> ,
                        centered: true,
                        closeOnEscape: true,
                        onClose: () => socket?.emit('leaveEvent', eventId)

                    })
                }  
            )
        }catch(err){

        }
    }
    return(
        <Container>
            <Grid styles={{ root: {opacity: isPending ? 0.5 : 1} }} >
                { events?.data?.map( (event: Event) => 

                    (
                    <Grid.Col span={ {base:12, sm:12, md:6, lg:6 }} >
                        
                            <Card key={event.id} shadow="sm" padding="lg" radius="md" withBorder>
                                <Card.Section>
                                    <Image 
                                        src={`${getEventImage(event.image_name)}`}
                                        alt={event.title}
                                        h={200}
                                        radius="md"
                                        // w="auto"
                                        // fit="contain"
                                    />
                                </Card.Section>
                                <Group mt="sm" justify="Space-between">
                                    <Text>{event.title}</Text>
                                    <Text>Price: {event.price} ₹</Text>
                                </Group >
                                <Card.Section p="md">
                                     <Text size="sm" c="dimmed" mb="xs">{event.description}</Text>
                                     <Group>
                                            <Text size="sm">{(dayjs(event.event_date).toString())}</Text>
                                            <Badge color={event.status === 'ACTIVE' ? "green" : event.status === 'CANCELLED' ? "red" : "blue"}>
                                                {event.status}
                                            </Badge>
                                     </Group>

                                </Card.Section>
                               <Group justify="space-between">
                                  <div>
                                     <Text size="sm">Available Seats: {event.available_seats}</Text>
                                     <Text size="sm" c="dimmed">Total Seats: {event.total_seats}</Text>
                                  </div>
                                    <Button w={200} fullWidth={false} size="sm" onClick={() => handleEventClick(event.id)}  > Select Seats</Button>
                                </Group>
                            </Card>
                         
                    </Grid.Col >
                    ) 
            )}
               
            {loading && <Text>Loading...</Text>}
            {error && <Text color="red">{error}</Text>}
            {!loading && !events?.data?.length && <Text>No events found</Text>}
            </Grid>
        </Container>
    )
}


export default Events;