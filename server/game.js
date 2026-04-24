const COLS = 30;
const ROWS = 30;
const WIN_SCORE = 30;
const APPLE_MIN_DIST = 8;

// ── Factory ──────────────────────────────────────────────────────────────────

function createPlayer(name, headPos, direction, isBot) {
  const dx = direction === 'right' ? -1 : 1;
  return {
    name,
    isBot,
    snake: [
      { x: headPos.x, y: headPos.y },
      { x: headPos.x + dx, y: headPos.y },
      { x: headPos.x + dx * 2, y: headPos.y },
    ],
    direction,
    nextDirection: direction,
    score: 0,
    alive: true,
    apple: null,
    wall: [],
    path: [],
  };
}

function createGame(p1Name) {
  const game = {
    p1: createPlayer(p1Name, { x: 4, y: 14 }, 'right', false),
    p2: createPlayer('Bot',  { x: 25, y: 14 }, 'left',  true),
    gameOver: false,
    winner: null,
  };
  game.p1.apple = spawnApple(game.p1.snake, []);
  game.p2.apple = spawnApple(game.p2.snake, []);
  game.p1.wall  = generateWall(game.p1.snake, game.p1.apple);
  game.p2.wall  = generateWall(game.p2.snake, game.p2.apple);
  return game;
}

function resetGame(game) {
  const p1Name = game.p1.name;
  game.p1 = createPlayer(p1Name, { x: 4, y: 14 }, 'right', false);
  game.p2 = createPlayer('Bot',  { x: 25, y: 14 }, 'left',  true);
  game.gameOver = false;
  game.winner   = null;
  game.p1.apple = spawnApple(game.p1.snake, []);
  game.p2.apple = spawnApple(game.p2.snake, []);
  game.p1.wall  = generateWall(game.p1.snake, game.p1.apple);
  game.p2.wall  = generateWall(game.p2.snake, game.p2.apple);
}

// ── Input ─────────────────────────────────────────────────────────────────────

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

function setPlayerDirection(game, direction) {
  if (!game.p1.alive) return;
  if (direction !== OPPOSITE[game.p1.direction]) {
    game.p1.nextDirection = direction;
  }
}

// ── Tick ──────────────────────────────────────────────────────────────────────

function tickGame(game) {
  if (game.gameOver) return;

  if (game.p2.alive) {
    game.p2.nextDirection = getBotDirection(game.p2);
  }

  movePlayer(game.p1);
  movePlayer(game.p2);

  // When either player eats an apple, both boards get a new apple + wall
  if (game.p1._ateApple || game.p2._ateApple) {
    game.p1._ateApple = false;
    game.p2._ateApple = false;
    game.p1.apple = spawnApple(game.p1.snake, []);
    game.p2.apple = spawnApple(game.p2.snake, []);
    game.p1.wall  = generateWall(game.p1.snake, game.p1.apple);
    game.p2.wall  = generateWall(game.p2.snake, game.p2.apple);
    game.p2.path  = []; // new apple → recompute path from scratch
  }

  if (game.p1.score >= WIN_SCORE) {
    game.gameOver = true; game.winner = game.p1.name;
  } else if (game.p2.score >= WIN_SCORE) {
    game.gameOver = true; game.winner = game.p2.name;
  } else if (!game.p1.alive && !game.p2.alive) {
    game.gameOver = true; game.winner = null;
  } else if (!game.p1.alive) {
    game.gameOver = true; game.winner = game.p2.name;
  } else if (!game.p2.alive) {
    game.gameOver = true; game.winner = game.p1.name;
  }
}

function movePlayer(player) {
  if (!player.alive) return;

  player.direction = player.nextDirection;
  const DIR_VEC = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
  const d = DIR_VEC[player.direction];
  const head = player.snake[0];
  const newHead = { x: head.x + d.x, y: head.y + d.y };

  // Board edge
  if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
    player.alive = false; return;
  }
  // Wall
  if (player.wall.some(w => w.x === newHead.x && w.y === newHead.y)) {
    player.alive = false; return;
  }
  // Self (exclude tail — it will move away)
  if (player.snake.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
    player.alive = false; return;
  }

  const ateApple = newHead.x === player.apple.x && newHead.y === player.apple.y;
  player.snake.unshift(newHead);
  if (!ateApple) {
    player.snake.pop();
  } else {
    player.score++;
    player.waypoint = null;
    player._ateApple = true;
  }
}

// ── Apple spawn ───────────────────────────────────────────────────────────────

function spawnApple(snake, wall) {
  const head = snake[0];
  const blocked = new Set([
    ...snake.map(s => `${s.x},${s.y}`),
    ...wall.map(w => `${w.x},${w.y}`),
  ]);

  for (let attempt = 0; attempt < 300; attempt++) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    if (Math.abs(x - head.x) + Math.abs(y - head.y) >= APPLE_MIN_DIST && !blocked.has(`${x},${y}`)) {
      return { x, y };
    }
  }
  // Fallback: first free cell
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++)
      if (!blocked.has(`${x},${y}`)) return { x, y };
  return { x: 15, y: 15 };
}

// ── Wall generation (Algorithm 5) ─────────────────────────────────────────────

function generateWall(snake, apple) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const wall = tryBuildWall(snake, apple);
    if (wall) {
      if (canReach(snake[0], apple, snake, wall)) return wall;
    }
  }
  return [];
}

function tryBuildWall(snake, apple) {
  const head = snake[0];
  const dx = apple.x - head.x;
  const dy = apple.y - head.y;

  const wallType = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down'  : 'up');

  let pos = (wallType === 'up' || wallType === 'right')
    ? { x: apple.x + 2, y: apple.y - 2 }
    : { x: apple.x - 2, y: apple.y + 2 };

  pos.x = Math.max(1, Math.min(COLS - 2, pos.x));
  pos.y = Math.max(1, Math.min(ROWS - 2, pos.y));

  const buildDir = { up: 'left', down: 'right', left: 'up', right: 'down' }[wallType];
  const VECS = {
    left:  [{ x:-1,y:0 }, { x:-1,y:-1 }, { x:-1,y:1 }],
    right: [{ x:1, y:0 }, { x:1, y:-1 }, { x:1, y:1 }],
    up:    [{ x:0,y:-1 }, { x:-1,y:-1 }, { x:1, y:-1}],
    down:  [{ x:0,y:1  }, { x:-1,y:1  }, { x:1, y:1 }],
  };
  const vecs = VECS[buildDir];
  const length = 4 + Math.floor(Math.random() * 4);

  const snakeSet = new Set(snake.map(s => `${s.x},${s.y}`));
  const appleKey = `${apple.x},${apple.y}`;
  const wall = [];
  const wallSet = new Set();
  let cur = { ...pos };

  for (let i = 0; i < length; i++) {
    const key = `${cur.x},${cur.y}`;
    if (cur.x < 0 || cur.x >= COLS || cur.y < 0 || cur.y >= ROWS) break;
    if (snakeSet.has(key) || key === appleKey || wallSet.has(key)) break;
    wall.push({ ...cur });
    wallSet.add(key);

    // Prefer straight, occasionally diagonal
    const ordered = Math.random() < 0.65 ? vecs : [vecs[1 + Math.floor(Math.random() * 2)], vecs[0]];
    let moved = false;
    for (const v of ordered) {
      const next = { x: cur.x + v.x, y: cur.y + v.y };
      const nk = `${next.x},${next.y}`;
      if (next.x >= 0 && next.x < COLS && next.y >= 0 && next.y < ROWS
          && !snakeSet.has(nk) && nk !== appleKey && !wallSet.has(nk)) {
        cur = next; moved = true; break;
      }
    }
    if (!moved) break;
  }

  return wall.length >= 4 ? wall : null;
}

function canReach(start, goal, snake, wall) {
  const blocked = new Set([
    ...snake.slice(1).map(s => `${s.x},${s.y}`),
    ...wall.map(w => `${w.x},${w.y}`),
  ]);
  const goalKey = `${goal.x},${goal.y}`;
  const visited = new Set([`${start.x},${start.y}`]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    if (`${cur.x},${cur.y}` === goalKey) return true;
    for (const [ddx, ddy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx = cur.x + ddx, ny = cur.y + ddy;
      const k = `${nx},${ny}`;
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !blocked.has(k) && !visited.has(k)) {
        visited.add(k); queue.push({ x: nx, y: ny });
      }
    }
  }
  return false;
}

// ── A* pathfinding ────────────────────────────────────────────────────────────

function aStar(start, goal, snake, wall) {
  const wallSet = new Set(wall.map(w => `${w.x},${w.y}`));
  const goalKey = `${goal.x},${goal.y}`;

  function blocked(x, y, step) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
    if (wallSet.has(`${x},${y}`)) return true;
    // Future body awareness: body segment i clears after i steps
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y && i + step < snake.length) return true;
    }
    return false;
  }

  const h = (x, y) => Math.abs(x - goal.x) + Math.abs(y - goal.y);
  const open = [{ x: start.x, y: start.y, g: 0, f: h(start.x, start.y), path: [] }];
  const best = new Map();

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift();
    const key = `${cur.x},${cur.y}`;
    if (key === goalKey) return cur.path;
    if (best.has(key) && best.get(key) <= cur.g) continue;
    best.set(key, cur.g);

    for (const [ddx, ddy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx = cur.x + ddx, ny = cur.y + ddy;
      const ng = cur.g + 1;
      if (!blocked(nx, ny, ng)) {
        const nk = `${nx},${ny}`;
        if (!best.has(nk) || best.get(nk) > ng) {
          open.push({ x: nx, y: ny, g: ng, f: ng + h(nx, ny), path: [...cur.path, { x: nx, y: ny }] });
        }
      }
    }
    if (open.length > 4000) break;
  }
  return null;
}

// ── Bot logic ─────────────────────────────────────────────────────────────────

function getBotDirection(bot) {
  if (bot.path.length === 0) {
    bot.path = aStar(bot.snake[0], bot.apple, bot.snake, bot.wall) || [];
  }

  if (bot.path.length > 0) {
    const next = bot.path.shift();
    return dirBetween(bot.snake[0], next);
  }

  return safeMove(bot);
}

function dirBetween(from, to) {
  const ddx = to.x - from.x, ddy = to.y - from.y;
  return ddx === 1 ? 'right' : ddx === -1 ? 'left' : ddy === 1 ? 'down' : 'up';
}

function safeMove(bot) {
  const head = bot.snake[0];
  const DIR_VEC = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
  const bodySet = new Set(bot.snake.slice(0, -1).map(s => `${s.x},${s.y}`));
  const wallSet = new Set(bot.wall.map(w => `${w.x},${w.y}`));

  for (const dir of ['up','down','left','right']) {
    if (dir === OPPOSITE[bot.direction]) continue;
    const v = DIR_VEC[dir];
    const nx = head.x + v.x, ny = head.y + v.y;
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS
        && !bodySet.has(`${nx},${ny}`) && !wallSet.has(`${nx},${ny}`)) {
      return dir;
    }
  }
  return bot.direction;
}

module.exports = { createGame, tickGame, setPlayerDirection, resetGame };
