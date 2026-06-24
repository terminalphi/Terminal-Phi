import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { signInWithGoogleToken } from '../auth';
import './SignInPage.css';

function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Where to land after auth. Defaults to /home (e.g. the navbar "Login" flow).
  const next = searchParams.get('next') || '/home';
  const [showContent, setShowContent] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setStatusText('> authenticating...');
    try {
      const idToken = credentialResponse.credential;
      await signInWithGoogleToken(idToken);
      setStatusText('> access granted. redirecting...');
      setTimeout(() => navigate(next), 600);
    } catch (error) {
      console.error(error);
      setStatusText('> auth failed: ' + (error?.message || 'could not verify token'));
    }
  };

  const handleGoogleError = () => {
    setStatusText('> auth failed: google login was cancelled');
  };

  const handleGuest = () => {
    navigate(next);
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

        {/* Google Login Button */}
        <div className="signin__form">
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              size="large"
              width="320"
              text="signin_with"
              shape="pill"
            />
          </div>

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
