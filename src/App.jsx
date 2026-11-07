import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { getGame } from './games/registry';

// Hash routing (#sudoku) works from any subpath on a static host; no hash = home page
const idFromHash = () => {
  const id = window.location.hash.slice(1);
  return getGame(id) ? id : null;
};

function App() {
  const [activeGameId, setActiveGameId] = useState(idFromHash);

  useEffect(() => {
    const onHash = () => setActiveGameId(idFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <Layout
      activeGameId={activeGameId}
      onGameSelect={(id) => { window.location.hash = id || ''; }}
    />
  );
}

export default App;
