import { useState } from 'react';
import './DashboardSection.css';

/* ── Platform config ─────────────────────────────────────── */

const PLATFORMS = [
  {
    key: 'lc_user',
    label: 'LeetCode',
    placeholder: 'LeetCode username',
    url: (u) => `https://leetcode.com/u/${u}`,
    color: '#f89f1b',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z"/>
      </svg>
    ),
  },
  {
    key: 'gfg_user',
    label: 'GeeksForGeeks',
    placeholder: 'GFG username',
    url: (u) => `https://www.geeksforgeeks.org/user/${u}`,
    color: '#2f8d46',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116-.016 3.79 3.79 0 0 1-2.135-2.078 3.571 3.571 0 0 1-.292-.96h2.976c.06.263.18.508.352.711.229.266.543.45.893.523.35.068.713.015 1.028-.15a1.44 1.44 0 0 0 .574-.59 1.36 1.36 0 0 0 .09-1.065 1.376 1.376 0 0 0-.64-.764 1.497 1.497 0 0 0-.752-.186h-.916v-2.32h.916c.264 0 .523-.07.752-.203.228-.133.413-.327.54-.564.122-.23.177-.492.16-.752a1.24 1.24 0 0 0-.276-.692 1.322 1.322 0 0 0-.635-.434 1.413 1.413 0 0 0-.77-.036 1.25 1.25 0 0 0-.655.39c-.17.195-.286.43-.34.685H14.41a3.53 3.53 0 0 1 .583-1.456 3.616 3.616 0 0 1 1.13-1.077 3.612 3.612 0 0 1 2.753-.443 3.508 3.508 0 0 1 1.36.637 3.35 3.35 0 0 1 .912 1.04c.22.398.333.842.33 1.293.003.452-.113.898-.335 1.297-.245.435-.6.8-1.03 1.055.503.259.913.66 1.181 1.155.255.468.378.99.357 1.516a3.404 3.404 0 0 1-.205 1.082zM2.55 14.315a3.404 3.404 0 0 1-.205-1.082 3.434 3.434 0 0 1 .357-1.516 3.196 3.196 0 0 1 1.18-1.155 3.04 3.04 0 0 1-1.03-1.055A3.006 3.006 0 0 1 2.518 8.21c-.003-.451.11-.895.33-1.293a3.35 3.35 0 0 1 .912-1.04 3.508 3.508 0 0 1 1.36-.637 3.612 3.612 0 0 1 2.753.443c.44.282.82.648 1.13 1.077a3.53 3.53 0 0 1 .583 1.456H6.611a1.285 1.285 0 0 0-.34-.685 1.25 1.25 0 0 0-.655-.39 1.413 1.413 0 0 0-.77.036 1.322 1.322 0 0 0-.635.434 1.24 1.24 0 0 0-.276.692c-.017.26.038.522.16.752.127.237.312.43.54.564.229.133.488.203.752.203h.916v2.32h-.916a1.497 1.497 0 0 0-.752.186 1.376 1.376 0 0 0-.64.764 1.36 1.36 0 0 0 .09 1.065c.12.234.322.431.574.59.315.165.678.218 1.028.15.35-.073.664-.257.893-.524.172-.202.292-.447.352-.71h2.976a3.571 3.571 0 0 1-.292.96 3.79 3.79 0 0 1-2.135 2.078 4.51 4.51 0 0 1-3.116.016 3.691 3.691 0 0 1-1.104-.695 3.173 3.173 0 0 1-.565-.745z"/>
      </svg>
    ),
  },
  {
    key: 'cc_user',
    label: 'CodeChef',
    placeholder: 'CodeChef username',
    url: (u) => `https://www.codechef.com/users/${u}`,
    color: '#5b8af2',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.257.004C5.023-.109-.104 5.17.004 11.51c.097 5.952 4.93 10.84 10.882 10.485 5.817-.346 10.499-5.296 10.11-11.212C20.618 4.877 16.228.1 11.257.004zm-.78 3.64c3.585-.283 6.63 2.537 6.87 6.138.234 3.496-2.396 6.564-5.891 6.792-3.57.23-6.64-2.534-6.874-6.106-.241-3.67 2.56-6.59 5.895-6.824z"/>
      </svg>
    ),
  },
  {
    key: 'cf_user',
    label: 'Codeforces',
    placeholder: 'Codeforces username',
    url: (u) => `https://codeforces.com/profile/${u}`,
    color: '#1f8acb',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z"/>
      </svg>
    ),
  },
  {
    key: 'hr_user',
    label: 'HackerRank',
    placeholder: 'HackerRank username',
    url: (u) => `https://www.hackerrank.com/profile/${u}`,
    color: '#00ea64',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    ),
  },
];

/* ── Main component ───────────────────────────────────────── */

/**
 * DashboardSection
 * @param {{ user: Object, profile: Object|null, onSave: Function }} props
 *   user:    Supabase auth user
 *   profile: row from member_profiles (null if none exists yet)
 *   onSave:  async (profileData) => { success, error? }
 */
function DashboardSection({ user, profile, onSave }) {
  const [editing, setEditing] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const defaultForm = {
    name: profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    email: profile?.email || user?.email || '',
    portfolio_link: profile?.portfolio_link || '',
    lc_user: profile?.lc_user || '',
    gfg_user: profile?.gfg_user || '',
    cc_user: profile?.cc_user || '',
    cf_user: profile?.cf_user || '',
    hr_user: profile?.hr_user || '',
  };

  const [form, setForm] = useState(defaultForm);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaveStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('');
    const result = await onSave(form);
    setSaving(false);
    if (result.success) {
      setSaveStatus('Profile saved successfully!');
      setEditing(false);
    } else {
      setSaveStatus('Error: ' + (result.error || 'Could not save'));
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setSaveStatus('');
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setEditing(false);
    setSaveStatus('');
  };

  const initials = (form.name || 'U').trim().charAt(0).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

  const activePlatforms = PLATFORMS.filter((p) => form[p.key]);

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <section className="dashboard">
      <div className="dashboard__grid">

        {/* ── Profile Card ───────────────────────────────── */}
        <div className="db-card db-profile">
          <div className="db-profile__avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="db-profile__avatar-img" referrerPolicy="no-referrer" />
            ) : (
              <div className="db-profile__avatar">{initials}</div>
            )}
            <div className="db-profile__status-dot" />
          </div>

          <h2 className="db-profile__name">{form.name || 'Member'}</h2>
          <p className="db-profile__email">
            <svg className="db-profile__meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 7L2 7" />
            </svg>
            {form.email}
          </p>

          {form.portfolio_link && !editing && (
            <a href={form.portfolio_link} target="_blank" rel="noopener noreferrer" className="db-profile__portfolio-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Portfolio
            </a>
          )}

          {!editing && (
            <button className="db-profile__edit-btn" onClick={handleEdit}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {/* ── Platform Links (view mode) ─────────────────── */}
        {!editing && (
          <div className="db-card db-platforms">
            <h3 className="db-card__label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              Coding Profiles
            </h3>
            {activePlatforms.length > 0 ? (
              <div className="db-platforms__list">
                {activePlatforms.map((p) => (
                  <a
                    key={p.key}
                    href={p.url(form[p.key])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="db-platform-badge"
                    style={{ '--platform-color': p.color }}
                  >
                    <span className="db-platform-badge__icon">{p.icon}</span>
                    <span className="db-platform-badge__info">
                      <span className="db-platform-badge__label">{p.label}</span>
                      <span className="db-platform-badge__user">{form[p.key]}</span>
                    </span>
                    <svg className="db-platform-badge__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15,3 21,3 21,9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <div className="db-platforms__empty">
                <p>No coding profiles linked yet.</p>
                <button className="db-profile__edit-btn" onClick={handleEdit}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Profiles
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Edit Form ──────────────────────────────────── */}
        {editing && (
          <div className="db-card db-edit">
            <div className="db-edit__header">
              <h3 className="db-card__label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {profile ? 'Edit Profile' : 'Set Up Your Profile'}
              </h3>
              {!profile && (
                <p className="db-edit__subtitle">Fill in your details and coding platform usernames</p>
              )}
            </div>

            <form className="db-edit__form" onSubmit={handleSubmit}>
              <div className="db-edit__group">
                <span className="db-edit__group-title">Basic Info</span>
                <div className="db-edit__grid">
                  <div className="db-edit__field">
                    <label className="db-edit__label">Name</label>
                    <input
                      className="db-edit__input"
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </div>
                  <div className="db-edit__field">
                    <label className="db-edit__label">Email</label>
                    <input
                      className="db-edit__input db-edit__input--locked"
                      type="email"
                      value={form.email}
                      readOnly
                      title="Linked to your Google account"
                    />
                  </div>
                  <div className="db-edit__field db-edit__field--full">
                    <label className="db-edit__label">Portfolio Link</label>
                    <input
                      className="db-edit__input"
                      type="url"
                      placeholder="https://your-portfolio.com"
                      value={form.portfolio_link}
                      onChange={handleChange('portfolio_link')}
                    />
                  </div>
                </div>
              </div>

              <div className="db-edit__group">
                <span className="db-edit__group-title">Coding Platforms</span>
                <div className="db-edit__grid">
                  {PLATFORMS.map((p) => (
                    <div className="db-edit__field" key={p.key}>
                      <label className="db-edit__label">
                        <span className="db-edit__label-icon" style={{ color: p.color }}>{p.icon}</span>
                        {p.label}
                      </label>
                      <input
                        className="db-edit__input"
                        type="text"
                        placeholder={p.placeholder}
                        value={form[p.key]}
                        onChange={handleChange(p.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="db-edit__actions">
                {profile && (
                  <button type="button" className="db-edit__cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="db-edit__save" disabled={saving}>
                  {saving ? 'Saving…' : profile ? 'Save Changes' : 'Create Profile'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {saveStatus && (
                <p className={`db-edit__status ${saveStatus.startsWith('Error') ? 'db-edit__status--error' : 'db-edit__status--success'}`}>
                  {saveStatus}
                </p>
              )}
            </form>
          </div>
        )}

      </div>
    </section>
  );
}

export default DashboardSection;
