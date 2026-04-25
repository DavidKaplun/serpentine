const COLS = 30;
const ROWS = 30;
const WIN_SCORE = 30;
const APPLE_MIN_DIST = 8;
const TICK_MS = 130;
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const DIR_VEC  = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };

let queue = [];
const rooms      = new Map(); // roomId  → match
const socketRoom = new Map(); // socketId → roomId

// ── Apple / wall helpers (same logic as game.js) ──────────────────────────────

function spawnApple(snake, wall) {
  const head = snake[0];
  const blocked = new Set([
    ...snake.map(s => `${s.x},${s.y}`),
    ...wall.map(w => `${w.x},${w.y}`),
  ]);
  for (let attempt = 0; attempt < 300; attempt++) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    if (Math.abs(x - head.x) + Math.abs(y - head.y) >= APPLE_MIN_DIST && !blocked.has(`${x},${y}`))
      return { x, y };
  }
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++)
      if (!blocked.has(`${x},${y}`)) return { x, y };
  return { x: 15, y: 15 };
}

function canReach(start, goal, snake, wall) {
  const blocked = new Set([
    ...snake.slice(1).map(s => `${s.x},${s.y}`),
    ...wall.map(w => `${w.x},${w.y}`),
  ]);
  const goalKey = `${goal.x},${goal.y}`;
  const visited = new Set([`${start.x},${start.y}`]);
  const q = [start];
  while (q.length) {
    const cur = q.shift();
    if (`${cur.x},${cur.y}` === goalKey) return true;
    for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx = cur.x + dx, ny = cur.y + dy, k = `${nx},${ny}`;
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !blocked.has(k) && !visited.has(k)) {
        visited.add(k); q.push({ x: nx, y: ny });
      }
    }
  }
  return false;
}

function tryBuildWall(snake, apple) {
  const head = snake[0];
  const dx = apple.x - head.x, dy = apple.y - head.y;
  const snakeSet = new Set(snake.map(s => `${s.x},${s.y}`));
  const appleKey = `${apple.x},${apple.y}`;
  const length = 4 + Math.floor(Math.random() * 4);
  const half   = Math.floor(length / 2);
  const candidates = [];
  if (Math.abs(dy) >= Math.abs(dx)) {
    const wallY = dy > 0 ? apple.y - 2 : apple.y + 2;
    for (let i = -half; i < -half + length; i++) candidates.push({ x: apple.x + i, y: wallY });
  } else {
    const wallX = dx > 0 ? apple.x - 2 : apple.x + 2;
    for (let i = -half; i < -half + length; i++) candidates.push({ x: wallX, y: apple.y + i });
  }
  const wall = candidates.filter(({ x, y }) => {
    const key = `${x},${y}`;
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && !snakeSet.has(key) && key !== appleKey;
  });
  return wall.length >= 4 ? wall : null;
}

function generateWall(snake, apple) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const wall = tryBuildWall(snake, apple);
    if (wall && canReach(snake[0], apple, snake, wall)) return wall;
  }
  return [];
}

// ── Match factory ─────────────────────────────────────────────────────────────

function createPlayer(socket, name, hx, hy, dir) {
  const ddx = dir === 'right' ? -1 : 1;
  return {
    socket,
    name,
    snake: [{ x: hx, y: hy }, { x: hx + ddx, y: hy }, { x: hx + ddx * 2, y: hy }],
    direction:     dir,
    nextDirection: dir,
    score: 0,
    alive: true,
    apple: null,
    wall:  [],
    _ateApple: false,
  };
}

function createMatch(s1, n1, s2, n2) {
  const p1 = createPlayer(s1, n1, 4,  14, 'right');
  const p2 = createPlayer(s2, n2, 25, 14, 'left');
  p1.apple = spawnApple(p1.snake, []);
  p2.apple = spawnApple(p2.snake, []);
  p1.wall  = generateWall(p1.snake, p1.apple);
  p2.wall  = generateWall(p2.snake, p2.apple);
  return { p1, p2, gameOver: false, winner: null, interval: null, rematchVotes: new Set() };
}

function buildState(match) {
  return {
    p1: { name: match.p1.name, snake: match.p1.snake, score: match.p1.score,
          apple: match.p1.apple, wall: match.p1.wall, alive: match.p1.alive },
    p2: { name: match.p2.name, snake: match.p2.snake, score: match.p2.score,
          apple: match.p2.apple, wall: match.p2.wall, alive: match.p2.alive },
    gameOver: match.gameOver,
    winner:   match.winner,
  };
}

function broadcast(match, event, data) {
  match.p1.socket.emit(event, data);
  match.p2.socket.emit(event, data);
}

// ── Tick ──────────────────────────────────────────────────────────────────────

function movePlayer(player) {
  if (!player.alive) return;
  player.direction = player.nextDirection;
  const d       = DIR_VEC[player.direction];
  const head    = player.snake[0];
  const newHead = { x: head.x + d.x, y: head.y + d.y };

  if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
    player.alive = false; return;
  }
  if (player.wall.some(w => w.x === newHead.x && w.y === newHead.y)) {
    player.alive = false; return;
  }
  if (player.snake.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
    player.alive = false; return;
  }

  const ate = newHead.x === player.apple.x && newHead.y === player.apple.y;
  player.snake.unshift(newHead);
  if (!ate) {
    player.snake.pop();
  } else {
    player.score++;
    player._ateApple = true;
  }
}

function tickMatch(match) {
  if (match.gameOver) return;

  movePlayer(match.p1);
  movePlayer(match.p2);

  if (match.p1._ateApple || match.p2._ateApple) {
    match.p1._ateApple = false;
    match.p2._ateApple = false;
    match.p1.apple = spawnApple(match.p1.snake, []);
    match.p2.apple = spawnApple(match.p2.snake, []);
    match.p1.wall  = generateWall(match.p1.snake, match.p1.apple);
    match.p2.wall  = generateWall(match.p2.snake, match.p2.apple);
  }

  if      (match.p1.score >= WIN_SCORE)          { match.gameOver = true; match.winner = match.p1.name; }
  else if (match.p2.score >= WIN_SCORE)          { match.gameOver = true; match.winner = match.p2.name; }
  else if (!match.p1.alive && !match.p2.alive)  { match.gameOver = true; match.winner = null; }
  else if (!match.p1.alive)                     { match.gameOver = true; match.winner = match.p2.name; }
  else if (!match.p2.alive)                     { match.gameOver = true; match.winner = match.p1.name; }
}

function startLoop(match) {
  match.interval = setInterval(() => {
    tickMatch(match);
    broadcast(match, 'game_state', buildState(match));
    if (match.gameOver) clearInterval(match.interval);
  }, TICK_MS);
}

// ── Socket handler ────────────────────────────────────────────────────────────

function registerOnlineSocket(socket) {

  socket.on('join_matchmaking', ({ username }) => {
    queue = queue.filter(p => p.socket.id !== socket.id);
    queue.push({ socket, username });
    console.log(`[mm] queue: ${queue.map(p => p.username).join(', ')}`);

    if (queue.length >= 2) {
      const [e1, e2] = queue.splice(0, 2);
      const roomId   = `${e1.socket.id}|${e2.socket.id}`;
      const match    = createMatch(e1.socket, e1.username, e2.socket, e2.username);

      rooms.set(roomId, match);
      socketRoom.set(e1.socket.id, roomId);
      socketRoom.set(e2.socket.id, roomId);

      console.log(`[mm] matched ${e1.username} vs ${e2.username}`);
      e1.socket.emit('match_found', { state: buildState(match), yourRole: 'p1' });
      e2.socket.emit('match_found', { state: buildState(match), yourRole: 'p2' });

      startLoop(match);
    }
  });

  socket.on('leave_matchmaking', () => {
    queue = queue.filter(p => p.socket.id !== socket.id);
  });

  socket.on('player_move', ({ direction }) => {
    const match = rooms.get(socketRoom.get(socket.id));
    if (!match || match.gameOver) return;
    const player = match.p1.socket.id === socket.id ? match.p1 : match.p2;
    if (player.alive && direction !== OPPOSITE[player.direction])
      player.nextDirection = direction;
  });

  socket.on('play_again', () => {
    const roomId = socketRoom.get(socket.id);
    const match  = rooms.get(roomId);
    if (!match || !match.gameOver) return;

    match.rematchVotes.add(socket.id);
    if (match.rematchVotes.size < 2) return;

    clearInterval(match.interval);
    const newMatch = createMatch(match.p1.socket, match.p1.name, match.p2.socket, match.p2.name);
    rooms.set(roomId, newMatch);

    broadcast(newMatch, 'game_state', buildState(newMatch));
    startLoop(newMatch);
  });

  socket.on('disconnect', () => {
    queue = queue.filter(p => p.socket.id !== socket.id);

    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;

    const match = rooms.get(roomId);
    if (match) {
      clearInterval(match.interval);
      const other = match.p1.socket.id === socket.id ? match.p2 : match.p1;
      other.socket.emit('opponent_disconnected');
      // Remove both mappings so the remaining player can't trigger further game logic
      socketRoom.delete(match.p1.socket.id);
      socketRoom.delete(match.p2.socket.id);
      rooms.delete(roomId);
    } else {
      socketRoom.delete(socket.id);
    }
  });
}

module.exports = { registerOnlineSocket };
