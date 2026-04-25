const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createGame, tickGame, setPlayerDirection, resetGame } = require('./game');
const { registerOnlineSocket } = require('./onlinegame');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const TICK_MS = 130;
const sessions = new Map(); // socketId → { game, interval }

function buildState(game) {
  return {
    p1: { name: game.p1.name, snake: game.p1.snake, score: game.p1.score, apple: game.p1.apple, wall: game.p1.wall, alive: game.p1.alive },
    p2: { name: game.p2.name, snake: game.p2.snake, score: game.p2.score, apple: game.p2.apple, wall: game.p2.wall, alive: game.p2.alive },
    gameOver: game.gameOver,
    winner: game.winner,
  };
}

io.on('connection', (socket) => {
  console.log('connected:', socket.id);
  registerOnlineSocket(socket);

  socket.on('join_bot_game', ({ username }) => {
    // Clean up any previous session
    if (sessions.has(socket.id)) {
      clearInterval(sessions.get(socket.id).interval);
    }

    const game = createGame(username);

    const interval = setInterval(() => {
      tickGame(game);
      socket.emit('game_state', buildState(game));
      if (game.gameOver) clearInterval(interval);
    }, TICK_MS);

    sessions.set(socket.id, { game, interval });
    socket.emit('game_state', buildState(game));
  });

  socket.on('player_move', ({ direction }) => {
    const session = sessions.get(socket.id);
    if (session) setPlayerDirection(session.game, direction);
  });

  socket.on('play_again', () => {
    const session = sessions.get(socket.id);
    if (!session) return;
    clearInterval(session.interval);
    resetGame(session.game);

    const interval = setInterval(() => {
      tickGame(session.game);
      socket.emit('game_state', buildState(session.game));
      if (session.game.gameOver) clearInterval(interval);
    }, TICK_MS);

    session.interval = interval;
    socket.emit('game_state', buildState(session.game));
  });

  socket.on('disconnect', () => {
    const session = sessions.get(socket.id);
    if (session) { clearInterval(session.interval); sessions.delete(socket.id); }
    console.log('disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
