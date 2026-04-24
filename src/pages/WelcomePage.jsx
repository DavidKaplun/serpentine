import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleEnter() {
    if (username.trim() === '') {
      setError('Please enter a username');
      return;
    }
    setError('');
    navigate('/lobby', { state: { username: username.trim() } });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleEnter();
  }

  return (
    <div className="welcome-container">
      <div className="bg-orb-left" />
      <div className="bg-orb-right" />
      <div className="bg-grid" />

      <div className="welcome-content">
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

        <div className="card">
          <p className="card-label">Enter your username to begin</p>

          <div className="input-wrapper">
            <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="2.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
              <path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              className={`username-input ${error ? 'error' : ''}`}
              type="text"
              placeholder="your name here"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              maxLength={20}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="enter-btn" onClick={handleEnter}>
            Enter the arena →
          </button>
        </div>

        <p className="no-account">No account needed · just a name</p>
        <p className="credit">created by David Kaplun</p>
      </div>
    </div>
  );
}

export default WelcomePage;