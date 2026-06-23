import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import JoinSection from '../components/JoinSection';
import Footer from '../components/Footer';
import './MainSite.css';

function JoinPage() {
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
        <JoinSection />
      </div>
      <Footer />
    </div>
  );
}

export default JoinPage;
