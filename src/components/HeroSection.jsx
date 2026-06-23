import { useEffect, useRef, useState } from 'react';
import './HeroSection.css';

function HeroSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__bg-grid" />
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />

      <div className="hero__content container">
        <div className={`hero__text ${visible ? 'hero__text--visible' : ''}`}>
          <div className="hero__badge" style={{ display: 'none' }}>
          </div>

          <h1 className="hero__title">
            <span className="hero__title-line">TERMINAL</span>
            <span className="hero__title-line hero__title-accent">PHI</span>
          </h1>

          <p className="hero__subtitle">
            A college coding society built for builders, not spectators.
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
              {'        '}self.open_for = <span className="hero__code-string">"juniors"</span><br />
              <br />
              {'    '}<span className="hero__code-keyword">def</span> <span className="hero__code-func">build</span>(self):<br />
              {'        '}<span className="hero__code-keyword">return</span> <span className="hero__code-string">"shipping..."</span>
            </code>
          </pre>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll">
        <span className="hero__scroll-line" />
        <span className="hero__scroll-text">scroll</span>
      </div>
    </section>
  );
}

export default HeroSection;
