import './ReflectiveCard.css';

const ReflectiveCard = ({
  formData,
  videoRef,
  photoUrl,
  memberId,
  blurStrength = 12,
  color = 'white',
  metalness = 1,
  roughness = 0.4,
  overlayColor = 'rgba(255, 255, 255, 0.1)',
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  className = '',
  style = {}
}) => {
  const baseFrequency = 0.03 / Math.max(0.1, noiseScale);
  const saturation = 1 - Math.max(0, Math.min(1, grayscale));

  const cssVariables = {
    '--blur-strength': `${blurStrength}px`,
    '--metalness': metalness,
    '--roughness': roughness,
    '--overlay-color': overlayColor,
    '--text-color': color,
    '--saturation': saturation
  };

  return (
    <div
      className={`reflective-card-container ${className}`}
      style={{ ...style, ...cssVariables }}
      id="member-card-download"
    >
      <svg className="reflective-svg-filters" aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale={displacementStrength}
              specularConstant={specularConstant}
              specularExponent="20"
              lightingColor="#ffffff"
              result="light"
            >
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="solidAlpha"
            />
            <feMorphology in="solidAlpha" operator="erode" radius="45" result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation="10" result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope="0.5" intercept="0" />
            </feComponentTransfer>
            <feDisplacementMap
              in="metallic-result"
              in2="glassMap"
              scale={glassDistortion}
              xChannelSelector="A"
              yChannelSelector="A"
              result="final"
            />
          </filter>
        </defs>
      </svg>

      {/* Live reflective webcam in preview; a frozen still image when capturing
          for download (a <video> + url() filter cannot be snapshotted). */}
      {photoUrl ? (
        <img src={photoUrl} alt="Member" className="reflective-media reflective-photo" />
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="reflective-media reflective-video" />
      )}

      <div className="reflective-noise" />
      <div className="reflective-sheen" />
      <div className="reflective-border" />

      <div className="reflective-content">
        <div className="card-header">
          <span className="rc-brand"><span className="rc-prompt">&gt;</span> terminal_phi</span>
          <span className="rc-tag">MEMBER</span>
        </div>

        <div className="card-body">
          <div className="user-info">
            <h2 className="user-name">{formData?.name || 'Your Name'}</h2>
            <p className="user-role">{formData?.interest || 'Member'}</p>
          </div>
        </div>

        <div className="card-footer">
          <div className="id-section">
            <span className="label">MEMBER ID</span>
            <span className="value">{memberId || 'TP-0000-2026'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectiveCard;
