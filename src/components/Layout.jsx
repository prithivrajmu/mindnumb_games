import React, { useState, useEffect } from 'react';
import { getAllGames } from '../games/registry';

const THEMES = [
    { id: 'midnight', name: '🌙 Midnight' },
    { id: 'dawn', name: '☀️ Dawn' },
    { id: 'paper', name: '📝 Paper' }
];

const Layout = ({ activeGameId, onGameSelect }) => {
    const games = getAllGames();
    const activeGame = games.find(g => g.id === activeGameId);
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('mng_theme') || 'midnight';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('mng_theme', currentTheme);
    }, [currentTheme]);

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                padding: '2rem',
                borderRight: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '2rem',
                    background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Mind Numb
                </h1>

                <nav style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem'
                    }}>
                        Daily Games
                    </h3>
                    <ul style={{ listStyle: 'none' }}>
                        {games.map(game => (
                            <li key={game.id} style={{ marginBottom: '0.5rem' }}>
                                <button
                                    onClick={() => onGameSelect(game.id)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: activeGameId === game.id ? 'var(--cell-bg-selected)' : 'transparent',
                                        color: activeGameId === game.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s',
                                        fontWeight: activeGameId === game.id ? 'bold' : 'normal'
                                    }}
                                >
                                    <span>{game.icon}</span>
                                    {game.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Theme Switcher */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>THEME</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => setCurrentTheme(theme.id)}
                                title={theme.name}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '0.375rem',
                                    border: currentTheme === theme.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                    background: currentTheme === theme.id ? 'var(--cell-bg-selected)' : 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}
                            >
                                {theme.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'var(--bg-primary)' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeGame ? activeGame.name : 'Select a Game'}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{activeGame ? activeGame.description : ''}</p>
                    </div>
                    {/* Placeholder for global stats or user profile */}
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Daily Streak: </span>
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>3 🔥</span>
                    </div>
                </header>

                <div className="game-container animate-fade-in">
                    {activeGame ? (
                        <activeGame.component />
                    ) : (
                        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-primary)' }}>Select a game from the sidebar to start playing.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Layout;
