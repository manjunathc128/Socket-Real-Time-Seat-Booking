import { Card, Image, Text, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getMovieImage, getVenueImage, getEventImage } from '@/utils/movieImageMapping';

type ItemCardProps = {
  item: any;
  type: 'movie' | 'event' | 'venue';
};

const ItemCard = ({ item, type }: ItemCardProps) => {
  const navigate = useNavigate();
  const imageSrc = type === 'movie' 
    ? getMovieImage(item.poster_image)
    : type === 'event' 
    ? getEventImage(item.poster_image)
    : getVenueImage(item.image_name);


  const handleClick = () => {
    if (type === 'movie') navigate(`/movies/${item.id}`);
    else if (type === 'event' as string) navigate(`/events/${item.id}`);
    else navigate(`/venues/${item.id}`);
  }  
  return (
    <Card
      shadow="sm"
      padding="0"
      radius="md"
      style={{ minWidth: '200px', cursor: 'pointer' }}
      onClick={handleClick}
    >
      <Card.Section>
        <Image
          src={imageSrc}
          height={280}
          alt={item.title || item.name}
          fallbackSrc="https://placehold.co/200x280?text=No+Image"
        />
      </Card.Section>
      <Box p="md">
        <Text fw={500} size="sm" lineClamp={1}>{item.title || item.name}</Text>
        {type === 'movie' && item.genre && (
          <Text size="xs" c="dimmed">{item.genre}</Text>
        )}
        {type === 'venue' && item.address && (
          <Text size="xs" c="dimmed" lineClamp={1}>{item.address}</Text>
        )}
        {type === 'event' as string && item.venue_name && (
          <Text size="xs" c="dimmed" lineClamp={1}>{item.poster_image}</Text>
        )}
      </Box>
    </Card>
  );
};

export default ItemCard;
