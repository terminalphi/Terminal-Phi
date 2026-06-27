import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('video'); // video -> logo -> ready
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const videoRef = useRef(null);
  const fullText = '> initializing terminal_phi...';

  // If user has visited before, skip intro and go straight to home
  useEffect(() => {
    if (localStorage.getItem('hasVisited') === 'true') {
      navigate('/home');
    }
  }, [navigate]);

  // Video end handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setPhase('logo');
    };

    const handleError = () => {
      // If video fails to load, skip to logo phase
      setPhase('logo');
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Auto-advance if video doesn't load in 8 seconds
    const timeout = setTimeout(() => {
      if (phase === 'video') setPhase('logo');
    }, 8000);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [phase]);

  // Typewriter effect — starts shortly after the logo has faded in, so the
  // intro → logo → text sequence reads as one continuous, coherent flow.
  useEffect(() => {
    if (phase !== 'logo') return;

    let i = 0;
    let interval;
    let readyTimer;
    const startDelay = setTimeout(() => {
      interval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          readyTimer = setTimeout(() => setPhase('ready'), 500);
        }
      }, 55);
    }, 450);

    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
      clearTimeout(readyTimer);
    };
  }, [phase]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    localStorage.setItem('hasVisited', 'true');
    navigate('/home');
  };

  const handleSkipVideo = () => {
    setPhase('logo');
  };

  return (
    <div className="landing">
      {/* Background grid */}
      <div className="landing__grid" />

      {/* Ambient glow orbs */}
      <div className="landing__orb landing__orb--1" />
      <div className="landing__orb landing__orb--2" />

      {/* Scanline effect */}
      <div className="landing__scanline" />

      <div className="landing__content">
        {/* Video Phase */}
        <div className={`landing__video-wrapper ${phase !== 'video' ? 'landing__video-wrapper--hidden' : ''}`}>
          <video
            ref={videoRef}
            className="landing__video"
            autoPlay
            muted
            playsInline
            preload="auto"
          >
            <source src="https://res.cloudinary.com/dtsgjbckj/video/upload/v1782581549/logo_animation_reversed_rxeand.webm" type="video/webm" />
          </video>
          <button
            className="landing__skip"
            onClick={handleSkipVideo}
            aria-label="Skip animation"
          >
            SKIP
          </button>
        </div>

        {/* Logo & Text Phase */}
        <div className={`landing__main ${phase !== 'video' ? 'landing__main--visible' : ''}`}>
          {/* SVG Logo */}
          <div className="landing__logo-container">
            <img
              src="https://res.cloudinary.com/dtsgjbckj/image/upload/v1782581071/terminal_phi_logo_aid75r.svg"
              alt="Terminal Phi"
              className="landing__logo"
            />
          </div>

          {/* Typewriter Text */}
          <div className="landing__terminal-line">
            <span className="landing__typed">{typedText}</span>
            <span className={`landing__cursor ${showCursor ? '' : 'landing__cursor--hidden'}`}>█</span>
          </div>

          {/* Enter Button */}
          <button
            className={`landing__enter-btn ${phase === 'ready' ? 'landing__enter-btn--visible' : ''}`}
            onClick={handleEnter}
            id="enter-button"
          >
            <span className="landing__enter-text">ENTER</span>
            <span className="landing__enter-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>


        </div>
      </div>
    </div>
  );
}

export default LandingPage;
