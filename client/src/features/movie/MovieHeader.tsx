import { Box, Container, Image, Text, Group, Badge, Stack } from '@mantine/core';
import { IconStar, IconClock, IconCalendar } from '@tabler/icons-react';
import { getMovieImage, getMovieBackdrop } from '@/utils/movieImageMapping';

interface MovieHeaderProps {
  movie: any;
}

const MovieHeader = ({ movie }: MovieHeaderProps) => {
  return (
    <Box
      style={{
        backgroundImage: `linear-gradient(90deg, rgb(26, 26, 26) 24.97%, rgb(26, 26, 26) 38.3%, rgba(26, 26, 26, 0.04) 97.47%, rgb(26, 26, 26) 100%), url(${getMovieBackdrop(movie.backdrop_image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container size="xl" py="xl">
        <Group align="flex-start" gap="xl">
          <Image src={getMovieImage(movie.poster_image)} alt={movie.title} w={300} radius="md" />
          <Stack flex={1} c="white">
            <Text size="xl" fw={700}>{movie.title}</Text>
            <Group>
              <Badge leftSection={<IconStar size={14} />} color="yellow" variant="filled">8.5/10</Badge>
            </Group>
            <Group gap="xl">
              <Group gap="xs">
                <IconClock size={18} />
                <Text size="sm">{movie.duration} mins</Text>
              </Group>
              <Badge>{movie.genre}</Badge>
              <Badge>{movie.language}</Badge>
              <Badge>{movie.rating}</Badge>
            </Group>
            <Group gap="xs">
              <IconCalendar size={18} />
              <Text size="sm">{new Date(movie.release_date).toLocaleDateString()}</Text>
            </Group>
            <Text size="sm" lineClamp={3}>{movie.description}</Text>
          </Stack>
        </Group>
      </Container>
    </Box>
  );
};

export default MovieHeader;
