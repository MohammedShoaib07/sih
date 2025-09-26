import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
// import Home from './pages/Home'; // Removed - using ModernHome instead
import ModernHome from './pages/ModernHome';
import GovDashboard from './pages/GovDashboard';
import ModernDashboard from './pages/ModernDashboard';
import Profile from './pages/Profile';
import NewReport from './pages/NewReport';
import Notifications from './pages/Notifications';
import { useAppStore } from './store';
import { loadModel } from './utils/detection';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  const { isLoggedIn, isGovUser, hasCompletedSetup, initAuth } = useAppStore();

  useEffect(() => {
    loadModel().catch(console.error);
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isLoggedIn ? (
            <Navigate to={
              !hasCompletedSetup ? '/profile-setup' :
              isGovUser ? '/gov-home' : '/home'
            } />
          ) : (
            <LandingPage />
          )
        } />
        <Route path="/login" element={
          isLoggedIn ? (
            <Navigate to={
              !hasCompletedSetup ? '/profile-setup' :
              isGovUser ? '/gov-dashboard' : '/dashboard'
            } />
          ) : (
            <Login />
          )
        } />

        {/* Home pages - standalone with their own navigation */}
        <Route path="/home" element={
          isLoggedIn && !isGovUser && hasCompletedSetup ? <ModernHome /> :
          <Navigate to={!isLoggedIn ? "/login" : !hasCompletedSetup ? "/profile-setup" : "/gov-home"} />
        } />

        <Route path="/gov-home" element={
          isLoggedIn && isGovUser && hasCompletedSetup ? <ModernHome /> :
          <Navigate to={!isLoggedIn ? "/login" : !hasCompletedSetup ? "/profile-setup" : "/home"} />
        } />

        {/* Reports pages - standalone with their own navigation */}
        <Route path="/dashboard" element={
          isLoggedIn && !isGovUser && hasCompletedSetup ? <ModernDashboard /> :
          <Navigate to={!isLoggedIn ? "/login" : !hasCompletedSetup ? "/profile-setup" : "/gov-dashboard"} />
        } />

        <Route path="/gov-dashboard" element={
          isLoggedIn && isGovUser && hasCompletedSetup ? <GovDashboard /> :
          <Navigate to={!isLoggedIn ? "/login" : !hasCompletedSetup ? "/profile-setup" : "/dashboard"} />
        } />

        {/* Map view - redirect to dashboard for now */}
        <Route path="/map" element={
          isLoggedIn && hasCompletedSetup ? <Navigate to={isGovUser ? "/gov-dashboard" : "/dashboard"} /> :
          <Navigate to={!isLoggedIn ? "/login" : "/profile-setup"} />
        } />

        {/* Standalone routes */}
        <Route path="/profile-setup" element={
          isLoggedIn && !hasCompletedSetup ? <ProfileSetup /> :
          <Navigate to={!isLoggedIn ? "/login" : isGovUser ? "/gov-home" : "/home"} />
        } />

        <Route path="/profile" element={
          isLoggedIn && hasCompletedSetup ? <Profile /> :
          <Navigate to={!isLoggedIn ? "/login" : "/profile-setup"} />
        } />

        <Route path="/report" element={
          isLoggedIn && !isGovUser && hasCompletedSetup ? <NewReport /> :
          <Navigate to="/login" />
        } />

        <Route path="/new-report" element={
          isLoggedIn && !isGovUser && hasCompletedSetup ? <NewReport /> :
          <Navigate to="/login" />
        } />

        <Route path="/notifications" element={
          isLoggedIn ? <Notifications /> : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;