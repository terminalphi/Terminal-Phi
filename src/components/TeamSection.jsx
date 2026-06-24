import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import './TeamSection.css';

/* ══════════════════════════════════════════════
   TEAM DATA — edit members here.
   image: URL to custom profile picture. If empty, falls back to initials.
   initials: shown inside the avatar circle.
   github / linkedin: optional social links.
══════════════════════════════════════════════ */
const members = [
  {
    name: 'Shreeansh Aggarwal',
    initials: 'SA',
    image: '', // e.g. '/team/shreeansh.jpg'
    role: 'Founder',
    bio: 'Full-stack developer and competitive programmer. Building Terminal Phi to bridge the gap between learning and shipping.',
    github: 'https://github.com/SHREEANSH-AGGARWAL',
    linkedin: '#',
  },
  {
    name: 'Member Two',
    initials: 'M2',
    image: '',
    role: 'Co-Lead',
    bio: 'Systems thinker and hackathon enthusiast. Focused on scaling the community and building mentorship pipelines.',
    github: '#',
    linkedin: '#',
  },
  {
    name: 'Member Three',
    initials: 'M3',
    image: '',
    role: 'Tech Lead',
    bio: 'Deep into distributed systems and open source. Runs the System Design Sunday sessions and internal hackathons.',
    github: '#',
    linkedin: '#',
  },
  {
    name: 'Member Four',
    initials: 'M4',
    image: '',
    role: 'CP Lead',
    bio: 'Competitive programming specialist. Curates problem sets, runs weekly contests, and mentors juniors for placement prep.',
    github: '#',
    linkedin: '#',
  },
  {
    name: 'Member Five',
    initials: 'M5',
    image: '',
    role: 'Design Lead',
    bio: 'UI/UX designer with a passion for clean interfaces. Responsible for the visual identity of Terminal Phi.',
    github: '#',
    linkedin: '#',
  },
  {
    name: 'Member Six',
    initials: 'M6',
    image: '',
    role: 'Outreach Lead',
    bio: 'Handles partnerships, sponsorships, and external hackathon coordination. Connects the society with the broader tech ecosystem.',
    github: '#',
    linkedin: '#',
  },
];

/* 3D Tilt Card Component */
function TiltCard({ m, idx, visible }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(212,175,55,0.12) 0%, transparent 60%)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`team-card reveal ${visible ? 'visible' : ''}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transitionDelay: visible ? '0s' : `${idx * 0.08}s` // only delay on enter
      }}
    >
      <motion.div className="team-card__glare" style={{ background }} />
      <div className="team-card__avatar">
        {m.image ? (
          <img src={m.image} alt={m.name} className="team-card__img" />
        ) : (
          m.initials
        )}
      </div>
      <h3 className="team-card__name" style={{ transform: "translateZ(30px)" }}>{m.name}</h3>
      <span className="team-card__role" style={{ transform: "translateZ(20px)" }}>{m.role}</span>
      <p className="team-card__bio" style={{ transform: "translateZ(10px)" }}>{m.bio}</p>
      <div className="team-card__socials" style={{ transform: "translateZ(20px)" }}>
        {m.github && (
          <a className="team-card__social" href={m.github} target="_blank" rel="noopener noreferrer" title="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
          </a>
        )}
        {m.linkedin && (
          <a className="team-card__social" href={m.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H6.5v-7H9v7zM7.75 8.56a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88zM18 17h-2.5v-3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V17H10v-7h2.5v1.11C13.06 10.41 13.96 10 15 10c1.66 0 3 1.34 3 3v4z"/></svg>
          </a>
        )}
      </div>
    </motion.div>
  );
}

function TeamSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <section className="team section" id="team" ref={sectionRef}>
      <div className="container">
        <div className="team__head">
          <span className="section-eyebrow">The Builders</span>
          <h2 className="section-title">Our Team</h2>
          <p className="team__subtitle">The people behind Terminal Phi</p>
        </div>

        <div className="team__grid">
          {members.map((m, idx) => (
            <TiltCard key={idx} m={m} idx={idx} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
