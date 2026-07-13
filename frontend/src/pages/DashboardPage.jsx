import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillNav from '../components/PillNav';
import { NAV_ITEMS, NAV_LOGO, NAV_LOGO_ALT } from '../components/navConfig';
import DashboardSection from '../components/DashboardSection';
import Footer from '../components/Footer';
import { getCurrentUser, getProfile, upsertProfile } from '../auth';
import './MainSite.css';

function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    window.scrollTo(0, 0);

    async function init() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/signin?next=/dashboard', { replace: true });
          return;
        }

        if (mounted) setUser(currentUser);

        const profileData = await getProfile(currentUser.id);

        if (mounted) {
          setProfile(profileData);
          setAuthChecked(true);
        }

        // Fetch stats from Flask backend
        if (profileData) {
          try {
            const resp = await fetch('https://api.terminalphi.xyz/api/stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lc_user: profileData.lc_user,
                gfg_user: profileData.gfg_user,
                cc_user: profileData.cc_user,
                cf_user: profileData.cf_user,
                hr_user: profileData.hr_user
              })
            });
            if (resp.ok) {
              const statsData = await resp.json();
              if (mounted) setStats(statsData);
              console.log("Fetched Stats from Flask:", statsData);
            }
          } catch (err) {
            console.error("Failed to fetch stats:", err);
          }
        }

        if (mounted) setLoaded(true);
      } catch (err) {
        console.error('[DashboardPage]', err);
        if (mounted) {
          setError(err.message || 'Something went wrong');
          setAuthChecked(true);
          setLoaded(true);
        }
      }
    }

    const timer = setTimeout(() => setLoaded(true), 100);
    init();
    return () => { mounted = false; clearTimeout(timer); };
  }, [navigate]);

  const handleSaveProfile = async (profileData) => {
    try {
      const saved = await upsertProfile({
        id: user.id,
        name: profileData.name,
        email: profileData.email,
        gh_user: profileData.gh_user || null,
        lc_user: profileData.lc_user || null,
        gfg_user: profileData.gfg_user || null,
        cc_user: profileData.cc_user || null,
        cf_user: profileData.cf_user || null,
        hr_user: profileData.hr_user || null,
      });
      setProfile(saved);
      return { success: true };
    } catch (err) {
      console.error('[DashboardPage] save error:', err);
      return { success: false, error: err.message };
    }
  };

  const renderBody = () => {
    if (!authChecked) {
      return (
        <div className="dashboard__state">
          <div className="dashboard__spinner" />
          <p>Loading your dashboard…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard__state">
          <div className="dashboard__state-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      );
    }

    return (
      <DashboardSection
        user={user}
        profile={profile}
        stats={stats}
        onSave={handleSaveProfile}
      />
    );
  };

  return (
    <div className={`main-site ${loaded ? 'main-site--loaded' : ''}`}>
      <PillNav logo={NAV_LOGO} logoAlt={NAV_LOGO_ALT} items={NAV_ITEMS} />
      <div style={{ paddingTop: '80px' }}>
        {renderBody()}
      </div>
      <Footer />
    </div>
  );
}

export default DashboardPage;
