import './MatchmakingPage.css';

function MatchmakingPage() {
  const username = 'Alex';

  return (
    <div className="mm-container">
      <div className="bg-orb-left" />
      <div className="bg-orb-right" />
      <div className="bg-grid" />

      <div className="mm-content">
        <div className="logo-row">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="6" height="6" rx="1.5" fill="#1D9E75"/>
            <rect x="12" y="4" width="6" height="6" rx="1.5" fill="#1D9E75"/>
            <rect x="20" y="4" width="6" height="6" rx="1.5" fill="#2DCB96" opacity="0.5"/>
            <rect x="4" y="12" width="6" height="6" rx="1.5" fill="#1D9E75"/>
            <rect x="4" y="20" width="6" height="6" rx="1.5" fill="#2DCB96" opacity="0.7"/>
            <rect x="4" y="28" width="6" height="6" rx="1.5" fill="#2DCB96" opacity="0.4"/>
            <rect x="24" y="14" width="5" height="5" rx="2.5" fill="#E24B4A"/>
          </svg>
          <span className="logo-text">SERPENTINE</span>
        </div>

        <p className="subtitle">multiplayer arena</p>

        <div className="spinner-wrapper">
          <div className="spinner-ring" />
          <div className="spinner-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="12" cy="10" r="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6"/>
              <circle cx="20" cy="10" r="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6"/>
              <path d="M3 26c0-4.418 4.03-8 9-8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M29 26c0-4.418-4.03-8-9-8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="looking-row">
          <span className="looking-text">Looking for an opponent</span>
          <span className="dots">
            <span className="dot" style={{ animationDelay: '0s' }} />
            <span className="dot" style={{ animationDelay: '0.2s' }} />
            <span className="dot" style={{ animationDelay: '0.4s' }} />
          </span>
        </div>

        <p className="looking-sub">You'll be matched with another player shortly</p>

        <div className="username-badge">
          <span className="badge-dot" />
          Playing as <strong>{username}</strong>
        </div>

        <button className="cancel-btn">← cancel</button>

        <p className="credit">created by David Kaplun</p>
      </div>
    </div>
  );
}

export default MatchmakingPage;
