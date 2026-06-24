import { useCallback, useRef } from 'react';
import './ProfileCard.css';

/*
  ProfileCard — a holographic, pointer-tilt profile card in the style of
  ReactBits' ProfileCard, themed for Terminal Phi (gold/dark).
  Tilt + glare follow the pointer via CSS custom properties.
*/
function ProfileCard({ name, role, bio, image, initials, github, linkedin, handle, status = 'Active', largeBio = false }) {
  const cardRef = useRef(null);

  const handlePointerMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0..1
    const py = (e.clientY - rect.top) / rect.height;   // 0..1
    card.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
    card.style.setProperty('--ry', `${(px - 0.5) * 14}deg`);
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
    card.style.setProperty('--active', '1');
  }, []);

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
    card.style.setProperty('--active', '0');
  }, []);

  return (
    <article
      className="pcard"
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="pcard__holo" />
      <div className="pcard__glare" />

      <div className="pcard__inner">
        <div className="pcard__avatar">
          {image ? (
            <img src={image} alt={name} className="pcard__img" />
          ) : (
            <span className="pcard__initials">{initials}</span>
          )}
          <span className="pcard__status">
            <span className="pcard__status-dot" />
            {status}
          </span>
        </div>

        <h3 className="pcard__name">{name}</h3>
        <span className="pcard__role">{role}</span>
        {bio && <p className={`pcard__bio ${largeBio ? 'pcard__bio--lg' : ''}`}>{bio}</p>}

        <div className="pcard__footer">
          <span className="pcard__handle">{handle || '@terminalphi'}</span>
          <div className="pcard__socials">
            {github && (
              <a className="pcard__social" href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
              </a>
            )}
            {linkedin && (
              <a className="pcard__social" href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H6.5v-7H9v7zM7.75 8.56a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88zM18 17h-2.5v-3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V17H10v-7h2.5v1.11C13.06 10.41 13.96 10 15 10c1.66 0 3 1.34 3 3v4z"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProfileCard;
