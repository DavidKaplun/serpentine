import { useState } from 'react';
import './LobbyPage.css';

function HowToPlayOverlay({ onClose }) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <span className="overlay-title">How to play</span>
          <button className="overlay-close" onClick={onClose}>
            <svg width="17" height="17" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="overlay-section">
          <p className="overlay-section-title">CONTROLS</p>
          <p className="overlay-section-body">
            Use the{' '}
            <span className="key">↑</span>{' '}
            <span className="key">↓</span>{' '}
            <span className="key">←</span>{' '}
            <span className="key">→</span>{' '}
            arrow keys to control your snake.
          </p>
        </div>

        <div className="overlay-divider" />

        <div className="overlay-section">
          <p className="overlay-section-title">OBJECTIVE</p>
          <p className="overlay-section-body">
            Collect apples to grow your snake and increase your score. The first player to reach a score of <span className="highlight-teal">30</span> wins.
          </p>
        </div>

        <div className="overlay-divider" />

        <div className="overlay-section">
          <p className="overlay-section-title">WALLS</p>
          <p className="overlay-section-body">
            Each apple spawns with a wall that blocks your direct path to it. Navigate around it — hitting the wall ends your game.
          </p>
        </div>

        <div className="overlay-divider" />

        <div className="overlay-section">
          <p className="overlay-section-title">GAME OVER</p>
          <p className="overlay-section-body">
            Hitting a wall, your own body, or the edge of the board ends the game immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

function LobbyPage() {
  const username = 'Alex';
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="lobby-container">
      <div className="bg-orb-left" />
      <div className="bg-orb-right" />
      <div className="bg-grid" />

      {showRules && <HowToPlayOverlay onClose={() => setShowRules(false)} />}

      <div className="lobby-content">
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

        <div className="username-badge">
          <span className="badge-dot" />
          Playing as <strong>{username}</strong>
        </div>

        <p className="mode-label">Choose your game mode</p>

        <div className="mode-cards">
          <button className="mode-card mode-card--purple">
            <div className="card-accent card-accent--purple" />
            <div className="card-icon card-icon--purple">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="8" cy="7" r="3" stroke="#9F99E8" strokeWidth="1.4"/>
                <circle cx="14" cy="7" r="3" stroke="#9F99E8" strokeWidth="1.4"/>
                <path d="M1 19c0-3.314 3.134-6 7-6" stroke="#9F99E8" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M21 19c0-3.314-3.134-6-7-6" stroke="#9F99E8" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="card-text">
              <span className="card-title">Play against players</span>
              <span className="card-sub">Compete in real-time with others online</span>
            </div>
            <svg className="card-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className="mode-card mode-card--teal">
            <div className="card-accent card-accent--teal" />
            <div className="card-icon card-icon--teal">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="6" width="16" height="11" rx="3" stroke="#2DCB96" strokeWidth="1.4"/>
                <path d="M8 10h2M12 10h2" stroke="#2DCB96" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="8" cy="13" r="1" fill="#2DCB96"/>
                <circle cx="14" cy="13" r="1" fill="#2DCB96"/>
                <path d="M7 6V4M15 6V4" stroke="#2DCB96" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="card-text">
              <span className="card-title">Play against a bot</span>
              <span className="card-sub">Train your skills against an AI opponent</span>
            </div>
            <svg className="card-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <button className="how-to-play-btn" onClick={() => setShowRules(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
            <path d="M7 6.5v4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="7" cy="4.5" r="0.7" fill="rgba(255,255,255,0.35)"/>
          </svg>
          how to play
        </button>

        <button className="change-username-btn">← change username</button>
        <p className="credit">created by David Kaplun</p>
      </div>
    </div>
  );
}

export default LobbyPage;
