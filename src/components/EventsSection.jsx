import { useEffect, useRef, useState } from 'react';
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

function EventsSection() {
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
    <section className="events section" id="events" ref={sectionRef}>
      <div className="container">
        <span className="section-eyebrow">Stay Updated</span>
        <h2 className="section-title">Events & Hackathons</h2>

        <div className="events__timeline">
          <div className="events__timeline-line" />

          {events.map((event, idx) => (
            <div
              key={idx}
              className={`events__row ${visible ? 'events__row--visible' : ''}`}
              style={{ transitionDelay: `${idx * 0.15}s` }}
            >
              <div className="events__row-left">
                <span className="events__num">{event.num}</span>
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
                <span className={`events__node ${event.status === 'recurring' ? 'events__node--active' : ''}`} />
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
