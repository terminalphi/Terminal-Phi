import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ActivitiesSection from '../components/ActivitiesSection';
import Footer from '../components/Footer';
import './MainSite.css';

function ActivitiesPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    window.scrollTo(0, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`main-site ${loaded ? 'main-site--loaded' : ''}`}>
      <Navbar />
      <div style={{ paddingTop: '100px' }}>
        <ActivitiesSection />
      </div>
      <Footer />
    </div>
  );
}

export default ActivitiesPage;
