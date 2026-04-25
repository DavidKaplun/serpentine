let queue = [];

function makeSnake(hx, hy, dir) {
  const dx = dir === 'right' ? -1 : 1;
  return [
    { x: hx,          y: hy },
    { x: hx + dx,     y: hy },
    { x: hx + dx * 2, y: hy },
  ];
}

function createInitialState(p1Name, p2Name) {
  return {
    p1: { name: p1Name, snake: makeSnake(4,  14, 'right'), score: 0, apple: null, wall: [], alive: true },
    p2: { name: p2Name, snake: makeSnake(25, 14, 'left'),  score: 0, apple: null, wall: [], alive: true },
    gameOver: false,
    winner: null,
  };
}

function registerOnlineSocket(socket) {
  socket.on('join_matchmaking', ({ username }) => {
    queue = queue.filter(p => p.socket.id !== socket.id);
    queue.push({ socket, username });
    console.log(`[matchmaking] queue: ${queue.map(p => p.username).join(', ')}`);

    if (queue.length >= 2) {
      const [p1, p2] = queue.splice(0, 2);
      const state = createInitialState(p1.username, p2.username);
      console.log(`[matchmaking] matched ${p1.username} vs ${p2.username}`);
      p1.socket.emit('match_found', { state, yourRole: 'p1' });
      p2.socket.emit('match_found', { state, yourRole: 'p2' });
    }
  });

  socket.on('leave_matchmaking', () => {
    queue = queue.filter(p => p.socket.id !== socket.id);
  });

  socket.on('disconnect', () => {
    queue = queue.filter(p => p.socket.id !== socket.id);
  });
}

module.exports = { registerOnlineSocket };
