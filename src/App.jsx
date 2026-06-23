import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import MainSite from './pages/MainSite';
import AboutPage from './pages/AboutPage';
import ActivitiesPage from './pages/ActivitiesPage';
import EventsPage from './pages/EventsPage';
import JoinPage from './pages/JoinPage';

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exit');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div className={`page-wrapper page-${transitionStage}`}>
      <Routes location={displayLocation}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/home" element={<MainSite />} />
        <Route path="/about_us" element={<AboutPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/join_us" element={<JoinPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
