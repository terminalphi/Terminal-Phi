import { useEffect, useRef, useState } from 'react';
import './AboutSection.css';

const aboutData = [
  {
    index: '01',
    title: 'Who We Are',
    text: 'Terminal Phi is a college coding society that brings together passionate developers, problem solvers, and builders. We believe in learning by doing — not just attending lectures. Every member ships real code.',
  },
  {
    index: '02',
    title: 'Our Mission',
    text: 'To create an environment where juniors grow into confident engineers through hands-on project building, hackathon exposure, mock interviews, and competitive programming. We bridge the gap between classroom theory and industry reality.',
  },
  {
    index: '03',
    title: 'Who Can Join',
    text: 'Open for all juniors with a drive to build. 3rd year students need a PCG criteria to be eligible. We intentionally exclude seniors to keep the focus on growth-stage developers who have the most to gain.',
  },
];

function AboutSection() {
  const sectionRef = useRef(null);
  const [visibleCards, setVisibleCards] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = entry.target.getAttribute('data-index');
            setVisibleCards(prev => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = sectionRef.current?.querySelectorAll('.about__card');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="about section" id="about" ref={sectionRef}>
      <div className="container">
        <span className="section-eyebrow">Who We Are</span>
        <h2 className="section-title">About Terminal Phi</h2>

        <div className="about__grid">
          {aboutData.map((item) => (
            <div
              key={item.index}
              className={`about__card ${visibleCards.has(item.index) ? 'about__card--visible' : ''}`}
              data-index={item.index}
            >
              <span className="about__card-index">{item.index}</span>
              <h3 className="about__card-title">{item.title}</h3>
              <p className="about__card-text">{item.text}</p>
              <div className="about__card-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
