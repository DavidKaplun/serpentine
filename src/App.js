import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import MatchmakingPage from './pages/MatchmakingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/matchmaking" element={<MatchmakingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;