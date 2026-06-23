import { useEffect, useRef, useState } from 'react';
import './JoinSection.css';

const perks = [
  'Ship real projects with a team',
  'Mentorship for hackathons & interviews',
  'Weekly CP, system design & build sessions',
];

function JoinSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: sectionRef.current?.offsetTop ?? 0, behavior: 'smooth' });
  };

  return (
    <section className="join section" id="join" ref={sectionRef}>
      <div className="container">
        <div className="kgraph__head">
          <span className="section-eyebrow">Become a Member</span>
          <h2 className="section-title">Join Terminal Phi</h2>
          <p className="kgraph__subtitle">Applications are open — tell us who you are and why you build</p>
        </div>

        <div className="join__perks">
          {perks.map((perk, i) => (
            <div key={i} className="join__perk">
              <span className="join__perk-mark" />
              {perk}
            </div>
          ))}
        </div>

        {/* Application form subsection */}
        <div className={`join__form-wrap ${visible ? 'join__form-wrap--visible' : ''}`}>
          <div className="join__form-glow" />

          <div className="join__form-header">
            <span className="join__form-prompt">&gt; membership_application</span>
            <span className="join__form-meta">FORM · TP-APP-2026</span>
          </div>

          {submitted ? (
            <div className="join__success">
              <span className="join__success-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <h3 className="join__success-title">Application received</h3>
              <p className="join__success-text">
                Thanks for applying to Terminal Phi. We review applications on a rolling basis
                and will reach out over email. Keep building in the meantime.
              </p>
            </div>
          ) : (
            <form className="join__form" onSubmit={handleSubmit}>
              <div className="join__group">
                <span className="join__group-title">01 · Basic Details</span>
                <div className="join__grid">
                  <input className="join__input" type="text" placeholder="Full name" />
                  <input className="join__input" type="email" placeholder="Email address" />
                  <input className="join__input" type="tel" placeholder="Phone number" />
                  <input className="join__input" type="text" placeholder="College / University" />
                  <input className="join__input" type="text" placeholder="Course, year & branch (e.g. B.Tech, 2nd yr, CSE)" />
                  <input className="join__input" type="text" placeholder="Roll number / Student ID" />
                  <input className="join__input" type="text" placeholder="Primary interest (Web, ML, CP, System Design…)" />
                  <input className="join__input" type="url" placeholder="GitHub / portfolio link (optional)" />
                </div>
              </div>

              <div className="join__group">
                <span className="join__group-title">02 · Tell Us About Yourself</span>
                <textarea
                  className="join__textarea"
                  rows={5}
                  placeholder="Why do you want to join Terminal Phi?"
                />
                <textarea
                  className="join__textarea"
                  rows={5}
                  placeholder="Why do you think you're a strong candidate to be a good contributor to the work this society intends to do?"
                />
              </div>

              <button type="submit" className="join__submit">
                Submit Application
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <p className="join__disclaimer">
                Submitting shares your details with the Terminal Phi core team for review only.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default JoinSection;
