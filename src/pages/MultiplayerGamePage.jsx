import { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket, disconnectSocket } from '../socket';
import './GamePage.css';

const CELL = 24;
const COLS = 30;
const W = CELL * COLS;

const SNAKE_COLORS = {
  purple: { body: '#6B63C8', head: '#9F99E8' },
  teal:   { body: '#0F6E56', head: '#2DCB96' },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBoard(ctx, playerState, colorKey) {
  if (!playerState) return;
  const { snake, apple, wall } = playerState;
  const colors = SNAKE_COLORS[colorKey];
  const pad = 1;

  ctx.fillStyle = '#111120';
  ctx.fillRect(0, 0, W, W);

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
  }

  (wall || []).forEach(({ x, y }) => {
    const px = x * CELL + pad, py = y * CELL + pad, sz = CELL - pad * 2;
    roundRect(ctx, px, py, sz, sz, 3);
    ctx.fillStyle = '#BA7517'; ctx.fill();
    ctx.strokeStyle = '#EF9F27'; ctx.lineWidth = 1; ctx.stroke();
  });

  if (apple) {
    const acx = apple.x * CELL + CELL / 2;
    const acy = apple.y * CELL + CELL / 2;
    const ar = CELL / 2 - 2;
    ctx.beginPath(); ctx.arc(acx, acy + 1, ar, 0, Math.PI * 2);
    ctx.fillStyle = '#E24B4A'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(acx, acy - ar + 2); ctx.lineTo(acx + 2, acy - ar - 4);
    ctx.strokeStyle = '#2DCB96'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(acx + 5, acy - ar - 1, 4, 2, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#2DCB96'; ctx.fill();
  }

  const len = (snake || []).length;
  for (let i = len - 1; i >= 0; i--) {
    const seg = snake[i];
    const isHead = i === 0;
    const opacity = isHead ? 1 : Math.max(0.35, 1 - (i / len) * 0.65);
    const px = seg.x * CELL + pad, py = seg.y * CELL + pad, sz = CELL - pad * 2;

    ctx.globalAlpha = opacity;
    roundRect(ctx, px, py, sz, sz, 4);
    ctx.fillStyle = isHead ? colors.head : colors.body;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (isHead && snake[1]) {
      const next = snake[1];
      const ddx = seg.x - next.x, ddy = seg.y - next.y;
      const cx = seg.x * CELL + CELL / 2, cy = seg.y * CELL + CELL / 2;
      let e1x, e1y, e2x, e2y;
      const eo = CELL * 0.18, ef = CELL * 0.2;
      if      (ddx ===  1) { e1x=cx+ef; e1y=cy-eo; e2x=cx+ef; e2y=cy+eo; }
      else if (ddx === -1) { e1x=cx-ef; e1y=cy-eo; e2x=cx-ef; e2y=cy+eo; }
      else if (ddy ===  1) { e1x=cx-eo; e1y=cy+ef; e2x=cx+eo; e2y=cy+ef; }
      else                 { e1x=cx-eo; e1y=cy-ef; e2x=cx+eo; e2y=cy-ef; }
      ctx.fillStyle = '#0a0a14';
      ctx.beginPath(); ctx.arc(e1x, e1y, CELL * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2x, e2y, CELL * 0.1, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function GameBoard({ playerState, colorKey }) {
  const canvasRef = useRef(null);
  const dotColor = colorKey === 'purple' ? '#9F99E8' : '#2DCB96';

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawBoard(ctx, playerState, colorKey);
  }, [playerState, colorKey]);

  return (
    <div className="board-panel">
      <div className="board-meta">
        <div className="board-player">
          <span className="player-dot" style={{ background: dotColor }} />
          <span className="player-name">{playerState?.name ?? '...'}</span>
        </div>
        <div className="board-score">
          <span className="score-label">SCORE</span>
          <span className="score-value" style={{ color: dotColor }}>{playerState?.score ?? 0}</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={W} className="game-canvas" />
    </div>
  );
}

export default function MultiplayerGamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username  = location.state?.username  || 'Player';
  const yourRole  = location.state?.yourRole  || 'p1';

  const [gameState, setGameState] = useState(location.state?.gameState ?? null);

  useEffect(() => {
    const socket = getSocket();
    socket.on('game_state', (state) => setGameState(state));
    socket.on('opponent_disconnected', () => {
      setGameState(prev => prev ? { ...prev, gameOver: true, winner: username } : prev);
    });
    return () => {
      socket.off('game_state');
      socket.off('opponent_disconnected');
      disconnectSocket();
    };
  }, [username]);

  const handleLobby = () => {
    disconnectSocket();
    navigate('/lobby', { state: { username } });
  };

  // Always show the local player on the left (purple) and the opponent on the right (teal)
  const leftState  = yourRole === 'p1' ? gameState?.p1 : gameState?.p2;
  const rightState = yourRole === 'p1' ? gameState?.p2 : gameState?.p1;

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="header-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="6" height="6" rx="1.5" fill="#1D9E75"/>
            <rect x="12" y="4" width="6" height="6" rx="1.5" fill="#1D9E75"/>
            <rect x="20" y="4" width="6" height="6" rx="1.5" fill="#2DCB96" opacity="0.5"/>
            <rect x="4" y="12" width="6" height="6" rx="1.5" fill="#1D9E75"/>
            <rect x="4" y="20" width="6" height="6" rx="1.5" fill="#2DCB96" opacity="0.7"/>
            <rect x="4" y="28" width="6" height="6" rx="1.5" fill="#2DCB96" opacity="0.4"/>
            <rect x="24" y="14" width="5" height="5" rx="2.5" fill="#E24B4A"/>
          </svg>
          <span className="header-logo-text">SERPENTINE</span>
        </div>
        <div className="live-badge"><span className="live-dot" />LIVE</div>
      </header>

      <main className="game-main">
        <div className="boards-row">
          <GameBoard playerState={leftState}  colorKey="purple" />
          <GameBoard playerState={rightState} colorKey="teal"   />
        </div>

        <div className="legend">
          <div className="legend-item"><span className="legend-swatch legend-empty" /><span>empty</span></div>
          <div className="legend-item"><span className="legend-swatch legend-snake" /><span>your snake</span></div>
          <div className="legend-item"><span className="legend-swatch legend-apple" /><span>apple</span></div>
          <div className="legend-item"><span className="legend-swatch legend-wall"  /><span>wall</span></div>
        </div>

        <button className="back-lobby-btn" style={{ marginTop: 4 }} onClick={handleLobby}>← back to lobby</button>

        <p className="credit">created by David Kaplun</p>
      </main>
    </div>
  );
}
