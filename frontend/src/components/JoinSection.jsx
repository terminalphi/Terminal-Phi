import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, supabase } from '../auth';
import './JoinSection.css';

const perks = [
  'Build projects with your assigned team',
  'Problem solving & build sessions',
];

function JoinSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [phoneError, setPhoneError] = useState('');
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

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((user) => {
        if (mounted && user) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
            name: fullName || prev.name,
          }));
          if (user.email) setEmailLocked(true);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'phone') {
      setPhoneError(/^\d{10}$/.test(value) ? '' : 'Enter a valid 10-digit mobile number');
    }
  };

  const saveToSupabase = async () => {
    if (!supabase) return true;

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
          Why_Join: formData.why || null,
        },
      ]);

    if (error) {
      if (error.code === '23505') {
        setSubmitStatus('This Roll Number has already been registered!');
        return false;
      }
      setSubmitStatus('Error saving data: ' + error.message);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(formData.phone)) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return;
    }
    setSubmitting(true);
    setSubmitStatus('Saving your application...');

    const saved = await saveToSupabase();
    setSubmitting(false);
    if (!saved) return;

    setSubmitStatus('');
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

        <div className={`join__form-wrap ${visible ? 'join__form-wrap--visible' : ''}`}>
          <div className="join__form-glow" />

          <div className="join__form-header">
            <span className="join__form-prompt">&gt; membership_application</span>
            <span className="join__form-meta">FORM · TP-APP-2026</span>
          </div>

          {submitted ? (
            <div className="join__success-text-block" style={{ margin: '0 auto', padding: '40px 0' }}>
              <div className="join__success-icon" style={{ margin: '0 auto 20px auto' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="join__success-title">Application Received</h3>
              <p className="join__success-text">
                Thanks for applying. We review applications on a rolling basis and will reach out over email.
                Keep building in the meantime.
              </p>
            </div>
          ) : (
            <form className="join__form" onSubmit={handleSubmit}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input
                      className={`join__input${phoneError ? ' join__input--error' : ''}`}
                      type="tel"
                      placeholder="Phone number (10 digits)"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      maxLength={10}
                      required
                    />
                    {phoneError && (
                      <span style={{ color: '#ff6b6b', fontSize: '0.75rem', paddingLeft: '4px' }}>
                        {phoneError}
                      </span>
                    )}
                  </div>
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

              <button type="submit" className="join__submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Application'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              {submitStatus && (
                <p style={{ color: submitStatus.startsWith('Error') || submitStatus.startsWith('This') ? '#ff5f57' : 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textAlign: 'center', marginTop: '12px' }}>
                  {submitStatus}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default JoinSection;
