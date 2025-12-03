import React, { useEffect, useState } from 'react';
import { storage } from '../services/storage';

const Leaderboard = ({ gameId, onClose }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadScores = async () => {
            const data = await storage.getLeaderboard(gameId);
            setScores(data);
            setLoading(false);
        };
        loadScores();
    }, [gameId]);

    return (
        <div className="glass-panel animate-fade-in" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '500px',
            padding: '2rem',
            zIndex: 100,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Top 10 Leaderboard</h2>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    ×
                </button>
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
            ) : scores.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No scores yet. Be the first!</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Rank</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Score</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Difficulty</th>
                            <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((entry, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: index < 3 ? 'bold' : 'normal', color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--text-primary)' }}>
                                    #{index + 1}
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{entry.score}</td>
                                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>{entry.difficulty}</td>
                                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {new Date(entry.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Leaderboard;
