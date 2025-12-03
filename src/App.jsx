import React, { useState } from 'react';
import Layout from './components/Layout';
import { getAllGames } from './games/registry';

function App() {
  const games = getAllGames();
  // Default to the first available game
  const [activeGameId, setActiveGameId] = useState(games[0]?.id || 'sudoku');

  return (
    <Layout
      activeGameId={activeGameId}
      onGameSelect={setActiveGameId}
    />
  );
}

export default App;
