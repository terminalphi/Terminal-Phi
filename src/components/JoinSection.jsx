import { useEffect, useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import ReflectiveCard from './ReflectiveCard';
import { getCurrentUser, supabase } from '../auth';
import './JoinSection.css';

const perks = [
  'Build projects with your assigned team',
  'Problem solving & build sessions',
];

function JoinSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'preview' | 'success'
  const [photoUrl, setPhotoUrl] = useState('');
  const [memberId, setMemberId] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // for showing errors/loading
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', rollNo: '', interest: '', github: '', why: '',
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

  // If the user is authenticated, prefill + lock their email and prefill name
  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((user) => {
        if (mounted && user) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          setFormData((prev) => ({ 
            ...prev, 
            email: user.email || prev.email,
            name: fullName || prev.name
          }));
          if (user.email) setEmailLocked(true);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
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
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setPhotoUrl('');
    setMemberId(`TP-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`);
    setStep('preview');
    startCamera();
    window.scrollTo({ top: sectionRef.current?.offsetTop ?? 0, behavior: 'smooth' });
  };

  // ─── Save form data to Supabase ───
  const saveToSupabase = async () => {
    if (!supabase) {
      console.warn('[JoinSection] Supabase not configured, skipping DB save.');
      return true; // Don't block the flow if Supabase isn't configured
    }

    const { error } = await supabase
      .from('Candidates_data_table')
      .insert([
        {
          Full_Name: formData.name || null,
          Phone_Number: formData.phone || null,
          Email: formData.email || null,
          Roll_Number: formData.rollNo || null,
          Interests: formData.interest || null,
          Portfolio: formData.github || null,
          About: formData.why || null,
        }
      ]);

    if (error) {
      console.error('Supabase insert error:', error);

      // Duplicate roll number
      if (error.code === '23505') {
        setSubmitStatus('This Roll Number has already been registered!');
        return false;
      }

      setSubmitStatus('Error saving data: ' + error.message);
      return false;
    }

    return true;
  };

  const handleFinalSubmit = async () => {
    setSubmitStatus('Saving your application...');

    try {
      // 1. Save to Supabase first
      const saved = await saveToSupabase();
      if (!saved) return; // Error message already set

      // 2. Freeze the live webcam to a still image
      const video = videoRef.current;
      if (video && video.videoWidth) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        setPhotoUrl(canvas.toDataURL('image/png'));
      }

      // Let React swap the <video> for the captured <img> before snapshotting
      await new Promise((resolve) => setTimeout(resolve, 200));

      const cardElement = document.getElementById('member-card-download');
      const dataUrl = await htmlToImage.toPng(cardElement, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = 'terminal-phi-member-card.png';
      link.href = dataUrl;
      link.click();

      setSubmitStatus('');
      setStep('success');
    } catch (err) {
      console.error('Error generating card image:', err);
      setSubmitStatus('');
      setStep('success');
    } finally {
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
                <ReflectiveCard formData={formData} videoRef={videoRef} photoUrl={photoUrl} memberId={memberId} />
              </div>

              <div className="join__preview-actions">
                <button type="button" className="join__back-btn" onClick={() => { stopCamera(); setStep('form'); }}>
                  Back to Edit
                </button>
                <button type="button" className="join__submit" onClick={handleFinalSubmit} style={{ width: 'auto', padding: '16px 32px' }}>
                  Submit & Download Card
                </button>
              </div>

              {/* Status/error message */}
              {submitStatus && (
                <p style={{ color: submitStatus.startsWith('Error') || submitStatus.startsWith('This') ? '#ff5f57' : '#d4af37', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textAlign: 'center', marginTop: '12px' }}>
                  {submitStatus}
                </p>
              )}
            </div>
          ) : (
            <form className="join__form" onSubmit={handleContinue}>
              <div className="join__group">
                <span className="join__group-title">01 · Basic Details</span>
                <div className="join__grid">
                  <input className="join__input" type="text" placeholder="Full name" value={formData.name} onChange={handleChange('name')} required />
                  <input
                    className={`join__input ${emailLocked ? 'join__input--locked' : ''}`}
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange('email')}
                    readOnly={emailLocked}
                    title={emailLocked ? 'Linked to your signed-in Google account' : undefined}
                    required
                  />
                  <input className="join__input" type="tel" placeholder="Phone number" value={formData.phone} onChange={handleChange('phone')} required />
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
              </div>

              <button type="submit" className="join__submit">
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <p className="join__disclaimer">
                Clicking continue will generate your virtual card.- make sure to enable camera permission
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default JoinSection;
