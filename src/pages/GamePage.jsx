import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './GamePage.css';

const CELL = 24;
const COLS = 30;
const W = CELL * COLS; // 330px

const SNAKE_COLORS = {
  purple: { body: '#6B63C8', head: '#9F99E8' },
  teal:   { body: '#0F6E56', head: '#2DCB96' },
};

const INITIAL_P1 = {
  score: 0,
  snake: [{x:4,y:14},{x:3,y:14},{x:2,y:14}],
  apple: { x: 15, y: 14 },
  wall: [],
};

const INITIAL_P2 = {
  score: 0,
  snake: [{x:25,y:14},{x:26,y:14},{x:27,y:14}],
  apple: { x: 15, y: 14 },
  wall: [],
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

function drawBoard(ctx, state, colorKey) {
  const { snake, apple, wall } = state;
  const colors = SNAKE_COLORS[colorKey];
  const pad = 1;

  // Background
  ctx.fillStyle = '#111120';
  ctx.fillRect(0, 0, W, W);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
  }

  // Wall
  wall.forEach(({ x, y }) => {
    const px = x * CELL + pad, py = y * CELL + pad, sz = CELL - pad * 2;
    roundRect(ctx, px, py, sz, sz, 2);
    ctx.fillStyle = '#BA7517';
    ctx.fill();
    ctx.strokeStyle = '#EF9F27';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Apple
  const acx = apple.x * CELL + CELL / 2;
  const acy = apple.y * CELL + CELL / 2;
  const ar = CELL / 2 - 1.5;
  ctx.beginPath();
  ctx.arc(acx, acy + 1, ar, 0, Math.PI * 2);
  ctx.fillStyle = '#E24B4A';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(acx, acy - ar + 2);
  ctx.lineTo(acx + 1, acy - ar - 2);
  ctx.strokeStyle = '#2DCB96';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(acx + 3, acy - ar, 2.5, 1.2, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#2DCB96';
  ctx.fill();

  // Snake — draw tail first so head renders on top
  const len = snake.length;
  for (let i = len - 1; i >= 0; i--) {
    const seg = snake[i];
    const isHead = i === 0;
    const opacity = isHead ? 1 : Math.max(0.35, 1 - (i / len) * 0.65);
    const px = seg.x * CELL + pad, py = seg.y * CELL + pad, sz = CELL - pad * 2;

    ctx.globalAlpha = opacity;
    roundRect(ctx, px, py, sz, sz, 3);
    ctx.fillStyle = isHead ? colors.head : colors.body;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eyes on head
    if (isHead && snake[1]) {
      const next = snake[1];
      const dx = seg.x - next.x;
      const dy = seg.y - next.y;
      const cx = seg.x * CELL + CELL / 2;
      const cy = seg.y * CELL + CELL / 2;
      let e1x, e1y, e2x, e2y;
      if      (dx ===  1) { e1x = cx+2; e1y = cy-2; e2x = cx+2; e2y = cy+2; }
      else if (dx === -1) { e1x = cx-2; e1y = cy-2; e2x = cx-2; e2y = cy+2; }
      else if (dy ===  1) { e1x = cx-2; e1y = cy+2; e2x = cx+2; e2y = cy+2; }
      else                { e1x = cx-2; e1y = cy-2; e2x = cx+2; e2y = cy-2; }
      ctx.fillStyle = '#0a0a14';
      ctx.beginPath(); ctx.arc(e1x, e1y, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2x, e2y, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function GameBoard({ playerName, colorKey, score, state }) {
  const canvasRef = useRef(null);
  const dotColor = colorKey === 'purple' ? '#9F99E8' : '#2DCB96';

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawBoard(ctx, state, colorKey);
  }, [state, colorKey]);

  return (
    <div className="board-panel">
      <div className="board-meta">
        <div className="board-player">
          <span className="player-dot" style={{ background: dotColor }} />
          <span className="player-name">{playerName}</span>
        </div>
        <div className="board-score">
          <span className="score-label">SCORE</span>
          <span className="score-value" style={{ color: dotColor }}>{score}</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={W} height={W} className="game-canvas" />
    </div>
  );
}

function makeEndState(p1Name, p2Name) {
  return {
    winner: p1Name,
    players: [
      { name: p1Name, colorKey: 'purple', score: 30 },
      { name: p2Name, colorKey: 'teal',   score: 21 },
    ],
  };
}

function EndGameOverlay({ endState }) {
  const { winner, players } = endState;
  return (
    <div className="endgame-backdrop">
      <div className="endgame-card">
        <div className="endgame-header">
          <div className="winner-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L11 14.27l-4.77 2.44.91-5.32L3.27 7.62l5.34-.78L11 2z"
                fill="white" opacity="0.95"/>
            </svg>
          </div>
          <p className="winner-label">WINNER</p>
          <p className="winner-name">{winner}</p>
        </div>

        <div className="endgame-body">
          <div className="scores-row">
            {players.map(({ name, colorKey, score }) => {
              const color = colorKey === 'purple' ? '#9F99E8' : '#2DCB96';
              return (
                <div className="score-col" key={name}>
                  <div className="score-col-player">
                    <span className="player-dot" style={{ background: color }} />
                    <span className="score-col-name">{name}</span>
                  </div>
                  <span className="score-col-value" style={{ color }}>{score}</span>
                  <span className="score-col-label">FINAL SCORE</span>
                </div>
              );
            })}
          </div>

          <button className="play-again-btn">Play again</button>
          <button className="back-lobby-btn">Back to lobby</button>
        </div>
      </div>
    </div>
  );
}

function GamePage() {
  const location = useLocation();
  const username = location.state?.username || 'Player';
  const p2Name = 'Bot';
  const gameOver = false;
  const endState = makeEndState(username, p2Name);

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
        {gameOver
          ? <div className="ended-badge">ENDED</div>
          : <div className="live-badge"><span className="live-dot" />LIVE</div>
        }
      </header>

      <main className={`game-main${gameOver ? ' game-main--dimmed' : ''}`}>
        <div className="boards-row">
          <GameBoard playerName={username} colorKey="purple" score={INITIAL_P1.score} state={INITIAL_P1} />
          <GameBoard playerName={p2Name}   colorKey="teal"   score={INITIAL_P2.score} state={INITIAL_P2} />
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-swatch legend-empty" />
            <span>empty</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch legend-snake" />
            <span>your snake</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch legend-apple" />
            <span>apple</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch legend-wall" />
            <span>wall</span>
          </div>
        </div>

        <p className="credit">created by David Kaplun</p>
      </main>

      {gameOver && <EndGameOverlay endState={endState} />}
    </div>
  );
}

export default GamePage;
