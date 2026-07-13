import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Threads from './components/Threads';
import Oneko from './components/Oneko';
import TerminalOverlay from './components/TerminalOverlay';
import { getDeviceTier, THREADS_SETTINGS } from './deviceTier';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import MainSite from './pages/MainSite';
import AboutPage from './pages/AboutPage';
import ActivitiesPage from './pages/ActivitiesPage';
import EventsPage from './pages/EventsPage';
import TeamPage from './pages/TeamPage';
import JoinPage from './pages/JoinPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

/* ═══════════════════════════════════════════════════════════════════════════
   Custom terminal commands
   ─────────────────────────────────────────────────────────────────────────
   Add / remove entries here. Each key is the command name the user types.
   `handler(args, ctx)` can return:
     • a string              → printed as a single line
     • an OutputLine[]       → printed with styling
     • void / undefined      → nothing printed
   ctx has: print(), clear(), close(), navigate(), history[]
   ═══════════════════════════════════════════════════════════════════════════ */
/* ── Hex → {r, g, b} ───────────────────────────────────────── */
function hexToRGB(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/* ── Apply a theme to CSS vars + return GL color ─────────────── */
function applyTheme({ r, g, b }) {
  const root = document.documentElement.style;
  root.setProperty('--accent-r', r);
  root.setProperty('--accent-g', g);
  root.setProperty('--accent-b', b);
  return [r / 255, g / 255, b / 255];
}

const THEME_PALETTE = {
  gold:    '#d4af37',
  cyan:    '#22d3ee',
  rose:    '#fb7185',
  green:   '#4ade80',
  purple:  '#a78bfa',
  default: '#d4af37',
};

function useTerminalCommands(navigate, setThreadColor) {
  // Not memoised — the commands close over setThreadColor
  return {
    /* Navigate to any route */
    goto: {
      description: 'Navigate to a page  (e.g. goto /about_us)',
      handler: (args, ctx) => {
        const dest = args[0];
        if (!dest) return { text: '  Usage: goto <path>', type: 'error' };
        const valid = ['/', '/home', '/about_us', '/activities', '/events', '/team', '/join_us', '/signin', '/dashboard'];
        if (!valid.includes(dest)) {
          return [
            { text: `  Unknown route: ${dest}`, type: 'error' },
            { text: `  Available: ${valid.join(', ')}`, type: 'dim' },
          ];
        }
        ctx.close();
        navigate(dest);
        return { text: `  Navigating to ${dest}…`, type: 'success' };
      },
    },

    /* Who am I */
    whoami: {
      description: 'Display info about Terminal Phi',
      handler: () => [
        { text: '', type: 'default' },
        { text: '  ╔══════════════════════════════════════════╗', type: 'system' },
        { text: '  ║  Terminal Phi                            ║', type: 'system' },
        { text: '  ║  A tech society built for builders,      ║', type: 'system' },
        { text: '  ║  not spectators.                         ║', type: 'system' },
        { text: '  ╚══════════════════════════════════════════╝', type: 'system' },
        { text: '', type: 'default' },
      ],
    },

    /* Socials */
    socials: {
      description: 'Show social media links',
      handler: () => [
        { text: '  Connect with us:', type: 'system' },
        { text: '  <a href="https://instagram.com/terminal_phi" target="_blank" rel="noopener">→ Instagram</a>', type: 'html' },
        { text: '  <a href="https://linkedin.com/company/terminalphi" target="_blank" rel="noopener">→ LinkedIn</a>', type: 'html' },
        { text: '  <a href="https://github.com/terminalphi" target="_blank" rel="noopener">→ GitHub</a>', type: 'html' },
      ],
    },

    /* Fun: theme swap */
    theme: {
      description: 'Change accent color  (e.g. theme cyan)',
      handler: (args) => {
        const name = (args[0] || '').toLowerCase();
        const hex = THEME_PALETTE[name];
        if (!hex) {
          return [
            { text: `  Unknown theme: ${name || '(none)'}`, type: 'error' },
            { text: `  Options: ${Object.keys(THEME_PALETTE).join(', ')}`, type: 'dim' },
          ];
        }
        const rgb = hexToRGB(hex);
        const gl = applyTheme(rgb);
        setThreadColor(gl);
        return { text: `  Accent set to ${name} (${hex})`, type: 'success' };
      },
    },

    /* Cowsay for fun */
    cowsay: {
      description: 'Let the cow speak  (e.g. cowsay moo)',
      handler: (args) => {
        const msg = args.length ? args.join(' ') : 'moo';
        const border = '-'.repeat(msg.length + 2);
        return [
          { text: `   ${border}`, type: 'default' },
          { text: `  < ${msg} >`, type: 'default' },
          { text: `   ${border}`, type: 'default' },
          { text: `          \\   ^__^`, type: 'default' },
          { text: `           \\  (oo)\\_______`, type: 'default' },
          { text: `              (__)\\       )\\/\\`, type: 'default' },
          { text: `                  ||----w |`, type: 'default' },
          { text: `                  ||     ||`, type: 'default' },
        ];
      },
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════ */

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [threadColor, setThreadColor] = useState([0.831, 0.686, 0.216]);
  const terminalCommands = useTerminalCommands(navigate, setThreadColor);

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

  /* Ctrl + ` shortcut to toggle terminal */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '`' ) {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Lock body scroll when terminal is open */
  useEffect(() => {
    document.body.style.overflow = terminalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [terminalOpen]);

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
            color={threadColor}
            amplitude={1.2}
            distance={0.2}
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
          <Route path="/join" element={<JoinPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Full-screen terminal overlay */}
      <TerminalOverlay
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        commands={terminalCommands}
        navigate={navigate}
      />
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
