import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <div className="navbar__links">
          <button className={`navbar__link ${isActive('/about_us') ? 'navbar__link--active' : ''}`} onClick={() => handleNav('/about_us')}>ABOUT</button>
          <button className={`navbar__link ${isActive('/activities') ? 'navbar__link--active' : ''}`} onClick={() => handleNav('/activities')}>ACTIVITIES</button>
          <button className="navbar__link" onClick={() => handleNav('#events')}>EVENTS</button>
          <button className="navbar__link" onClick={() => handleNav('#contact')}>CONTACT</button>
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          <button className="navbar__join-btn" onClick={() => handleNav('#contact')}>
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
        <button className="navbar__mobile-link" onClick={() => handleNav('#events')}>EVENTS</button>
        <button className="navbar__mobile-link" onClick={() => handleNav('#contact')}>CONTACT</button>
        <button className="navbar__mobile-join" onClick={() => handleNav('#contact')}>Join Us</button>
      </div>
    </nav>
  );
}

export default Navbar;
