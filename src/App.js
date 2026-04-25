import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import MatchmakingPage from './pages/MatchmakingPage';
import MultiplayerGamePage from './pages/MultiplayerGamePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/matchmaking" element={<MatchmakingPage />} />
        <Route path="/multiplayer-game" element={<MultiplayerGamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;