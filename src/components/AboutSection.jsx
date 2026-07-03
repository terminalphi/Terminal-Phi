import { useEffect, useRef, useState, useCallback } from 'react';
import './AboutSection.css';

const aboutData = [
  {
    title: 'Who We Are',
    text: 'Terminal Phi is a society for the deeply obsessed, problem solvers drawn together not by ambition, but by a quieter compulsion to create.',
    tags: ['General'],
  },
  {
    title: 'Objectives',
    text: "We're an independent collective building the tech society we wish existed. No bureaucracy, no gatekeeping.",
    tags: ['Purpose'],
  },
  {
    title: 'Who Can Join',
    text: 'Those who feel the pull, if you build because you want to and not because you have to, Terminal Phi is waiting for you. Inducements fade, hunger does not.',
    tags: ['Requirements'],
  },
];

const GOLD = 'rgba(212,175,55,0.45)';
const BUS_GAP = 24; // px above grid where the horizontal bus line sits

function AboutSection() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const svgRef = useRef(null);
  const cardRefs = useRef([]);
  const [visible, setVisible] = useState(false);

  /* ── Draw / redraw the SVG overlay ── */
  const draw = useCallback(() => {
    const svg = svgRef.current;
    const grid = gridRef.current;
    if (!svg || !grid) return;

    const gridRect = grid.getBoundingClientRect();
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;

    // Measure each card's center-x and top-y, relative to the grid
    const positions = cards.map(card => {
      const r = card.getBoundingClientRect();
      return {
        cx: r.left - gridRect.left + r.width / 2,
        top: r.top - gridRect.top,
      };
    });

    // SVG covers grid area + BUS_GAP above
    const svgW = gridRect.width;
    const svgH = gridRect.height + BUS_GAP;
    svg.setAttribute('width', svgW);
    svg.setAttribute('height', svgH);
    svg.style.top = `-${BUS_GAP}px`;
    svg.style.left = '0';

    // y=0 in SVG coords = BUS_GAP px above the grid top = where bus line sits
    const busY = 0;

    // Clear and rebuild
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const ns = 'http://www.w3.org/2000/svg';

    // ── Horizontal bus line ──
    const bus = document.createElementNS(ns, 'line');
    bus.setAttribute('x1', positions[0].cx);
    bus.setAttribute('y1', busY);
    bus.setAttribute('x2', positions[positions.length - 1].cx);
    bus.setAttribute('y2', busY);
    bus.setAttribute('stroke', GOLD);
    bus.setAttribute('stroke-width', '1');
    svg.appendChild(bus);

    // ── Vertical drop lines (one per card, hidden by default) ──
    positions.forEach(({ cx, top }) => {
      const len = top + BUS_GAP; // distance from bus to card top
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', busY);
      line.setAttribute('x2', cx);
      line.setAttribute('y2', top + BUS_GAP);
      line.setAttribute('stroke', GOLD);
      line.setAttribute('stroke-width', '1');
      // start fully visible
      line.setAttribute('stroke-dashoffset', '0');
      line.style.transition = 'stroke 0.2s ease';
      svg.appendChild(line);
    });
  }, []);

  /* ── Intersection observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    const fallback = setTimeout(() => setVisible(true), 350);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);

  /* ── Draw on visible + on resize ── */
  useEffect(() => {
    if (!visible) return;
    // Give the entrance animation one frame to settle before measuring
    const t = setTimeout(draw, 120);
    window.addEventListener('resize', draw);
    return () => { clearTimeout(t); window.removeEventListener('resize', draw); };
  }, [visible, draw]);

  return (
    <section
      className={`about section ${visible ? 'kgraph--in' : ''}`}
      id="about"
      ref={sectionRef}
    >
      <div className="container">
        <div className="kgraph__head">
          <span className="section-eyebrow">Who We Are</span>
          <h2 className="section-title">About Terminal Phi</h2>
          <p className="kgraph__subtitle"></p>
        </div>

        <div className="kgraph__tree">
          <span className="kgraph__node">Terminal Phi</span>
          <span className="kgraph__trunk" />
        </div>

        {/* SVG is drawn inside the grid so coords are grid-relative */}
        <div className="kgraph__grid" ref={gridRef}>
          <svg
            ref={svgRef}
            aria-hidden="true"
            style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible' }}
          />

          {aboutData.map((item, idx) => (
            <article
              key={idx}
              ref={el => (cardRefs.current[idx] = el)}
              className={`kcard ${visible ? 'kcard--visible' : ''}`}
              style={{ animationDelay: `${0.5 + idx * 0.12}s` }}
            >
              <div className="kcard__tags">
                {item.tags.map((tag, i) => (
                  <span key={i} className="kcard__tag">{tag}</span>
                ))}
              </div>
              <h3 className="kcard__title">{item.title}</h3>
              <p className="kcard__desc">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
