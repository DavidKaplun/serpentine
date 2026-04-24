import { useRef, useEffect } from 'react';
import './GamePage.css';

const CELL = 24;
const COLS = 30;
const W = CELL * COLS; // 330px

const SNAKE_COLORS = {
  purple: { body: '#6B63C8', head: '#9F99E8' },
  teal:   { body: '#0F6E56', head: '#2DCB96' },
};

const P1_STATE = {
  score: 47,
  snake: [
    {x:13,y:14},{x:12,y:14},{x:11,y:14},{x:10,y:14},{x:9,y:14},
    {x:8,y:14},{x:7,y:14},{x:6,y:14},{x:5,y:14},
    {x:5,y:15},{x:5,y:16},{x:5,y:17},
    {x:6,y:17},{x:7,y:17},{x:8,y:17},
    {x:8,y:16},{x:8,y:15},
  ],
  apple: { x: 16, y: 9 },
  wall: [
    {x:14,y:7},{x:14,y:8},{x:14,y:9},{x:14,y:10},{x:14,y:11},
    {x:15,y:11},{x:16,y:11},
  ],
};

const P2_STATE = {
  score: 31,
  snake: [
    {x:19,y:10},{x:19,y:11},{x:19,y:12},{x:19,y:13},
    {x:18,y:13},{x:17,y:13},{x:16,y:13},
    {x:16,y:14},{x:16,y:15},
  ],
  apple: { x: 9, y: 17 },
  wall: [
    {x:11,y:16},{x:12,y:16},{x:13,y:16},{x:14,y:16},{x:14,y:17},
  ],
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

function GamePage() {
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
        <div className="live-badge">
          <span className="live-dot" />
          LIVE
        </div>
      </header>

      <main className="game-main">
        <div className="boards-row">
          <GameBoard playerName="David" colorKey="purple" score={P1_STATE.score} state={P1_STATE} />
          <GameBoard playerName="Alex"  colorKey="teal"   score={P2_STATE.score} state={P2_STATE} />
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
    </div>
  );
}

export default GamePage;
