import { useEffect, useState } from 'react';
import PillNav from '../components/PillNav';
import { NAV_ITEMS, NAV_LOGO, NAV_LOGO_ALT } from '../components/navConfig';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import './MainSite.css';

function AboutPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    window.scrollTo(0, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`main-site ${loaded ? 'main-site--loaded' : ''}`}>
      <PillNav logo={NAV_LOGO} logoAlt={NAV_LOGO_ALT} items={NAV_ITEMS} />
      <div style={{ paddingTop: '100px' }}>
        <AboutSection />
      </div>
      <Footer />
    </div>
  );
}

export default AboutPage;
