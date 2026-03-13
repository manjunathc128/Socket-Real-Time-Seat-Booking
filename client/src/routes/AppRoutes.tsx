import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useMemo } from 'react';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '@/layout/MainLayout';
import { RootState } from '@/redux/store';

const Login = lazy(() => import('@/features/auth/Login'));
const SignUp = lazy(() => import('@/features/auth/SignUp'));
const Home = lazy(() => import('@/features/home/Home'));
const Venues = lazy(() => import('@/features/venues'));
const Event = lazy(() => import('@/features/event/Event'));
const MovieDetails = lazy(() => import('@/features/movie/MovieDetails'));
const Movies = lazy(() => import('@/features/movie'));
const Events = lazy(() => import('@/features/event'));
const EventDetails = lazy(() => import('@/features/event/EventDetails'));


const WithLoader = (element: React.ReactNode) => {
  return <Suspense fallback={<div>Loading</div>}>{element}</Suspense>;
};

const ProtectedRoutes = (): React.ReactElement => (
  <Routes>
    <Route path="/" element={WithLoader(<Home />)} />
    <Route path="/venues" element={WithLoader(<Venues />)} />
    <Route path="/movies" element={WithLoader(<Movies />)} />
    <Route path="/events" element={WithLoader(<Events />)} />
    <Route path="/events/:id" element={WithLoader(<EventDetails />)} />
    <Route path="/movies/:id" element={WithLoader(<MovieDetails />)} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

function AppRoutes() {
  const { pathname } = useLocation();

  const RoutesArray = useMemo(() => {
    return {
      auth: ['/login', '/signup'],
    };
  }, [pathname]);

  const routeType = useMemo(() => {
    if (RoutesArray.auth.includes(pathname)) return 'auth';
  }, [pathname]);

  switch (routeType) {
    case 'auth':
      return (
        <Routes>
          <Route path="/login" element={WithLoader(<Login />)} />
          <Route path="/signup" element={WithLoader(<SignUp />)} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );
    default:
      return (
        <ProtectedRoute>
          <MainLayout>
            <ProtectedRoutes />
          </MainLayout>
        </ProtectedRoute>
      );
  }
}

export default AppRoutes;
