import { useEffect, useRef, useState, useCallback } from 'react';
import './EventsSection.css';

const events = [
  {
    num: '01',
    title: 'CodeSprint 2026',
    type: 'Internal Hackathon',
    date: 'Upcoming',
    description: 'A 24-hour internal hackathon where teams of 3 build MVPs from curated problem statements. Mentorship from senior devs throughout.',
    tags: ['Hackathon', 'Teams', '24hr'],
    status: 'upcoming',
  },
  {
    num: '02',
    title: 'Interview Bootcamp',
    type: 'Mock Interview Series',
    date: 'Monthly',
    description: 'Structured mock interview sessions covering DSA rounds, system design discussions, and behavioral preparation with peer feedback.',
    tags: ['Interviews', 'Monthly', 'All Levels'],
    status: 'recurring',
  },
  {
    num: '03',
    title: 'Open Source Sprint',
    type: 'Contribution Drive',
    date: 'Upcoming',
    description: 'Find your first (or next) open source contribution. Curated repos, guided PRs, and git workflow workshops.',
    tags: ['Open Source', 'Beginner Friendly', 'Git'],
    status: 'upcoming',
  },
  {
    num: '04',
    title: 'System Design Sundays',
    type: 'Weekly Sessions',
    date: 'Every Sunday',
    description: 'Deep-dive into real-world system architectures. From URL shorteners to distributed databases — whiteboard style.',
    tags: ['System Design', 'Weekly', 'Advanced'],
    status: 'recurring',
  },
];

/* ══════════════════════════════════════════════
   OrbCanvas — orbs travel point-to-point between
   node Y positions, not across the full height.
   nodeYs: array of Y values relative to the canvas.
══════════════════════════════════════════════ */
function OrbCanvas({ height, nodeYs }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || height <= 0 || nodeYs.length < 2) return;

    const W = 80;
    canvas.width = W;
    canvas.height = height;
    const cx = W / 2;
    const ctx = canvas.getContext('2d');

    // Build segments: each is {from, to}
    // Apply a -5px nudge at the third node (index 2) for pixel-perfect alignment
    const adjustedYs = nodeYs.map((y, i) => i === 2 ? y - 5 : y);
    const segments = [];
    for (let i = 0; i < adjustedYs.length - 1; i++) {
      segments.push({ from: adjustedYs[i], to: adjustedYs[i + 1] });
    }

    // One orb per segment, staggered along the segment length
    const ORB_COUNT = 3; // 3 orbs total, distributed across segments
    const orbs = Array.from({ length: ORB_COUNT }, (_, i) => {
      const seg = segments[i % segments.length];
      const segLen = seg.to - seg.from;
      return {
        segIndex: i % segments.length,
        // stagger start position within the segment
        progress: (i / ORB_COUNT),
        speed: 0.0012 + Math.random() * 0.0008, // progress per frame (0–1 range)
        radius: 5 + Math.random() * 5,
        alpha: 0.22 + Math.random() * 0.18,
      };
    });

    function draw() {
      ctx.clearRect(0, 0, W, height);

      // Draw the vertical line segments between nodes
      for (const seg of segments) {
        const lineGrad = ctx.createLinearGradient(0, seg.from, 0, seg.to);
        lineGrad.addColorStop(0,   'rgba(212,175,55,0.12)');
        lineGrad.addColorStop(0.5, 'rgba(212,175,55,0.22)');
        lineGrad.addColorStop(1,   'rgba(212,175,55,0.12)');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, seg.from);
        ctx.lineTo(cx, seg.to);
        ctx.stroke();
      }

      // Draw and advance each orb within its segment
      for (const orb of orbs) {
        const seg = segments[orb.segIndex];
        const segLen = seg.to - seg.from;
        const y = seg.from + orb.progress * segLen;

        // Fade in/out at segment edges
        const edgeFade = Math.min(orb.progress * 6, 1) * Math.min((1 - orb.progress) * 6, 1);
        const a = orb.alpha * edgeFade;

        if (a > 0.01) {
          // Glowing orb
          const grad = ctx.createRadialGradient(cx, y, 0, cx, y, orb.radius);
          grad.addColorStop(0,   `rgba(255,235,150,${a})`);
          grad.addColorStop(0.5, `rgba(212,175,55,${a * 0.6})`);
          grad.addColorStop(1,   'rgba(212,175,55,0)');

          ctx.beginPath();
          ctx.arc(cx, y, orb.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Outer glow
          ctx.beginPath();
          ctx.arc(cx, y, orb.radius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,175,55,${a * 0.08})`;
          ctx.fill();
        }

        // Advance progress; loop back to start of same segment
        orb.progress += orb.speed;
        if (orb.progress >= 1) {
          orb.progress = 0;
          // Optionally move to next segment
          orb.segIndex = (orb.segIndex + 1) % segments.length;
          orb.radius = 5 + Math.random() * 5;
          orb.alpha = 0.22 + Math.random() * 0.18;
          orb.speed = 0.0012 + Math.random() * 0.0008;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [height, nodeYs]);

  return (
    <canvas
      ref={canvasRef}
      className="events__orb-canvas"
      aria-hidden="true"
    />
  );
}

/* ══════════════════════════════════════════════
   EventsSection
══════════════════════════════════════════════ */
function EventsSection() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const nodeRefs = useRef([]);
  const [visible, setVisible] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(0);
  const [nodeYs, setNodeYs] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Measure timeline height and node Y positions
  const measure = useCallback(() => {
    if (!timelineRef.current) return;
    const tRect = timelineRef.current.getBoundingClientRect();
    setTimelineHeight(timelineRef.current.offsetHeight);

    const ys = nodeRefs.current
      .filter(Boolean)
      .map((el) => {
        const r = el.getBoundingClientRect();
        // Y relative to the top of the timeline container
        return r.top - tRect.top + r.height / 2;
      });
    setNodeYs(ys);
  }, []);

  useEffect(() => {
    // Measure after layout settles
    const t = setTimeout(measure, 200);
    const ro = new ResizeObserver(measure);
    if (timelineRef.current) ro.observe(timelineRef.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [measure, visible]);

  return (
    <section className="events section" id="events" ref={sectionRef}>
      <div className="container">
        <span className="section-eyebrow">Stay Updated</span>
        <h2 className="section-title">Events &amp; Hackathons</h2>

        <div className="events__timeline" ref={timelineRef}>

          {/* Orb-flow column */}
          <div className="events__orb-col">
            <OrbCanvas height={timelineHeight} nodeYs={nodeYs} />
          </div>

          {events.map((event, idx) => (
            <div
              key={idx}
              className={`events__row ${visible ? 'events__row--visible' : ''}`}
              style={{ transitionDelay: `${idx * 0.15}s` }}
            >
              <div className="events__row-left">
                <div>
                  <div className="events__round-name">{event.title}</div>
                  <div className="events__what">{event.type}</div>
                  <div className="events__tags">
                    {event.tags.map((tag, i) => (
                      <span key={i} className="events__tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="events__divider-vert">
                {/* ref captured for Y-position measurement */}
                <span
                  ref={(el) => (nodeRefs.current[idx] = el)}
                  className={`events__node ${event.status === 'recurring' ? 'events__node--active' : ''}`}
                />
              </div>

              <div className="events__row-right">
                <span className={`events__date ${event.status === 'upcoming' ? 'events__date--upcoming' : ''}`}>
                  {event.date}
                </span>
                <p className="events__text">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventsSection;
