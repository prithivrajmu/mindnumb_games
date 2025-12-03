import React, { useState } from 'react';
import { getAllGames } from '../games/registry';

const Layout = ({ activeGameId, onGameSelect }) => {
    const games = getAllGames();
    const activeGame = games.find(g => g.id === activeGameId);

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                padding: '2rem',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15, 23, 42, 0.8)'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '2rem',
                    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Mind Numb
                </h1>

                <nav>
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
                                        background: activeGameId === game.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                        color: activeGameId === game.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>{game.icon}</span>
                                    {game.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeGame ? activeGame.name : 'Select a Game'}</h2>
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
                            <p>Select a game from the sidebar to start playing.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Layout;
