# Serpentine

A multiplayer browser Snake game with an A\*-pathfinding AI opponent and real-time online matchmaking.

## Demo

📹 **[Demo video — link to be added]**

🔗 **Live:** https://serpentineapp.com/

## Stack

- **Frontend:** React, React Router, Socket.io-client
- **Backend:** Node.js, Express, Socket.io
- **Infra:** AWS (EC2), S3 + CloudFront (frontend hosting)

## Architecture

The React client renders the board and streams player input over Socket.io to an authoritative Node.js/Express server that owns the game state, advances it on a fixed tick, and broadcasts each frame back to the clients. Single-player pits you against a bot that navigates with A\* pathfinding; multiplayer pairs two players through a matchmaking queue into a shared room.

## Key decisions

- **Server-authoritative game loop** — the server holds the single source of truth for game state and steps it on a fixed tick (~130ms), broadcasting to clients that only render and send input. This keeps both players in sync and prevents client-side divergence or cheating.
- **A\* pathfinding for the AI opponent** — the bot computes a shortest path to the apple using A\* with a Manhattan-distance heuristic, recomputing when a new apple spawns and falling back to a safe move when no path exists.
- **Reachability-guaranteed wall generation** — every apple spawns alongside procedurally placed walls, but a breadth-first search verifies the apple is still reachable before the walls are committed, so obstacles never make a round unwinnable.
- **Socket.io matchmaking** — players join a queue and are paired into isolated rooms, each running its own game loop, for real-time head-to-head play.

## Known limitations / next steps

- **No accounts or persistent scores** — there's no login or saved leaderboard; results live only for the duration of a match. Next step: add accounts and a persistent leaderboard.
- **No reconnection handling** — if a player drops mid-match, the game ends immediately for both. Next step: add a brief reconnect grace window.
