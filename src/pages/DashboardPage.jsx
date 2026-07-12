import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillNav from '../components/PillNav';
import { NAV_ITEMS, NAV_LOGO, NAV_LOGO_ALT } from '../components/navConfig';
import DashboardSection from '../components/DashboardSection';
import Footer from '../components/Footer';
import { getCurrentUser, supabase } from '../auth';
import './MainSite.css';

/* ─── Toggle this to preview with fake data (no auth needed) ─── */
const MOCK_MODE = true;

/* ── Helpers to generate realistic fake data ─────────────────── */
function genHeatmap() {
  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const rand = Math.random();
    const count = rand < 0.35 ? 0 : rand < 0.6 ? 1 : rand < 0.78 ? 2 : rand < 0.9 ? 4 : rand < 0.97 ? 7 : 12;
    if (count > 0) data.push({ date: iso, count });
  }
  return data;
}

const MOCK_PROFILE = {
  Full_Name: 'Shreeansh Aggarwal',
  Roll_Number: '22BAI10001',
  Email: 'aggarwal.shreeansh@gmail.com',
  Portfolio: 'https://github.com/shreeanshaggarwal',
};

const MOCK_STATS = {
  roll_number: '22BAI10001',
  total_questions: 452,
  total_active_days: 175,
  total_contests: 11,
  leetcode_contests: 4,
  codechef_contests: 7,
  leetcode_username: 'shreeansh',
  codestudio_username: 'shreeansh_codes',
  codechef_username: 'shreeansh_aggarwal',
  dsa_easy: 181,
  dsa_medium: 173,
  dsa_hard: 26,
  rating_history: [
    { date: '2025-09-10', rating: 1320 },
    { date: '2025-10-05', rating: 1382 },
    { date: '2025-10-19', rating: 1349 },
    { date: '2025-11-02', rating: 1405 },
    { date: '2025-11-23', rating: 1391 },
    { date: '2025-12-07', rating: 1430 },
    { date: '2025-12-21', rating: 1418 },
    { date: '2026-01-11', rating: 1462 },
    { date: '2026-01-14', rating: 1478 },
    { date: '2026-02-08', rating: 1510 },
    { date: '2026-03-01', rating: 1498 },
  ],
  activity_heatmap: genHeatmap(),
};

/* ──────────────────────────────────────────────────────────────── */

function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    window.scrollTo(0, 0);

    /* ── Mock mode: bypass auth + Supabase entirely ── */
    if (MOCK_MODE) {
      const t = setTimeout(() => {
        if (mounted) {
          setProfile(MOCK_PROFILE);
          setStats(MOCK_STATS);
          setAuthChecked(true);
          setLoaded(true);
        }
      }, 300);
      return () => { mounted = false; clearTimeout(t); };
    }

    /* ── Production path ─────────────────────────── */
    async function init() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate('/signin?next=/dashboard', { replace: true });
          return;
        }

        if (!supabase) throw new Error('Supabase not configured');

        const { data: profileRows, error: profileErr } = await supabase
          .from('Candidates_data_table')
          .select('Full_Name, Roll_Number, Email, Portfolio')
          .eq('Email', user.email)
          .limit(1);

        if (profileErr) throw profileErr;

        const profileRow = profileRows?.[0] ?? null;

        if (!profileRow) {
          if (mounted) {
            setProfile({ Email: user.email, Full_Name: user.user_metadata?.full_name || user.email });
            setAuthChecked(true);
            setLoaded(true);
          }
          return;
        }

        const { data: statsRows, error: statsErr } = await supabase
          .from('member_stats')
          .select('*')
          .eq('roll_number', profileRow.Roll_Number)
          .limit(1);

        if (statsErr) throw statsErr;

        if (mounted) {
          setProfile(profileRow);
          setStats(statsRows?.[0] ?? null);
          setAuthChecked(true);
          setLoaded(true);
        }
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

    if (!profile?.Roll_Number) {
      return (
        <div className="dashboard__state">
          <div className="dashboard__state-icon">📋</div>
          <h2>No registration found</h2>
          <p>
            You haven't submitted a membership application yet. Register first and your
            dashboard will appear here once your stats are added.
          </p>
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="dashboard__state">
          <div className="dashboard__state-icon">📊</div>
          <h2>Stats not available yet</h2>
          <p>
            You're registered ({profile.Roll_Number}) but your coding stats haven't been
            added yet. Check back soon!
          </p>
        </div>
      );
    }

    return <DashboardSection profile={profile} stats={stats} />;
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
