import { Group, Container, Box, UnstyledButton } from '@mantine/core';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';



const TabsNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Movies');

  const Tabs = useMemo(() => {
    return  [
      { name: 'Home', path: '/' },
      { name: 'Movies', path: '/movies' },
      { name: 'Events', path: '/events' }
  ];
  }, [location.pathname]);

  const getActiveTab = useCallback(() => {
    const currentTab = Tabs.find(tab => tab.path === location.pathname);
    return currentTab?.name || 'Home';
  }, [location.pathname, Tabs])

  return (
    <Box bg="dark.8" h={60}>
      <Container size="xl" h="100%">
        <Group gap="xl" h="100%">
          {Tabs.map((tab) => (
            <UnstyledButton
              key={tab.name}
              onClick={() => navigate(tab.path)}
              style={{
                color: getActiveTab() === tab.name ? '#333' : '#6C757D',
                fontSize: '16px',
                fontWeight: 500,
                padding: '0 8px',
                borderBottom: getActiveTab() === tab.name? '3px solid #F84464' : 'none',
                height: '100%',
                transition: 'all 0.2s',
              }}
            >
              {tab.name}
            </UnstyledButton>
          ))}
        </Group>
      </Container>
    </Box>
  );
};

export default TabsNavbar;
