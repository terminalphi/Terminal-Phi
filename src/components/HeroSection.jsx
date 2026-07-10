import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { proceedToJoin } from '../auth';
import { getDeviceTier } from '../deviceTier';
import { accentRGBA, accentBright, getAccentHex } from '../themeColors';
import './HeroSection.css';

// Gold streak that rises from the click origin and explodes into a firework.
function launchStreak(canvas, originX, originY, callbacks) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // The streak travels from origin upward to ~30% of viewport height
  const targetY = H * 0.25;
  const streakLen = 35;
  let currentY = originY;
  let phase = 'streak'; // streak → burst → fade
  const particles = [];
  let rafId;

  const COLORS = [
    getAccentHex(), accentBright(0.45), accentBright(0.30),
    '#ffbd2e', accentBright(0.55), '#fff8dc',
  ];

  function spawnBurst(bx, by) {
    if (callbacks && callbacks.onExplode) callbacks.onExplode();
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 5;
      particles.push({
        x: bx, y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 1.2 + Math.random() * 2.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        decay: 0.01 + Math.random() * 0.012,
        gravity: 0.05 + Math.random() * 0.04,
      });
    }
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      particles.push({
        x: bx, y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 0.6 + Math.random() * 0.8,
        color: '#ffffff',
        alpha: 0.9,
        decay: 0.018 + Math.random() * 0.02,
        gravity: 0.02,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    if (phase === 'streak') {
      currentY -= 12;

      const grad = ctx.createLinearGradient(originX, currentY, originX, currentY + streakLen);
      grad.addColorStop(0, accentRGBA(1));
      grad.addColorStop(0.5, accentBright(0.45, 0.8));
      grad.addColorStop(1, accentRGBA(0));

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, currentY);
      ctx.lineTo(originX, currentY + streakLen);
      ctx.stroke();

      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(originX, currentY, 4, 0, Math.PI * 2);
      ctx.fillStyle = accentBright(0.45);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (Math.random() > 0.3) {
        particles.push({
          x: originX + (Math.random() - 0.5) * 4,
          y: currentY + streakLen * 0.5,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 1.5,
          radius: 0.5 + Math.random() * 1,
          color: getAccentHex(),
          alpha: 0.6,
          decay: 0.03 + Math.random() * 0.03,
          gravity: 0.02,
        });
      }

      if (currentY <= targetY) {
        phase = 'burst';
        spawnBurst(originX, currentY);
      }
    }

    let alive = phase === 'streak';
    for (const p of particles) {
      if (p.alpha <= 0) continue;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.alpha -= p.decay;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      ctx.globalAlpha = Math.max(0, p.alpha * 0.25);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (alive) {
      rafId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  animate();
  return () => cancelAnimationFrame(rafId);
}

// Full-screen black hole that devours the page (the cat easter egg).
function runBlackHole(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const maxR = Math.min(W, H) * 0.13;

  const COLORS = [getAccentHex(), accentBright(0.45), '#ffe9a8', '#ffffff', accentBright(0.30)];
  // Scale the particle count to the device so the spiral stays smooth on
  // weaker hardware without changing how the effect looks.
  const tier = getDeviceTier();
  const PARTICLE_COUNT = tier === 'low' ? 120 : tier === 'mid' ? 180 : 260;
  // Swirling accretion-disk matter, spread out then spiralling inward
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: maxR * 1.3 + Math.random() * Math.max(W, H) * 0.6,
    speed: 0.008 + Math.random() * 0.03,
    size: 0.5 + Math.random() * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 0.35 + Math.random() * 0.6,
  }));

  let rafId;
  let startTime = null;
  let lastTime = 0;
  const GROW_MS = 920; // time to fully open the singularity (was ~55 frames @60fps)

  function animate(now) {
    if (startTime === null) {
      startTime = now;
      lastTime = now;
    }
    // Drive everything off elapsed wall-clock time and a 60fps-normalised
    // frame-scale, so the animation runs at the SAME speed and stays smooth
    // on 30Hz, 60Hz and 144Hz displays alike (clamped to avoid post-stall jumps).
    const frameScale = Math.min((now - lastTime) / (1000 / 60), 4);
    lastTime = now;

    const grow = Math.min(1, (now - startTime) / GROW_MS);
    const r = maxR * grow;

    ctx.clearRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 3);
    glow.addColorStop(0, accentRGBA(0));
    glow.addColorStop(0.45, accentRGBA(0.30 * grow));
    glow.addColorStop(0.7, `rgba(255,233,168,${0.18 * grow})`);
    glow.addColorStop(1, accentRGBA(0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Accretion disk — particles spiral inward on a tilted ellipse
    for (const p of particles) {
      const pull = 1 + (r / (p.dist + 1)) * 3;
      p.angle += p.speed * pull * frameScale;
      p.dist -= (0.7 + p.speed * 34) * grow * frameScale;
      if (p.dist < r * 0.82) {
        p.dist = maxR * 1.3 + Math.random() * Math.max(W, H) * 0.55;
        p.angle = Math.random() * Math.PI * 2;
      }
      const px = cx + Math.cos(p.angle) * p.dist;
      const py = cy + Math.sin(p.angle) * p.dist * 0.5; // flatten into a disk
      ctx.globalAlpha = p.alpha * grow;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Soft halo around the core — drawn as a radial gradient instead of
    // canvas shadowBlur, which is the single most expensive 2D operation and
    // was the main cause of the lag (a blurred fill recomputed every frame).
    const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.9);
    halo.addColorStop(0, `rgba(242,215,133,${0.55 * grow})`);
    halo.addColorStop(0.5, `rgba(242,215,133,${0.18 * grow})`);
    halo.addColorStop(1, 'rgba(242,215,133,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2);
    ctx.fill();

    // Event horizon — pure black core
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.lineWidth = 2.4;
    ctx.strokeStyle = `rgba(255,242,205,${0.85 * grow})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
    ctx.stroke();

    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafId);
}

function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [subtitleText, setSubtitleText] = useState(
    'A tech society built for builders, not spectators.'
  );
  const [subtitleSwapped, setSubtitleSwapped] = useState(false);

  const fireworkFired = useRef(false);
  const [catClicked, setCatClicked] = useState(false);
  const [blackHole, setBlackHole] = useState('idle'); // 'idle' | 'consuming' | 'done'

  const cleanupRef = useRef(null);
  const subtitleTimeoutRef = useRef(null);
  const bhCanvasRef = useRef(null);
  const bhCleanupRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const resize = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleClick = useCallback(() => {
    if (fireworkFired.current) return;
    fireworkFired.current = true;

    const canvas = canvasRef.current;
    const scrollEl = scrollRef.current;
    const section = sectionRef.current;
    if (!canvas || !scrollEl || !section) return;

    // Origin — bottom of the scroll line.
    const sRect = section.getBoundingClientRect();
    const eRect = scrollEl.getBoundingClientRect();
    const originX = eRect.left - sRect.left + eRect.width / 2;
    const originY = eRect.top - sRect.top;

    scrollEl.classList.add('hero__scroll--fired');
    setSubtitleSwapped(true);

    if (catClicked) {
      // THE CAT REACHED THE DETONATOR — open a black hole that devours the site.
      cleanupRef.current?.();
      setSubtitleText('Curiosity killed the cat.');
      setBlackHole('consuming');
      return; // no firework, no reset — the page is being eaten
    }

    cleanupRef.current?.();
    cleanupRef.current = launchStreak(canvas, originX, originY);
    setSubtitleText('Curious soul?');

    gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
      height: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
          height: 40, duration: 0.8, ease: 'elastic.out(1, 0.4)',
        });
      },
    });

    clearTimeout(subtitleTimeoutRef.current);
    subtitleTimeoutRef.current = setTimeout(() => {
      setSubtitleSwapped(true);
      setSubtitleText('A tech society built for builders, not spectators.');
      setTimeout(() => setSubtitleSwapped(false), 600);
      fireworkFired.current = false;
    }, 4500);

  }, [catClicked]);

  /* Black-hole sequence: grow the singularity, suck the whole site into it,
     then reveal the RETRY button once the page is emptied. */
  useEffect(() => {
    if (blackHole !== 'consuming') return;
    const canvas = bhCanvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bhCleanupRef.current = runBlackHole(canvas);

    const root = document.getElementById('root');
    if (root) {
      gsap.to(root, {
        scale: 0.02,
        rotation: 420,
        opacity: 0,
        duration: 2.3,
        ease: 'power2.in',
        transformOrigin: '50% 50%',
      });
    }

    // Once the page has been fully swallowed, kill the spiral animation and
    // leave only a black screen with the message + retry button.
    const t = setTimeout(() => {
      bhCleanupRef.current?.();
      bhCleanupRef.current = null;
      setBlackHole('done');
    }, 2400);
    return () => {
      clearTimeout(t);
      bhCleanupRef.current?.();
      bhCleanupRef.current = null;
    };
  }, [blackHole]);

  const handleCatClick = useCallback(() => {
    if (catClicked) return;
    setCatClicked(true);
    // Spawn the oneko cat that follows the cursor
    window.dispatchEvent(new Event('spawn-oneko'));
  }, [catClicked]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      bhCleanupRef.current?.();
      clearTimeout(subtitleTimeoutRef.current);
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__bg-grid" />
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />

      <canvas className="hero__firework-canvas" ref={canvasRef} />

      <div className="hero__content container">
        <div className={`hero__text ${visible ? 'hero__text--visible' : ''}`}>
          <div className="hero__badge" style={{ display: 'none' }}>
          </div>

          <h1 className="hero__title">
            <span className="hero__title-line">TERMINAL</span>
            <span className="hero__title-line hero__title-accent">PHI</span>
          </h1>

          <p className={`hero__subtitle ${subtitleSwapped ? 'hero__subtitle--swapped' : ''}`}>
            {subtitleText}
          </p>

          <div className="hero__terminal-bar">
            <span className="hero__terminal-dots">
              <span /><span /><span />
            </span>
            <span className="hero__terminal-text">
              ~/terminal-phi $ <span className="hero__terminal-cmd">
                <span className="hero__terminal-cmd-cat" onClick={handleCatClick}>
                  cat
                </span> mission.txt
              </span>
            </span>
          </div>

          <div className="hero__cta-group">
            <button onClick={() => proceedToJoin(navigate)} className="hero__cta-primary hero__cta-primary--lg">
              JOIN US
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`hero__code-block ${visible ? 'hero__code-block--visible' : ''}`}>
          <div className="hero__code-header">
            <span className="hero__code-dots">
              <span className="hero__code-dot hero__code-dot--red" />
              <span className="hero__code-dot hero__code-dot--yellow" />
              <span className="hero__code-dot hero__code-dot--green" />
            </span>
            <span className="hero__code-filename">terminal_phi.py</span>
          </div>
          <pre className="hero__code-content">
            <code>
              <span className="hero__code-keyword">class</span> <span className="hero__code-class">TerminalPhi</span>:<br />
              {'    '}<span className="hero__code-keyword">def</span> <span className="hero__code-func">__init__</span>(self):<br />
              {'        '}self.name = <span className="hero__code-string">"Terminal Phi"</span><br />
              {'        '}self.focus = [<br />
              {'            '}<span className="hero__code-string">"projects"</span>,<br />
              {'            '}<span className="hero__code-string">"hackathons"</span>,<br />
              {'            '}<span className="hero__code-string">"competitive_prog"</span>,<br />
              {'            '}<span className="hero__code-string">"system_design"</span><br />
              {'        '}]<br />
              <br />
              {'    '}<span className="hero__code-keyword">def</span> <span className="hero__code-func">build</span>(self):<br />
              {'        '}<span className="hero__code-keyword">return</span> <span className="hero__code-string">"shipping..."</span>
            </code>
          </pre>
        </div>
      </div>

      <div className="hero__scroll" ref={scrollRef} onClick={handleClick}>
        <span className="hero__scroll-line" />
        <span className="hero__scroll-text" style={{ color: 'black' }}>No</span>
      </div>

      {/* Full-screen black hole (rendered to <body> so it survives the page
          being sucked into it) */}
      {blackHole !== 'idle' && createPortal(
        <div className={`blackhole${blackHole === 'done' ? ' blackhole--done' : ''}`}>
          {blackHole === 'consuming' && (
            <canvas ref={bhCanvasRef} className="blackhole__canvas" />
          )}
          {blackHole === 'done' && (
            <div className="blackhole__retry">
              <p className="blackhole__msg">Curiosity killed the cat.</p>
              <button className="blackhole__btn" onClick={() => window.location.reload()}>
                RETRY
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </section>
  );
}

export default HeroSection;
