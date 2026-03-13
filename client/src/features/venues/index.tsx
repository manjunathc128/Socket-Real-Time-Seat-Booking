import React, { useEffect, useTransition } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, Card, Image, Text, Badge, Group, Button, Container, Title, Loader, Alert } from '@mantine/core';
import { IconMapPin, IconUsers, IconCalendar } from "@tabler/icons-react";
import { RootState, AppDispatch } from '@/redux/store'
import { fetchVenues } from "@/redux/venues/venueSlice";
import { fetchEventsById } from '@/redux/event/eventSlice'
import { getVenueImage } from "@/utils/imageMapping"
import { useNavigate } from "react-router-dom";

const Venues = () => {
    const { venues, loading, error  } = useSelector((state: RootState) => state.venue)

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [isPending, startTransition] = useTransition()

    useEffect( () => {
        dispatch(fetchVenues({offset: 1, limit: 10}))
        dispatch(fetchEventsById({id: 1}))
    }, [] )
    if (loading) {
        return (
            <Container size="xl" py="xl">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}></div>
             </Container>
        )
    }
    if (error) {
        return (
            <Container size="xl" py="xl">
                <Alert variant="light" color="red" title="Error" >{error}</Alert>
            </Container>
        )
    }

    return (
        <Container size="xl" py="xl">
               <Title order={1} mb="xl" ta="center" >
                    Event Venues
                </Title> 
                {
                    venues && venues.data.venues.length > 0 ? (
                       
                        <Grid style={ isPending ? {opacity: 0.5} : {opacity: 1} }>
                            { venues.data.venues.map((venue) => (
                             <Grid.Col key={venue.id} span={{ base: 12, sm: 12, md: 6, lg: 6}}>
                                 <Card shadow="sm" padding="lg" radius="md" withBorder h="100%" >
                                    <Card.Section>
                                        <Image 
                                            src={getVenueImage(venue.image_name)}
                                            height={200}
                                            alt={venue.name}
                                        />    
                                    </Card.Section>   

                                    <Group justify="space-between" mt="md" mb="xs">
                                        <Text fw={500} size="lg" lineClamp={1}>
                                            {venue.name}
                                        </Text>
                                        <Badge color="blue" variant="light">
                                            <IconUsers size={12} style={{ marginRight: 4 }} />
                                            {venue.capacity}
                                        </Badge>
                                    </Group>

                                    <Group mb="md">
                                        <IconMapPin size={16} color="gray" />
                                        <Text size="sm" c="dimmed" lineClamp={2}>
                                            {venue.address}
                                        </Text>
                                    </Group>

                                    <Group mb="md">
                                        <IconCalendar size={16} color="gray" />
                                        <Text size="xs" c="dimmed">
                                            Added: {new Date(venue.created_at).toLocaleDateString()}
                                        </Text>
                                    </Group>

                                    <Button 
                                        variant="light" 
                                        color="blue" 
                                        fullWidth 
                                        mt="auto"
                                        onClick={() => {
                                         startTransition(() => navigate(`/events/${venue.id}`))
                                        }}
                                    >
                                        View Events
                                    </Button>
                                </Card>
                            </Grid.Col>
                        ))}
                        </Grid>      
                       
                     ): (
                        <>No venues found</>
                     ) }
     </Container>
    )
}


export default Venues