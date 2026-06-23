import { useEffect, useRef, useState } from 'react';
import './ActivitiesSection.css';

const activities = [
  {
    title: 'Project Building',
    description: 'Build real-world projects from scratch. From full-stack web apps to ML pipelines — ship production-grade code, not toy examples.',
    tags: ['Core', 'Hands-on'],
  },
  {
    title: 'Hackathon Participation & Help',
    description: 'Get support for external hackathons — team formation, mentorship, idea brainstorming, and post-hackathon retrospectives.',
    tags: ['Core', 'Mentorship'],
  },
  {
    title: 'Internal Hackathons',
    description: 'Regular internal hackathons with curated problem statements. A safe space to experiment, fail fast, and iterate.',
    tags: ['Events'],
  },
  {
    title: 'Mock Interviews',
    description: 'Practice technical interviews with structured feedback. Covers DSA, system design, and behavioral rounds.',
    tags: ['Prep'],
  },
  {
    title: 'System Design',
    description: 'Learn to architect scalable systems. From database design to distributed architectures — think beyond CRUD.',
    tags: ['Advanced'],
  },
  {
    title: 'DSA / Competitive Programming',
    description: 'Structured CP training for juniors. Weekly contests, upsolving sessions, and curated problem sets aligned with placement prep.',
    tags: ['Juniors', 'Weekly'],
  },
];

function ActivitiesSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    // Fallback: this section sits at the top of its page, so kick off the
    // assemble animation shortly after mount even if the observer is late.
    const fallback = setTimeout(() => setVisible(true), 350);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section className={`activities section ${visible ? 'kgraph--in' : ''}`} id="activities" ref={sectionRef}>
      <div className="container">
        <div className="kgraph__head">
          <span className="section-eyebrow">What We Do</span>
          <h2 className="section-title">Our Activities</h2>
          <p className="kgraph__subtitle">Curated paths for builders, not spectators</p>
        </div>

        <div className="kgraph__tree">
          <span className="kgraph__node">Activities</span>
          <span className="kgraph__trunk" />
        </div>

        <div className="kgraph__grid">
          {activities.map((activity, idx) => (
            <article
              key={idx}
              className={`kcard ${visible ? 'kcard--visible' : ''}`}
              style={{ animationDelay: `${0.5 + idx * 0.09}s` }}
            >
              <div className="kcard__tags">
                {activity.tags.map((tag, i) => (
                  <span key={i} className="kcard__tag">{tag}</span>
                ))}
              </div>
              <h3 className="kcard__title">{activity.title}</h3>
              <p className="kcard__desc">{activity.description}</p>
              <button className="kcard__explore">
                Explore
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
                </svg>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ActivitiesSection;
