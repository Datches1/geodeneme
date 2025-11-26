import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro/Intro';
import Game from './pages/Game/Game';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/main" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;

