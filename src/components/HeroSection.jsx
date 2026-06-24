import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './HeroSection.css';

/* ─── Gold streak + firework burst ─── */
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
    '#d4af37', '#f2d785', '#e5c07b',
    '#ffbd2e', '#c9a227', '#fff8dc',
  ];

  function spawnBurst(bx, by) {
    if (callbacks && callbacks.onExplode) callbacks.onExplode();
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
      currentY -= 12;

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

      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(originX, currentY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f2d785';
      ctx.fill();
      ctx.globalAlpha = 1;

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

/* ─── Black Hole Animation ─── */
function createBlackHole(canvas, originX, originY, callbacks) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  
  let radius = 0;
  const maxRadius = 12;
  const particles = [];
  let rafId;
  let frames = 0;

  const GOLD_COLORS = ['#d4af37', '#f2d785', '#e5c07b', '#ffffff'];

  for (let i = 0; i < 70; i++) {
    particles.push({
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 180 + 20,
      speed: 0.03 + Math.random() * 0.04,
      size: 0.8 + Math.random() * 1.5,
      color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)]
    });
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    frames++;

    if (frames < 30) {
      radius += (maxRadius - radius) * 0.15; // Ease out
    } else if (frames > 120) {
      radius -= radius * 0.2; // Shrink quickly
    }

    // Draw event horizon (the black hole)
    ctx.beginPath();
    ctx.arc(originX, originY, Math.max(0, radius), 0, Math.PI * 2);
    ctx.fillStyle = '#050505';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = radius > 5 ? radius * 2.5 : 0;
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw accretion disk particles
    for (const p of particles) {
      p.angle += p.speed;
      
      // Suck in if black hole is active
      if (frames > 10 && frames < 120) {
        p.distance -= 2 + p.speed * 40;
      }
      
      if (p.distance > radius * 0.8) {
        const px = originX + Math.cos(p.angle) * p.distance;
        const py = originY + Math.sin(p.angle) * p.distance;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    }

    if (frames > 140 && radius < 1) {
      ctx.clearRect(0, 0, W, H);
      if (callbacks && callbacks.onComplete) callbacks.onComplete();
      return;
    }

    rafId = requestAnimationFrame(animate);
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
  
  // Easter egg states
  const fireworkFired = useRef(false);
  const [catClicked, setCatClicked] = useState(false);
  const [showCat, setShowCat] = useState(false);
  
  const cleanupRef = useRef(null);
  const subtitleTimeoutRef = useRef(null);
  const catSpriteRef = useRef(null);

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

    // Visual feedback on scroll indicator
    scrollEl.classList.add('hero__scroll--fired');

    // Swap subtitle based on cat state
    setSubtitleSwapped(true);
    
    if (catClicked && showCat && catSpriteRef.current) {
      // THE CAT IS HERE! Spawn the Black Hole
      cleanupRef.current?.();
      cleanupRef.current = createBlackHole(canvas, originX, originY);

      setSubtitleText('Curious soul? But curiosity killed the cat.');

      // Animate cat getting sucked into the black hole!
      gsap.to(catSpriteRef.current, {
        y: "+=40", // Move it 40px down perfectly into the center of the scroll indicator
        scale: 0,
        rotation: 720,
        duration: 1,
        ease: 'power3.in',
        delay: 0.3, // wait for black hole to form slightly
        onComplete: () => setShowCat(false)
      });
      
      // eslint-disable-next-line no-console
      console.log('%c 🕳️ Cat consumed by singularity! ', 'background: #000; color: #9d4edd; font-size: 14px; font-weight: bold;');

      // Still do the scroll line animation
      gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
        height: 0, duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
            height: 40, duration: 0.8, ease: 'elastic.out(1, 0.4)', delay: 1.5 // Wait for black hole to finish
          });
        },
      });

    } else {
      // Normal Firework
      cleanupRef.current?.();
      cleanupRef.current = launchStreak(canvas, originX, originY);
      
      setSubtitleText('Curious soul?');
      
      // Animate the scroll line
      gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
        height: 0, duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          gsap.to(scrollEl.querySelector('.hero__scroll-line'), {
            height: 40, duration: 0.8, ease: 'elastic.out(1, 0.4)',
          });
        },
      });
    }

    clearTimeout(subtitleTimeoutRef.current);
    subtitleTimeoutRef.current = setTimeout(() => {
      setSubtitleSwapped(true);
      setSubtitleText('A college coding society built for builders, not spectators.');
      setTimeout(() => setSubtitleSwapped(false), 600);
      fireworkFired.current = false; // Reset the ability to trigger it again
    }, 4500);

  }, [catClicked, showCat]);

  /* Handle "cat" word click */
  const handleCatClick = useCallback(() => {
    if (catClicked) return;
    setCatClicked(true);
    setShowCat(true);

    // Wait for DOM to render the cat sprite, then animate
    setTimeout(() => {
      const sprite = catSpriteRef.current;
      const scrollEl = scrollRef.current;
      if (!sprite || !scrollEl) return;

      const spriteRect = sprite.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      
      // Calculate delta to move exactly above the scroll indicator
      const destX = scrollRect.left + scrollRect.width / 2 - (spriteRect.left + spriteRect.width / 2);
      const destY = scrollRect.top - spriteRect.top - 40;

      const tl = gsap.timeline();
      
      // Phase 1: Pop out
      tl.fromTo(sprite, 
        { scale: 0, y: 0, opacity: 1, rotation: 0, x: 0 },
        { scale: 2.5, y: -40, duration: 0.5, ease: 'back.out(1.5)' }
      );

      // Phase 2: Panic shake
      tl.to(sprite, { 
        rotation: 15, duration: 0.1, yoyo: true, repeat: 3 
      }, "+=0.1");

      // Phase 3: Walk/Hop to the firework detonator
      tl.to(sprite, { 
        x: destX, 
        y: destY, 
        duration: 1.5, 
        ease: 'power1.inOut' 
      }, "+=0.2");

    }, 0);
  }, [catClicked]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      clearTimeout(subtitleTimeoutRef.current);
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__bg-grid" />
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />

      {/* Firework / BlackHole canvas */}
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
                  {showCat && <span className="hero__cat-sprite" ref={catSpriteRef}>🐱</span>}
                </span> mission.txt
              </span>
            </span>
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
