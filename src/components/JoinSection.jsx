import { useEffect, useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import ReflectiveCard from './ReflectiveCard';
import './JoinSection.css';

const perks = [
  'Ship real projects with a team',
  'Mentorship for hackathons & interviews',
  'Weekly CP, system design & build sessions',
];

function JoinSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'preview' | 'success'
  const [isCapturing, setIsCapturing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', college: '', branch: '', rollNo: '', interest: '', github: '', why: '', strength: '',
  });

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

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 320 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Camera access denied — fallback is used
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setStep('preview');
    startCamera();
    window.scrollTo({ top: sectionRef.current?.offsetTop ?? 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    try {
      setIsCapturing(true);
      // Wait for React to re-render ReflectiveCard with the canvas instead of video
      await new Promise(resolve => setTimeout(resolve, 100));

      const cardElement = document.getElementById('member-card-download');
      
      const dataUrl = await htmlToImage.toPng(cardElement, {
        quality: 1,
        pixelRatio: 2,
        style: {
          transform: 'none',
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'terminal-phi-member-card.png';
      link.href = dataUrl;
      link.click();
      
      setStep('success');
    } catch (err) {
      console.error('Error generating card image:', err);
      // Still proceed to success state even if download fails
      setStep('success');
    } finally {
      setIsCapturing(false);
      stopCamera();
    }
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

        <div className={`join__form-wrap ${visible ? 'join__form-wrap--visible' : ''}`}>
          <div className="join__form-glow" />

          <div className="join__form-header">
            <span className="join__form-prompt">&gt; membership_application</span>
            <span className="join__form-meta">FORM · TP-APP-2026</span>
          </div>

          {step === 'success' ? (
            <div className="join__success-text-block" style={{ margin: '0 auto', padding: '40px 0' }}>
              <div className="join__success-icon" style={{ margin: '0 auto 20px auto' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="join__success-title">Application Received</h3>
              <p className="join__success-text">
                Your member card has been generated and downloaded. We review applications on a rolling basis
                and will reach out over email. Keep building in the meantime.
              </p>
            </div>
          ) : step === 'preview' ? (
            <div className="join__result">
              <div className="join__preview-card-wrap">
                <ReflectiveCard formData={formData} videoRef={videoRef} isCapturing={isCapturing} />
              </div>

              <div className="join__preview-actions">
                <button type="button" className="join__back-btn" onClick={() => setStep('form')}>
                  Back to Edit
                </button>
                <button type="button" className="join__submit" onClick={handleFinalSubmit} style={{ width: 'auto', padding: '16px 32px' }}>
                  Submit & Download Card
                </button>
              </div>
            </div>
          ) : (
            <form className="join__form" onSubmit={handleContinue}>
              <div className="join__group">
                <span className="join__group-title">01 · Basic Details</span>
                <div className="join__grid">
                  <input className="join__input" type="text" placeholder="Full name" value={formData.name} onChange={handleChange('name')} required />
                  <input className="join__input" type="email" placeholder="Email address" value={formData.email} onChange={handleChange('email')} required />
                  <input className="join__input" type="tel" placeholder="Phone number" value={formData.phone} onChange={handleChange('phone')} required />
                  <input className="join__input" type="text" placeholder="College / University" value={formData.college} onChange={handleChange('college')} required />
                  <input className="join__input" type="text" placeholder="Course, year & branch (e.g. B.Tech, 2nd yr, CSE)" value={formData.branch} onChange={handleChange('branch')} required />
                  <input className="join__input" type="text" placeholder="Roll number / Student ID" value={formData.rollNo} onChange={handleChange('rollNo')} required />
                  <input className="join__input" type="text" placeholder="Primary interest (Web, ML, CP, System Design…)" value={formData.interest} onChange={handleChange('interest')} required />
                  <input className="join__input" type="url" placeholder="GitHub / portfolio link (optional)" value={formData.github} onChange={handleChange('github')} />
                </div>
              </div>

              <div className="join__group">
                <span className="join__group-title">02 · Tell Us About Yourself</span>
                <textarea
                  className="join__textarea"
                  rows={5}
                  placeholder="Why do you want to join Terminal Phi?"
                  value={formData.why}
                  onChange={handleChange('why')}
                  required
                />
                <textarea
                  className="join__textarea"
                  rows={5}
                  placeholder="Why do you think you're a strong candidate to be a good contributor to the work this society intends to do?"
                  value={formData.strength}
                  onChange={handleChange('strength')}
                  required
                />
              </div>

              <button type="submit" className="join__submit">
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <p className="join__disclaimer">
                Clicking continue will generate your virtual member card.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default JoinSection;
