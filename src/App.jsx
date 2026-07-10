import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Threads from './components/Threads';
import Oneko from './components/Oneko';
import { getDeviceTier, THREADS_SETTINGS } from './deviceTier';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import MainSite from './pages/MainSite';
import AboutPage from './pages/AboutPage';
import ActivitiesPage from './pages/ActivitiesPage';
import EventsPage from './pages/EventsPage';
import TeamPage from './pages/TeamPage';
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


  const showThreads = displayLocation.pathname !== '/';
  // Scale the WebGL background's cost to the device so it stays smooth on
  // weaker hardware (fewer shader lines, capped DPR + FPS) without going static.
  const threadSettings = THREADS_SETTINGS[getDeviceTier()];

  return (
    <>
      <Oneko />
      {showThreads && (
        <div className="app-bg-threads" aria-hidden="true">
          <Threads
            color={[0.831, 0.686, 0.216]}
            amplitude={1.2}
            distance={0}
            enableMouseInteraction={false}
            lineCount={threadSettings.lineCount}
            dprCap={threadSettings.dprCap}
            maxFps={threadSettings.maxFps}
          />
        </div>
      )}
      <div className={`page-wrapper page-${transitionStage}`}>
        <Routes location={displayLocation}>
          <Route path="/" element={
            localStorage.getItem('hasVisited') === 'true'
              ? <Navigate to="/home" replace />
              : <LandingPage />
          } />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/home" element={<MainSite />} />
          <Route path="/about_us" element={<AboutPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/join_us" element={<JoinPage />} />
        </Routes>
      </div>
    </>
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
