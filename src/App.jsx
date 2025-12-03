import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { GAMES } from './games/registry';

function App() {
  // Default to Sudoku or the first available game
  const [activeGameId, setActiveGameId] = useState(GAMES.sudoku.id);

  return (
    <Layout
      activeGameId={activeGameId}
      onGameSelect={setActiveGameId}
    />
  );
}

export default App;
