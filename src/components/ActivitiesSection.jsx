import { useEffect, useRef, useState, useCallback } from 'react';
import { getDeviceTier, CANVAS_FPS } from '../deviceTier';
import './ActivitiesSection.css';

// Two graph zones, each with its own category label and set of cards.
// The SVG engine adapts automatically as cards are added or removed.
const zones = [
  {
    label: 'Build & Ship',
    cards: [
      {
        title: 'Project Building',
        tags: ['Core', 'Hands-on'],
        desc: 'Build real-world projects from scratch and gain exposure to real-world challenges. From full-stack web apps to ML pipelines — ship production-grade code, not toy examples.',
        
      },
      {
        title: 'Real World Problem Solving',
        tags: ['Core', 'problem solving'],
        desc: 'Tackle real-world problems and develop practical solutions. Gain experience in identifying, analyzing, and resolving complex challenges.',
        
      },
      {
        title: 'Internal Hackathons',
        tags: ['Events'],
        desc: 'internal hackathons to create a safe space to experiment, fail fast, and iterate.',
      
      },
    ],
  },
  {
    label: 'Sharpen & Grow',
    cards: [
      {
        title: 'Core CS Subjects',
        tags: ['Fundamentals'],
        desc: 'Learn and Master the fundamentals — Operating Systems, DBMS, Computer Networks, and OOP. Get guidance and material to build your expertise.',
        
      },
      {
        title: 'System Design',
        tags: ['Advanced'],
        desc: 'Learn system design with guidance and material to support your learning journey to build scalable systems. Gain exposure to real-world design challenges and best practices.',
      
      },
      {
        title: 'DSA / Competitive Programming',
        tags: ['fortnightly/monthly'],
        desc: 'We aim to foster a healthy competitive environment for sharpening problem solving skills.',
        
      },
    ],
  },
];

// Colour tokens for the SVG graph engine.
const C = {
  LINE:   'rgba(212,175,55,0.3)',    // default connector stroke
  LINE_H: '#d4af37',                 // hover connector stroke
  DOT:    'rgba(212,175,55,0.5)',    // flowing dot default
  DOT_H:  '#f2d785',                 // flowing dot hover
  END:    'rgba(255,255,255,0.15)',   // endpoint ring default
  END_H:  '#d4af37',                 // endpoint ring hover
  SRC:    '#d4af37',                 // source dot at category node
};

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function relPos(el, ancestor) {
  const eR = el.getBoundingClientRect();
  const aR = ancestor.getBoundingClientRect();
  return {
    l: eR.left - aR.left,
    t: eR.top - aR.top,
    w: eR.width,
    h: eR.height,
    r: eR.right - aR.left,
    b: eR.bottom - aR.top,
  };
}

function ActivitiesSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const dotsRef = useRef([]);
  const rafRef = useRef(null);
  // Throttle the dot animation on weaker hardware; dot motion is frame-scaled
  // (relative to 60fps) so dots travel at the same speed at any frame rate.
  const lastTickRef = useRef(0);
  const tickIntervalRef = useRef(
    CANVAS_FPS[getDeviceTier()] > 0 ? 1000 / CANVAS_FPS[getDeviceTier()] : 0
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    const fallback = setTimeout(() => setVisible(true), 400);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const initZone = useCallback((id) => {
    const zone = document.getElementById(`act-zone-${id}`);
    const svg = document.getElementById(`act-svg-${id}`);
    const node = document.getElementById(`act-node-${id}`);
    const cards = zone ? zone.querySelectorAll('.act-card') : [];
    if (!zone || !svg || !node || !cards.length) return;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    svg.setAttribute('width', zone.offsetWidth);
    svg.setAttribute('height', zone.offsetHeight);

    // Source: bottom-center of category node
    const np = relPos(node, zone);
    const sx = np.l + np.w / 2;
    const sy = np.b;

    svg.appendChild(svgEl('circle', { cx: sx, cy: sy, r: 4, fill: C.SRC }));

    cards.forEach((card, i) => {
      const cp = relPos(card, zone);
      const tx = cp.l + cp.w / 2;
      // End the path right on the card's top endpoint ring so the line +
      // flowing dot visibly connect into the card.
      const ty = cp.t;
      const dy = ty - sy;

      const c1y = sy + dy * 0.6;
      const c2y = ty - dy * 0.2;
      const d = `M${sx},${sy} C${sx},${c1y} ${tx},${c2y} ${tx},${ty}`;

      const path = svgEl('path', {
        d,
        fill: 'none',
        stroke: C.LINE,
        'stroke-width': '1.2',
        'stroke-linecap': 'round',
      });
      svg.appendChild(path);

      // Flowing animated dot — clamped so it stops before path end
      const dot = svgEl('circle', { cx: tx, cy: ty, r: 3, fill: C.DOT });
      svg.appendChild(dot);

      const pLen = path.getTotalLength();
      dotsRef.current.push({
        el: dot, path, len: pLen,
        prog: (i / cards.length) * 0.80 + 0.05,
        spd: 0.0013 + Math.random() * 0.0009,
        maxProg: 1,
      });

      card.addEventListener('mouseenter', () => {
        path.setAttribute('stroke', C.LINE_H);
        path.setAttribute('stroke-width', '1.8');
        dot.setAttribute('fill', C.DOT_H);
        dot.setAttribute('r', '4.5');
      });

      card.addEventListener('mouseleave', () => {
        path.setAttribute('stroke', C.LINE);
        path.setAttribute('stroke-width', '1.2');
        dot.setAttribute('fill', C.DOT);
        dot.setAttribute('r', '3');
      });
    });
  }, []);

  const tick = useCallback((t) => {
    rafRef.current = requestAnimationFrame(tick);
    const interval = tickIntervalRef.current;
    if (interval && t - lastTickRef.current < interval) return;
    const frameScale = lastTickRef.current
      ? Math.min((t - lastTickRef.current) / (1000 / 60), 4)
      : 1;
    lastTickRef.current = t;

    for (const d of dotsRef.current) {
      d.prog = (d.prog + d.spd * frameScale) % (d.maxProg ?? 1);
      const pt = d.path.getPointAtLength(d.prog * d.len);
      d.el.setAttribute('cx', pt.x);
      d.el.setAttribute('cy', pt.y);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Small delay so the DOM has laid out before measuring positions.
    const timer = setTimeout(() => {
      dotsRef.current = [];
      for (let i = 0; i < zones.length; i++) initZone(i);
      rafRef.current = requestAnimationFrame(tick);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, initZone, tick]);

  useEffect(() => {
    let rsTimer;
    const handleResize = () => {
      clearTimeout(rsTimer);
      rsTimer = setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        dotsRef.current = [];
        for (let i = 0; i < zones.length; i++) initZone(i);
        rafRef.current = requestAnimationFrame(tick);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(rsTimer);
    };
  }, [initZone, tick]);

  return (
    <section className="activities section" id="activities" ref={sectionRef}>
      <div className="container">
        <div className="act-hero">
          <p className="act-hero__eye"></p>
          <h2 className="act-hero__h1">Our Activities</h2>
          <p className="act-hero__sub">What our members can expect to learn and experience</p>
        </div>

        {zones.map((zone, zoneIdx) => (
          <div className="act-graph-zone" id={`act-zone-${zoneIdx}`} key={zoneIdx}>
            <svg
              className="act-graph-svg"
              id={`act-svg-${zoneIdx}`}
              xmlns="http://www.w3.org/2000/svg"
            />
            <div className="act-graph-content">
              <div className="act-cat-node" id={`act-node-${zoneIdx}`}>
                {zone.label}
              </div>

              <div className="act-cards-row">
                {zone.cards.map((card, cardIdx) => (
                  <div
                    className="act-card"
                    key={cardIdx}
                    style={{ '--float-delay': `${(zoneIdx * 3 + cardIdx) * 0.4}s` }}
                  >
                    <h3 className="act-card__title">{card.title}</h3>
                    <div className="act-card__tags">
                      {card.tags.map((tag, i) => (
                        <span className="act-card__tag" key={i}>{tag}</span>
                      ))}
                    </div>
                    <p className="act-card__desc">{card.desc}</p>
                    <button className="act-card__link">
                      {card.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ActivitiesSection;
