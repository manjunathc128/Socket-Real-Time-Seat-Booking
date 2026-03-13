import { Group, TextInput, Button, Container, Box, Card, Stack, Avatar, Text, ActionIcon, Collapse} from '@mantine/core';
import { IconSearch, IconUser, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const [profileCard, setProfileCard] = useState(false)
  return (
    <Box bg="#F8F9FA" h={60} style={{ borderBottom: '1px solid #E9ECEF' }}>
      <Container size="xl" h="100%">
        <Group mt={10} align='flex-start' justify="space-between" h="100%">
          <svg width="160" height="40" viewBox="0 0 160 40" style={{ cursor: 'pointer' }}>
             <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#FF6B6B', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#F84464', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FF3366', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#4ECDC4', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#44A08D', stopOpacity: 1 }} />
                </linearGradient>
                </defs>
                <circle cx="15" cy="20" r="8" fill="url(#grad1)" />
                <circle cx="15" cy="20" r="5" fill="#FFD93D" opacity="0.8" />
                <path d="M 28 12 L 35 20 L 28 28 Z" fill="url(#grad2)" />
                <rect x="38" y="15" width="3" height="10" fill="#FF6B6B" rx="1.5" />
                <rect x="43" y="12" width="3" height="16" fill="#4ECDC4" rx="1.5" />
                <rect x="48" y="15" width="3" height="10" fill="#FFD93D" rx="1.5" />
                <text x="56" y="26" fill="#333" fontSize="18" fontWeight="bold" letterSpacing="1">
                    BookShow
                </text>
          
          </svg>
          
          <TextInput
            placeholder="Search for Movies, Events, Sports"
            leftSection={<IconSearch size={16} />}
            w={400}
          />
          {
            auth.isAuthenticated ? (
              <div style={{width: '200px', minWidth: 'max-content'}}>
                <Stack>
                  <Group >
                      <Avatar color="blue" radius="xl">
                          {auth.fullName?.charAt(0).toUpperCase()}
                        </Avatar>
                      <ActionIcon 
                        variant='subtle' 
                        color='blue'
                        onClick={() => setProfileCard(!profileCard)}
                      >
                        <IconChevronDown size={16} />
                      </ActionIcon>
                  </Group>
                  
                  <Collapse in={profileCard}>
                    <Card shadow="sm" padding="sm" radius="md" withBorder>
                      <Group>
                        <Stack gap={2}>
                          <Text size="sm" fw={500}>{auth.fullName}</Text>
                          <Text size="xs" c="dimmed">{auth.email}</Text>
                          <Text size="xs" c="dimmed">{auth.phoneNumber}</Text>
                        </Stack>
                      </Group>
                    </Card>

                  </Collapse>
                
                </Stack>
              </div>
              ) :
              (
                <Button 
                  variant="filled" 
                  color="red" 
                  leftSection={<IconUser size={16} />}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              )
          }
        </Group>
      </Container>
    </Box>
  );
};

export default Navbar;
