import { useEffect, useRef, useState } from 'react';
import './ActivitiesSection.css';

const activities = [
  {
    icon: '✦',
    title: 'Project Building',
    description: 'Build real-world projects from scratch. From full-stack web apps to ML pipelines — ship production-grade code, not toy examples.',
    tag: 'Core',
  },
  {
    icon: '✦',
    title: 'Hackathon Participation & Help',
    description: 'Get support for external hackathons — team formation, mentorship, idea brainstorming, and post-hackathon retrospectives.',
    tag: 'Core',
  },
  {
    icon: '✦',
    title: 'Internal Hackathons',
    description: 'Regular internal hackathons with curated problem statements. A safe space to experiment, fail fast, and iterate.',
    tag: 'Events',
  },
  {
    icon: '✦',
    title: 'Mock Interviews',
    description: 'Practice technical interviews with structured feedback. Covers DSA, system design, and behavioral rounds.',
    tag: 'Prep',
  },
  {
    icon: '✦',
    title: 'System Design',
    description: 'Learn to architect scalable systems. From database design to distributed architectures — think beyond CRUD.',
    tag: 'Advanced',
  },
  {
    icon: '✦',
    title: 'DSA / Competitive Programming',
    description: 'Structured CP training for juniors. Weekly contests, upsolving sessions, and curated problem sets aligned with placement prep.',
    tag: 'Juniors Only',
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
    return () => observer.disconnect();
  }, []);

  return (
    <section className="activities section" id="activities" ref={sectionRef}>
      <div className="container">
        <span className="section-eyebrow">What We Do</span>
        <h2 className="section-title">Our Activities</h2>

        <div className="activities__grid">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className={`activities__card ${visible ? 'activities__card--visible' : ''}`}
              style={{ transitionDelay: `${idx * 0.1}s` }}
            >
              <div className="activities__card-header">
                <span className="activities__card-icon">{activity.icon}</span>
                <span className="activities__card-tag">{activity.tag}</span>
              </div>
              <h3 className="activities__card-title">{activity.title}</h3>
              <p className="activities__card-desc">{activity.description}</p>
              <div className="activities__card-num">
                {String(idx + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ActivitiesSection;
