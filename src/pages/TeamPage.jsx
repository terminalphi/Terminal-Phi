import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TeamSection from '../components/TeamSection';
import Footer from '../components/Footer';
import './MainSite.css';

function TeamPage() {
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
        <TeamSection />
      </div>
      <Footer />
    </div>
  );
}

export default TeamPage;
