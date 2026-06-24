import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './HeroSection.css';

/* ─── Gold streak + firework burst ─── */
function launchStreak(canvas, originX, originY) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // The streak travels from origin upward to ~30% of viewport height
  const targetY = H * 0.25;
  const streakLen = 35;
  let currentY = originY;
  let streakAlpha = 1;
  let phase = 'streak'; // streak → burst → fade
  const particles = [];
  let rafId;

  const COLORS = [
    '#d4af37', '#f2d785', '#e5c07b',
    '#ffbd2e', '#c9a227', '#fff8dc',
    '#ff5f57', '#28c840', '#61afef',
  ];

  function spawnBurst(bx, by) {
    // Main burst
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
    // Sparkle ring
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
      // Move streak upward
      currentY -= 12;

      // Draw the slim gold streak (a thin glowing line)
      const grad = ctx.createLinearGradient(originX, currentY, originX, currentY + streakLen);
      grad.addColorStop(0, 'rgba(212, 175, 55, 1)');
      grad.addColorStop(0.5, 'rgba(242, 215, 133, 0.8)');
      grad.addColorStop(1, 'rgba(212, 175, 55, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, currentY);
      ctx.lineTo(originX, currentY + streakLen);
      ctx.stroke();

      // Glow around the tip
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(originX, currentY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f2d785';
      ctx.fill();
      ctx.globalAlpha = 1;

      // Tiny trail particles
      if (Math.random() > 0.3) {
        particles.push({
          x: originX + (Math.random() - 0.5) * 4,
          y: currentY + streakLen * 0.5,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 1.5,
          radius: 0.5 + Math.random() * 1,
          color: '#d4af37',
          alpha: 0.6,
          decay: 0.03 + Math.random() * 0.03,
          gravity: 0.02,
        });
      }

      // When streak reaches target, explode
      if (currentY <= targetY) {
        phase = 'burst';
        spawnBurst(originX, currentY);
      }
    }

    // Draw all particles
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

      // Glow
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

function HeroSection() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [subtitleText, setSubtitleText] = useState(
    'A college coding society built for builders, not spectators.'
  );
  const [subtitleSwapped, setSubtitleSwapped] = useState(false);
  const fireworkFired = useRef(false);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  /* Resize canvas to match section */
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

  /* Fire on click of the scroll indicator */
  const handleClick = useCallback(() => {
    if (fireworkFired.current) return;
    fireworkFired.current = true;

    const canvas = canvasRef.current;
    const scrollEl = scrollRef.current;
    const section = sectionRef.current;
    if (!canvas || !scrollEl || !section) return;

    // Get origin — bottom of the scroll line
    const sRect = section.getBoundingClientRect();
    const eRect = scrollEl.getBoundingClientRect();
    const originX = eRect.left - sRect.left + eRect.width / 2;
    const originY = eRect.top - sRect.top;

    // Launch the gold streak → firework
    cleanupRef.current = launchStreak(canvas, originX, originY);

    // Visual feedback on scroll indicator
    scrollEl.classList.add('hero__scroll--fired');

    // Animate the scroll line shrinking then bouncing back
    gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
      height: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
          height: 40,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)',
        });
      },
    });

    // Swap subtitle
    setSubtitleSwapped(true);
    setSubtitleText('you clicked. we noticed. welcome to the club. 🚀');

    setTimeout(() => {
      setSubtitleSwapped(true);
      setSubtitleText('A college coding society built for builders, not spectators.');
      setTimeout(() => setSubtitleSwapped(false), 600);
    }, 4000);

    // Console easter egg
    // eslint-disable-next-line no-console
    console.log(
      '%c 🎆 you found the firework! ',
      'background: #d4af37; color: #050505; font-size: 14px; padding: 4px 12px; border-radius: 4px; font-weight: bold;'
    );
  }, []);

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__bg-grid" />
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />

      {/* Firework canvas */}
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
            <span className="hero__terminal-text">~/terminal-phi $ <span className="hero__terminal-cmd">cat mission.txt</span></span>
          </div>

          <div className="hero__cta-group">
            <button onClick={() => window.location.href='/activities'} className="hero__cta-primary">
              EXPLORE ACTIVITIES
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
              </svg>
            </button>
            <button onClick={() => window.location.href='/about_us'} className="hero__cta-secondary">Learn More</button>
          </div>
        </div>

        {/* Decorative code block */}
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

      {/* Scroll indicator — click to launch */}
      <div className="hero__scroll" ref={scrollRef} onClick={handleClick}>
        <span className="hero__scroll-line" />
        <span className="hero__scroll-text">scroll</span>
      </div>
    </section>
  );
}

export default HeroSection;
