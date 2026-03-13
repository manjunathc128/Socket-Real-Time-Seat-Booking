import { AppShell } from '@mantine/core';
import Navbar from '@/components/Navbar';
import TabsNavbar from '@/components/TabsNavbar';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <AppShell header={{ height: 120 }} padding={0}>
      <AppShell.Header>
        <Navbar />
        <TabsNavbar />
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
