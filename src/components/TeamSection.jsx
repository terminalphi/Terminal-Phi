import { useEffect, useRef, useState } from 'react';
import ProfileCard from './ProfileCard';
import './TeamSection.css';

/* ══════════════════════════════════════════════
   TEAM DATA — edit members here.
   image: URL to custom profile picture. If empty, falls back to initials.
   initials: shown inside the avatar circle.
   instagram / linkedin: optional social links.
══════════════════════════════════════════════ */
const members = [
  {
    name: 'Shreeansh Aggarwal',
    initials: 'SA',
    image: '', // e.g. '/team/shreeansh.jpg'
    role: 'President',
    bio: 'The code always runs \n on his machine',
    instagram: 'https://www.instagram.com/shreeansh_main/', // TODO: add Instagram profile URL
    linkedin: 'https://www.linkedin.com/in/aggarwalshreeansh/',
  },
  {
    name: 'Aadi Jain',
    initials: 'AJ',
    image: '',
    role: 'Vice President',
    bio: 'Three "tungs" before the sahur.\n no more, no less.',
    instagram: 'https://www.instagram.com/based_aadi/', // TODO: add Instagram profile URL
    linkedin: 'https://www.linkedin.com/in/aadijain101/',
  },
  {
    name: 'Hardik Agrawal',
    initials: 'HA',
    image: '',
    role: 'General Secretary',
    bio: "I'm passionate about community building and mentorship.",
    instagram: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // TODO: add Instagram profile URL
    linkedin: 'https://www.linkedin.com/in/hardikagrawal3108/',
  },
  
  
];

const handleFor = (name) => '@' + name.split(' ')[0].toLowerCase();

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
            <div
              key={idx}
              className={`reveal ${visible ? 'visible' : ''}`}
              style={{ transitionDelay: visible ? `${idx * 0.08}s` : '0s' }}
            >
              <ProfileCard
                name={m.name}
                role={m.role}
                bio={m.bio}
                image={m.image}
                initials={m.initials}
                instagram={m.instagram}
                linkedin={m.linkedin}
                handle={handleFor(m.name)}
                largeBio
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
