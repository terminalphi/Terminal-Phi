import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignInPage.css';

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusText('> authenticating...');

    // Simulate auth delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    setStatusText('> access granted');

    await new Promise(resolve => setTimeout(resolve, 600));
    navigate('/home');
  };

  const handleGuest = () => {
    navigate('/home');
  };

  return (
    <div className="signin">
      {/* Background */}
      <div className="signin__grid" />
      <div className="signin__orb signin__orb--1" />
      <div className="signin__orb signin__orb--2" />
      <div className="signin__orb signin__orb--3" />

      {/* Back button */}
      <button className="signin__back" onClick={() => navigate('/')} aria-label="Go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>back</span>
      </button>

      {/* Card */}
      <div className={`signin__card ${showContent ? 'signin__card--visible' : ''}`}>
        {/* Decorative top border */}
        <div className="signin__card-glow" />

        {/* Logo */}
        <div className="signin__logo-wrapper">
          <img src="/terminal_phi_logo.svg" alt="Terminal Phi" className="signin__logo" />
        </div>

        {/* Title */}
        <div className="signin__header">
          <span className="signin__prompt">&gt; authenticate</span>
          <p className="signin__subtitle">Enter your credentials to access Terminal Phi</p>
        </div>

        {/* Form */}
        <form className="signin__form" onSubmit={handleSubmit} id="signin-form">
          <div className={`signin__field ${focusedField === 'email' ? 'signin__field--focused' : ''}`}>
            <label className="signin__label" htmlFor="signin-email">
              <span className="signin__label-prompt">&gt;</span> email
            </label>
            <input
              id="signin-email"
              type="email"
              className="signin__input"
              placeholder="user@terminal.phi"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>

          <div className={`signin__field ${focusedField === 'password' ? 'signin__field--focused' : ''}`}>
            <label className="signin__label" htmlFor="signin-password">
              <span className="signin__label-prompt">&gt;</span> password
            </label>
            <input
              id="signin-password"
              type="password"
              className="signin__input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>

          {/* Status line */}
          {statusText && (
            <div className="signin__status">
              <span className="signin__status-dot" />
              <span className="signin__status-text">{statusText}</span>
            </div>
          )}

          <button
            type="submit"
            className={`signin__submit ${isLoading ? 'signin__submit--loading' : ''}`}
            disabled={isLoading}
            id="signin-submit"
          >
            {isLoading ? (
              <span className="signin__spinner" />
            ) : (
              <>
                <span>ACCESS GRANTED</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="signin__divider">
          <span className="signin__divider-line" />
          <span className="signin__divider-text">or</span>
          <span className="signin__divider-line" />
        </div>

        {/* Guest */}
        <button className="signin__guest" onClick={handleGuest} id="guest-button">
          continue as guest →
        </button>
      </div>

      {/* Footer hint */}
      <p className="signin__footer-hint">
        <span className="signin__footer-dot" /> Terminal Phi © 2026
      </p>
    </div>
  );
}

export default SignInPage;
