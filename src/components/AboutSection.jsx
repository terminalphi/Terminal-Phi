import { useEffect, useRef, useState } from 'react';
import './AboutSection.css';

const aboutData = [
  { 
    title: 'Who We Are',
    text: 'Terminal Phi is a tech society that aims to bring together passionate developers, problem solvers, and builders. We believe in learning by doing — not just attending lectures. Every member ships real code.',
    tags: ['General info'],
  },
  {
    title: 'Objectives',
    text: 'To create a collaborative environment for passionate developers to learn, grow, and build together.',
    tags: ['Purpose'],
  },
  {
    title: 'Who Can Join',
    text: 'Anyone with a genuine drive to build, learn and contribute to the tech community is welcome to join Terminal Phi. We value passion and dedication over experience.',
    tags: ['requirements'],
  },
];

function AboutSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
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
    <section className={`about section ${visible ? 'kgraph--in' : ''}`} id="about" ref={sectionRef}>
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

        <div className="kgraph__grid">
          {aboutData.map((item, idx) => (
            <article
              key={idx}
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
