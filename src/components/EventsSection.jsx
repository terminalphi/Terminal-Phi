import { useEffect, useRef, useState } from 'react';
import { getDeviceTier, CANVAS_FPS } from '../deviceTier';
import './EventsSection.css';

const events = [
  {
    num: '01',
    title: '',
    type: '',
    date: 'Coming soon',
    description: 'Stay tuned for updates.',
    tags: [],
    status: 'upcoming',
  },
  {
    num: '02',
    title: '',
    type: '',
    date: '',
    description: '',
    tags: [],
    status: '',
  },
   {
    num: '03',
    title: '',
    type: '',
    date: '',
    description: '',
    tags: [],
    status: '',
  },
  {
    num: '04',
    title: 'Terminal Phi 2026',
    type: 'Internal Events',
    date: '',
    description: '',
    tags: [],
    status: '',
  },
];

// OrbCanvas — orbs travel point-to-point between node Y positions, not across
// the full height. The canvas sizes its drawing buffer to its own rendered size
// (scaled by device pixel ratio) and reads node positions live from the DOM each
// frame, keeping the buffer and CSS-displayed size in lockstep so the line/orbs
// stay aligned with the nodes.
function OrbCanvas({ containerRef, nodeRefs }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W = 80;
    const cx = W / 2;
    const ctx = canvas.getContext('2d');

    // Size the drawing buffer to the canvas's actual rendered size so 1 canvas
    // unit maps to 1 CSS pixel. Re-run whenever the timeline resizes.
    let displayH = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      displayH = container.getBoundingClientRect().height;
      canvas.width = W * dpr;
      canvas.height = displayH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Read the current node Y centres (relative to the timeline top) and build
    // the segment list. Recomputed each frame so the line tracks the nodes even
    // while the entrance animation is still settling them into place.
    function buildSegments() {
      const cRect = container.getBoundingClientRect();
      const ys = nodeRefs.current
        .filter(Boolean)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return r.top - cRect.top + r.height / 2;
        });
      if (ys.length < 2) return [];
      // Apply a -5px nudge at the third node (index 2) for pixel-perfect alignment
      const adjustedYs = ys.map((y, i) => (i === 2 ? y - 5 : y));
      const segs = [];
      for (let i = 0; i < adjustedYs.length - 1; i++) {
        segs.push({ from: adjustedYs[i], to: adjustedYs[i + 1] });
      }
      return segs;
    }

    // One orb per segment, staggered along the segment length. The orb count is
    // fixed to the node count so orbs keep their identity across reflows.
    const ORB_COUNT = 3;
    const orbs = Array.from({ length: ORB_COUNT }, (_, i) => ({
      segIndex: i,
      progress: i / ORB_COUNT,
      speed: 0.0012 + Math.random() * 0.0008, // progress per frame (0–1 range)
      radius: 5 + Math.random() * 5,
      alpha: 0.22 + Math.random() * 0.18,
    }));

    // Cap the redraw rate on weaker hardware. Orb motion is advanced by a
    // frame-scale factor (relative to 60fps) so the orbs travel at the same
    // visual speed regardless of the throttled frame rate.
    const fpsCap = CANVAS_FPS[getDeviceTier()];
    const minInterval = fpsCap > 0 ? 1000 / fpsCap : 0;
    let lastDraw = 0;

    function draw(t) {
      rafRef.current = requestAnimationFrame(draw);
      if (minInterval && t - lastDraw < minInterval) return;
      const frameScale = lastDraw ? Math.min((t - lastDraw) / (1000 / 60), 4) : 1;
      lastDraw = t;

      const segments = buildSegments();
      ctx.clearRect(0, 0, W, displayH);
      if (segments.length < 1) return;

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

      for (const orb of orbs) {
        const seg = segments[orb.segIndex];
        if (!seg) continue;
        const segLen = seg.to - seg.from;
        const y = seg.from + orb.progress * segLen;

        // Fade in/out at segment edges
        const edgeFade = Math.min(orb.progress * 6, 1) * Math.min((1 - orb.progress) * 6, 1);
        const a = orb.alpha * edgeFade;

        if (a > 0.01) {
          const grad = ctx.createRadialGradient(cx, y, 0, cx, y, orb.radius);
          grad.addColorStop(0,   `rgba(255,235,150,${a})`);
          grad.addColorStop(0.5, `rgba(212,175,55,${a * 0.6})`);
          grad.addColorStop(1,   'rgba(212,175,55,0)');

          ctx.beginPath();
          ctx.arc(cx, y, orb.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx, y, orb.radius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,175,55,${a * 0.08})`;
          ctx.fill();
        }

        orb.progress += orb.speed * frameScale;
        if (orb.progress >= 1) {
          orb.progress = 0;
          orb.segIndex = (orb.segIndex + 1) % segments.length;
          orb.radius = 5 + Math.random() * 5;
          orb.alpha = 0.22 + Math.random() * 0.18;
          orb.speed = 0.0012 + Math.random() * 0.0008;
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [containerRef, nodeRefs]);

  return (
    <canvas
      ref={canvasRef}
      className="events__orb-canvas"
      aria-hidden="true"
    />
  );
}

function EventsSection() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const nodeRefs = useRef([]);
  const [visible, setVisible] = useState(false);

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

  return (
    <section className="events section" id="events" ref={sectionRef}>
      <div className="container">
        <span className="section-eyebrow">Stay Updated</span>
        <h2 className="section-title">Events &amp; Hackathons</h2>

        <div className="events__timeline" ref={timelineRef}>
          <div className="events__orb-col">
            <OrbCanvas containerRef={timelineRef} nodeRefs={nodeRefs} />
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
