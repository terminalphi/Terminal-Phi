import { useEffect, useState } from 'react';
import PillNav from '../components/PillNav';
import { NAV_ITEMS, NAV_LOGO, NAV_LOGO_ALT } from '../components/navConfig';
import DashboardSection from '../components/DashboardSection';
import Footer from '../components/Footer';
import { getCurrentUser, getProfile } from '../auth';
import './MainSite.css';

function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    window.scrollTo(0, 0);

    async function init() {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && mounted) {
          setUser(currentUser);
          const profileData = await getProfile(currentUser.id);
          if (mounted) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error('[DashboardPage]', err);
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    const timer = setTimeout(() => setLoaded(true), 100);
    init();
    return () => { mounted = false; clearTimeout(timer); };
  }, []);

  return (
    <div className={`main-site ${loaded ? 'main-site--loaded' : ''}`}>
      <PillNav logo={NAV_LOGO} logoAlt={NAV_LOGO_ALT} items={NAV_ITEMS} />
      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 150px)' }}>
        <DashboardSection user={user} profile={profile} />
      </div>
      <Footer />
    </div>
  );
}

export default DashboardPage;
