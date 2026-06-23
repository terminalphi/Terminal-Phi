import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import EventsSection from '../components/EventsSection';
import Footer from '../components/Footer';
import './MainSite.css';

function MainSite() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    window.scrollTo(0, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`main-site ${loaded ? 'main-site--loaded' : ''}`}>
      <Navbar />
      <HeroSection />
      <EventsSection />
      <Footer />
    </div>
  );
}

export default MainSite;
