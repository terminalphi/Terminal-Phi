import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { getCurrentUser, onAuthChange, logoutUser } from '../auth';
import './PillNav.css';

const userName = (user) =>
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  (user?.email ? user.email.split('@')[0] : 'there');

const userAvatar = (user) =>
  user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

const PillNav = ({
  items,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#0a0a0a',
  pillColor = '#1a1a1a',
  hoveredPillTextColor = '#e8e8e8',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeHref = location.pathname;

  // "Login" just authenticates and returns to /home (no redirect to the form)
  const handleLogin = () => navigate('/signin');
  const resolvedPillTextColor = pillTextColor ?? '#e8e8e8';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  // Filter out nav items that require auth when user isn't signed in
  const filteredItems = useMemo(
    () => items.filter(item => !item.requiresAuth || user),
    [items, user]
  );

  // Track auth state — show the user icon once signed in
  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => { if (mounted) setUser(u); }).catch(() => {});
    const sub = onAuthChange((u) => setUser(u));
    return () => { mounted = false; sub?.unsubscribe?.(); };
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleSignOut = async () => {
    await logoutUser();
    setUser(null);
    setUserMenuOpen(false);
  };
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, { scale: 1, duration: 0.6, ease });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3, ease, overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2, ease, overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(menu,
          { opacity: 0, y: 10, scaleY: 1 },
          { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' }
        );
      } else {
        gsap.to(menu, {
          opacity: 0, y: 10, scaleY: 1, duration: 0.2, ease, transformOrigin: 'top center',
          onComplete: () => gsap.set(menu, { visibility: 'hidden' })
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = href =>
    href.startsWith('http://') || href.startsWith('https://') ||
    href.startsWith('//') || href.startsWith('mailto:') ||
    href.startsWith('tel:') || href.startsWith('#');

  const isRouterLink = href => href && !isExternalLink(href);

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor
  };

  return (
    <nav className={`pill-nav-container ${scrolled ? 'pill-nav-container--scrolled' : ''} ${className}`} aria-label="Primary" style={cssVars}>
      <div className="pill-nav-inner">
        <Link
          className="pill-logo"
          to="/home"
          aria-label="Home"
          role="menuitem"
          ref={el => { logoRef.current = el; }}
        >
          <video
            className="pill-logo-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="https://assets.terminalphi.xyz/navbar_logo.webm" type="video/webm" />
          </video>
          <span className="pill-logo-text">
            <span className="pill-logo-prompt">&gt; </span>terminal phi
          </span>
        </Link>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {filteredItems.map((item, i) => (
              <li key={item.href || `item-${i}`} role="none">
                {isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span className="hover-circle" aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el; }} />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span className="hover-circle" aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el; }} />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="pill-nav-actions">
          {user ? (
            <div className="pill-user desktop-only" ref={userMenuRef}>
              <button
                type="button"
                className="pill-user-icon"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-label="Account"
                aria-expanded={userMenuOpen}
              >
                {userAvatar(user) ? (
                  <img src={userAvatar(user)} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span>{userName(user).charAt(0).toUpperCase()}</span>
                )}
              </button>
              {userMenuOpen && (
                <div className="pill-user-menu">
                  <div className="pill-user-welcome">Welcome, {userName(user)}</div>
                  <div className="pill-user-email">{user.email}</div>
                  <Link to="/dashboard" className="pill-user-dashboard" onClick={() => setUserMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button type="button" className="pill-user-signout" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={handleLogin} className="pill-join-btn desktop-only">
              Login
            </button>
          )}

          <button
            className="mobile-menu-button mobile-only"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {filteredItems.map((item, i) => (
            <li key={item.href || `mobile-item-${i}`}>
              {isRouterLink(item.href) ? (
                <Link
                  to={item.href}
                  className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    const menu = mobileMenuRef.current;
                    if (menu) gsap.set(menu, { visibility: 'hidden', opacity: 0 });
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    const menu = mobileMenuRef.current;
                    if (menu) gsap.set(menu, { visibility: 'hidden', opacity: 0 });
                  }}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
          {user ? (
            <li key="user-mobile" className="mobile-menu-user">
              <div className="pill-user-welcome">Welcome, {userName(user)}</div>
              <div className="pill-user-email">{user.email}</div>
              <button type="button" className="pill-user-signout" onClick={handleSignOut}>
                Sign out
              </button>
            </li>
          ) : (
            <li key="login-mobile">
               <button
                  type="button"
                  className="mobile-menu-join"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    const menu = mobileMenuRef.current;
                    if (menu) gsap.set(menu, { visibility: 'hidden', opacity: 0 });
                    handleLogin();
                  }}
                >
                  Login
               </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default PillNav;
