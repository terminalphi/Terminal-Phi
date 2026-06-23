import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../auth';
import './SignInPage.css';

function SignInPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setStatusText('> redirecting to google...');
    try {
      await signInWithGoogle();
      // Supabase OAuth redirects the browser, so code below may not execute
      setStatusText('> auth successful');
    } catch (error) {
      console.error(error);
      setStatusText('> auth failed: ' + error.message);
      setIsLoading(false);
    }
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
        <div className="signin__form">
          <button
            onClick={handleGoogleLogin}
            className={`signin__submit ${isLoading ? 'signin__submit--loading' : ''}`}
            disabled={isLoading}
            style={{ marginTop: '20px' }}
          >
            {isLoading ? (
              <span className="signin__spinner" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span style={{ marginLeft: '12px' }}>SIGN IN WITH GOOGLE</span>
              </>
            )}
          </button>

          {/* Status line */}
          {statusText && (
            <div className="signin__status">
              <span className="signin__status-dot" />
              <span className="signin__status-text">{statusText}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="signin__divider">
          <span className="signin__divider-line" />
          <span className="signin__divider-text">or</span>
          <span className="signin__divider-line" />
        </div>

        {/* Guest */}
        <button className="signin__guest" onClick={handleGuest} id="guest-button">
          continue as guest
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
