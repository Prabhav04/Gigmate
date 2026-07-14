import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import JoinSession from './pages/JoinSession';
import SessionSpace from './pages/SessionSpace';
import ExperimentalLyricsView from './pages/ExperimentalLyricsView';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<JoinSession />} />
          <Route path="/session/:sessionId" element={<SessionSpace />} />
          <Route path="/experimental-lyrics/:sessionId?" element={<ExperimentalLyricsView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
