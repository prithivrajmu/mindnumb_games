import React, { useState, useEffect } from 'react';
import { getAllGames } from '../games/registry';
import Home from './Home';

const LOGO = `${import.meta.env.BASE_URL}logo.jpg`;

const THEMES = [
    { id: 'midnight', name: '🌙 Midnight', emoji: '🌙' },
    { id: 'dawn', name: '☀️ Dawn', emoji: '☀️' },
    { id: 'ocean', name: '🌊 Ocean', emoji: '🌊' },
    { id: 'sunset', name: '🌅 Sunset', emoji: '🌅' },
    { id: 'forest', name: '🌲 Forest', emoji: '🌲' },
    { id: 'neon', name: '⚡ Neon', emoji: '⚡' },
    { id: 'monokai', name: '💻 Monokai', emoji: '💻' },
    { id: 'paper', name: '📝 Paper', emoji: '📝' }
];

const HOME = { id: '', name: 'Home', icon: '🏠' };

const Layout = ({ activeGameId, onGameSelect }) => {
    const games = getAllGames();
    const activeGame = games.find(g => g.id === activeGameId);
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('mng_theme') || 'midnight';
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('mng_theme', currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Desktop/Tablet Sidebar */}
            <aside className="sidebar" style={{
                width: '280px',
                padding: '2rem',
                borderRight: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <img src={LOGO} alt="Drift Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Drift
                    </h1>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5 }}>v1.1</span>
                </div>

                <nav style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem'
                    }}>
                        Games
                    </h3>
                    <ul style={{ listStyle: 'none' }}>
                        {[HOME, ...games].map(game => (
                            <li key={game.id} style={{ marginBottom: '0.5rem' }}>
                                <button
                                    onClick={() => onGameSelect(game.id)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: (activeGameId || '') === game.id ? 'var(--cell-bg-selected)' : 'transparent',
                                        color: (activeGameId || '') === game.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s',
                                        fontWeight: (activeGameId || '') === game.id ? 'bold' : 'normal'
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
                    <label htmlFor="theme-select" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>THEME</label>
                    <select
                        id="theme-select"
                        value={currentTheme}
                        onChange={(e) => setCurrentTheme(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            paddingRight: '2.5rem'
                        }}
                    >
                        {THEMES.map(theme => (
                            <option key={theme.id} value={theme.id}>
                                {theme.name}
                            </option>
                        ))}
                    </select>
                </div>
            </aside>

            {/* Mobile Header */}
            {isMobile && (
                <div className="mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={LOGO} alt="Drift Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            Drift
                        </h1>
                    </div>
                    <select
                        value={currentTheme}
                        onChange={(e) => setCurrentTheme(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            minHeight: '44px'
                        }}
                    >
                        {THEMES.map(theme => (
                            <option key={theme.id} value={theme.id}>
                                {theme.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Main Content */}
            <main style={{ flex: 1, padding: isMobile ? '1rem' : '2rem', overflowY: 'auto', background: 'var(--bg-primary)' }}>
                <div className="game-container animate-fade-in">
                    {activeGame ? (
                        <activeGame.component />
                    ) : (
                        <Home />
                    )}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <nav className="mobile-bottom-nav">
                    {[HOME, ...games].map(game => (
                        <button
                            key={game.id}
                            onClick={() => onGameSelect(game.id)}
                            className={(activeGameId || '') === game.id ? 'active' : ''}
                        >
                            <span className="icon">{game.icon}</span>
                            <span>{game.name}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
};

export default Layout;
