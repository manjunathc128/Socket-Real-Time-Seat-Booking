import { Box, Title, Text, Group, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useRef } from 'react';
import ItemCard from './ItemCard';

type CarouselSectionProps = {
  title: string;
  items: any;
  type: 'movie' | 'venue';
};

const CarouselSection = ({ title, items, type }: CarouselSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;
  
   return (
    <Box mb="xl">
      <Group justify="space-between" mb="md">
        <Title order={2} size="h3">{title}</Title>
        <Text size="sm" c="red" style={{ cursor: 'pointer' }}>{"See All"}</Text>
      </Group>
      <Box pos="relative">
        <ActionIcon
          size="lg"
          radius="xl"
          pos="absolute"
          left={-20}
          top="50%"
          style={{ 
            transform: 'translateY(-50%)', 
            zIndex: 10,
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            color: 'white'
          }}
          onClick={() => scroll('left')}
        >
          <IconChevronLeft size={20} />
        </ActionIcon>
        <Box
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item: any) => (
            <ItemCard key={item.id} item={item} type={type} />
          ))}
        </Box>
          <ActionIcon
            size="lg"
            radius="xl"
            pos="absolute"
            right={-20}
            top="50%"
            style={{ 
              transform: 'translateY(-50%)', 
              zIndex: 10,
              backgroundColor: 'rgba(128, 128, 128, 0.5)',
              color: 'white'
            }}
            onClick={() => scroll('right')}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
      </Box>
    </Box>
  );
};

export default CarouselSection;
