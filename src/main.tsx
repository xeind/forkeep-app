import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Discover from './pages/Discover.tsx';
import Matches from './pages/Matches.tsx';
import Chat from './pages/Chat.tsx';
import Profile from './pages/Profile.tsx';
import UserProfile from './pages/UserProfile.tsx';
import Settings from './pages/Settings.tsx';
import AppLayout from './components/AppLayout.tsx';
import Navbar from './components/Navbar.tsx';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('swaylo_token');
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

function ProtectedRouteWithLayout({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('swaylo_token');
  return token ? <AppLayout>{children}</AppLayout> : <Navigate to="/" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('swaylo_token');
  return !token ? <>{children}</> : <Navigate to="/discover" replace />;
}

function AppRoutes() {
  const location = useLocation();
  const token = localStorage.getItem('swaylo_token');
  const isAuthPage = location.pathname === '/' || location.pathname === '/signup';
  const showNavbar = token && !location.pathname.startsWith('/chat') && !isAuthPage;

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route
          path="/discover"
          element={
            <ProtectedRouteWithLayout>
              <Discover />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRouteWithLayout>
              <Matches />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRouteWithLayout>
              <Profile />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRouteWithLayout>
              <UserProfile />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRouteWithLayout>
              <Settings />
            </ProtectedRouteWithLayout>
          }
        />
      </Routes>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);
