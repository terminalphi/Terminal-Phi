import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (path) => {
    setMobileOpen(false);
    if (path.startsWith('#')) {
      const el = document.getElementById(path.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <a className="navbar__logo" onClick={() => navigate('/home')} aria-label="Terminal Phi — Home">
          <video
            className="navbar__logo-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/logo_navbar.mp4" type="video/mp4" />
          </video>
          <span className="navbar__logo-text">
            <span className="navbar__logo-prompt">&gt; </span>terminal phi
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="navbar__links" onMouseLeave={() => setHoveredPath(null)}>
          {[
            { path: '/about_us', label: 'ABOUT' },
            { path: '/activities', label: 'ACTIVITIES' },
            { path: '/events', label: 'EVENTS' },
            { path: '/team', label: 'TEAM' },
            { path: '#contact', label: 'CONTACT' },
          ].map(({ path, label }) => {
            const active = isActive(path);
            const isHovered = hoveredPath === path;
            return (
              <button
                key={path}
                className={`navbar__link ${active ? 'navbar__link--active' : ''} ${isHovered ? 'navbar__link--hovered' : ''}`}
                onClick={() => handleNav(path)}
                onMouseEnter={() => setHoveredPath(path)}
              >
                {isHovered && (
                  <motion.div
                    layoutId="pill-nav"
                    className="navbar__link-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="navbar__link-label">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          <button className={`navbar__join-btn ${isActive('/join_us') ? 'navbar__join-btn--active' : ''}`} onClick={() => handleNav('/join_us')}>
            Join Us
          </button>
          <button
            className="navbar__menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}>
              <span /><span /><span />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${mobileOpen ? 'navbar__mobile--open' : ''}`}>
        <button className="navbar__mobile-link" onClick={() => handleNav('/about_us')}>ABOUT</button>
        <button className="navbar__mobile-link" onClick={() => handleNav('/activities')}>ACTIVITIES</button>
        <button className="navbar__mobile-link" onClick={() => handleNav('/events')}>EVENTS</button>
        <button className="navbar__mobile-link" onClick={() => handleNav('/team')}>TEAM</button>
        <button className="navbar__mobile-link" onClick={() => handleNav('#contact')}>CONTACT</button>
        <button className="navbar__mobile-join" onClick={() => handleNav('/join_us')}>Join Us</button>
      </div>
    </nav>
  );
}

export default Navbar;
