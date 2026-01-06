import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import JoinSession from './pages/JoinSession';
import SessionSpace from './pages/SessionSpace';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<JoinSession />} />
          <Route path="/session/:sessionId" element={<SessionSpace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
