import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import Leaderboard from '../../components/Leaderboard';

const DIFFICULTIES = {
    EASY: { pairs: 8, gridCols: 4 },
    MEDIUM: { pairs: 12, gridCols: 4 },
    HARD: { pairs: 16, gridCols: 4 }
};

const EMOJI_SETS = [
    ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻', '🥁', '🎵', '🎶'],
    ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
    ['🍎', '🍌', '🍇', '🍊', '🍋', '🍉', '🍓', '🍑', '🍒', '🍈', '🍐', '🍏', '🥝', '🥑', '🍅', '🥕'],
    ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🏹', '⛳', '🏌️', '🏄', '🏊']
];

const MemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY);
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize cards
    const initializeCards = useCallback(() => {
        const emojiSet = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
        const selectedEmojis = emojiSet.slice(0, difficulty.pairs);
        const cardPairs = [...selectedEmojis, ...selectedEmojis];
        
        // Shuffle cards
        const shuffled = cardPairs.sort(() => Math.random() - 0.5);
        
        const newCards = shuffled.map((emoji, index) => ({
            id: index,
            emoji,
            isFlipped: false,
            isMatched: false
        }));
        
        setCards(newCards);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setTimer(0);
        setIsActive(false);
        setIsComplete(false);
        setHasStarted(false);
        setIsFlipping(false);
    }, [difficulty]);

    useEffect(() => {
        initializeCards();
    }, [initializeCards]);

    // Timer
    useEffect(() => {
        let interval = null;
        if (isActive && !isComplete && hasStarted) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isComplete, hasStarted]);

    // Check for matches
    useEffect(() => {
        if (flippedCards.length === 2 && !isFlipping) {
            setIsFlipping(true);
            const [first, second] = flippedCards;
            
            setTimeout(() => {
                if (cards[first].emoji === cards[second].emoji) {
                    // Match found
                    const newMatchedPairs = [...matchedPairs, cards[first].emoji];
                    setMatchedPairs(newMatchedPairs);
                    setCards(prev => prev.map(card => 
                        card.id === first || card.id === second
                            ? { ...card, isMatched: true }
                            : card
                    ));
                    
                    // Check if game is complete
                    if (newMatchedPairs.length === difficulty.pairs) {
                        setTimeout(() => handleWin(), 300);
                    }
                } else {
                    // No match - flip back
                    setCards(prev => prev.map(card => 
                        card.id === first || card.id === second
                            ? { ...card, isFlipped: false }
                            : card
                    ));
                }
                
                setFlippedCards([]);
                setIsFlipping(false);
            }, 1000);
        }
    }, [flippedCards, cards, matchedPairs, difficulty.pairs, isFlipping]);

    const handleCardClick = (cardId) => {
        if (isComplete || isFlipping || !hasStarted) return;
        if (flippedCards.length >= 2) return;
        if (flippedCards.includes(cardId)) return;
        
        const card = cards[cardId];
        if (card.isMatched || card.isFlipped) return;

        setCards(prev => prev.map(c => 
            c.id === cardId ? { ...c, isFlipped: true } : c
        ));
        
        setFlippedCards(prev => [...prev, cardId]);
        
        if (!isActive) {
            setIsActive(true);
        }
        
        if (flippedCards.length === 0) {
            setMoves(m => m + 1);
        }
    };

    async function handleWin() {
        setIsComplete(true);
        setIsActive(false);

        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }, 500);

        let playerName = localStorage.getItem('mng_player_name');
        if (!playerName) {
            playerName = prompt('🎉 Congratulations! Enter your name for the leaderboard:', '');
            if (playerName && playerName.trim()) {
                playerName = playerName.trim().substring(0, 20);
                localStorage.setItem('mng_player_name', playerName);
            } else {
                playerName = 'Anonymous';
            }
        }

        const baseScore = 1000 - (moves * 10) - (timer * 2);
        const difficultyBonus = difficulty === DIFFICULTIES.HARD ? 500 : difficulty === DIFFICULTIES.MEDIUM ? 200 : 0;
        const score = Math.max(0, baseScore + difficultyBonus);

        await storage.saveScore('memory', {
            name: playerName,
            date: new Date().toISOString(),
            score,
            difficulty: difficulty === DIFFICULTIES.EASY ? 'Easy' : difficulty === DIFFICULTIES.MEDIUM ? 'Medium' : 'Hard',
            moves,
            time: timer
        });
    };

    const startGame = () => {
        setHasStarted(true);
        setIsActive(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Start Screen
    if (!hasStarted) {
        return (
            <div className="memory-container" style={{ maxWidth: isMobile ? '100%' : '700px', margin: '0 auto' }}>
                <div className="card" style={{ marginBottom: '1rem', padding: isMobile ? '1rem' : '1.5rem', opacity: 0.5 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Difficulty</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                                {difficulty === DIFFICULTIES.EASY ? 'Easy' : difficulty === DIFFICULTIES.MEDIUM ? 'Medium' : 'Hard'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Pairs</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: isMobile ? '0.875rem' : '1rem' }}>{difficulty.pairs}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: isMobile ? '0.875rem' : '1rem' }}>0:00</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{
                    padding: isMobile ? '1.5rem' : '2rem',
                    textAlign: 'center',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Memory Match
                    </h2>
                    <p style={{ fontSize: isMobile ? '0.875rem' : '1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Find all matching pairs! Flip two cards at a time.
                    </p>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Select Difficulty:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {Object.entries(DIFFICULTIES).map(([key, value]) => (
                                <button
                                    key={key}
                                    className={difficulty === value ? 'btn-primary' : 'btn-secondary'}
                                    onClick={() => {
                                        setDifficulty(value);
                                        setTimeout(() => initializeCards(), 100);
                                    }}
                                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
                                >
                                    {key === 'EASY' ? 'Easy' : key === 'MEDIUM' ? 'Medium' : 'Hard'} ({value.pairs} pairs)
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={startGame}
                        style={{
                            padding: isMobile ? '1rem 2rem' : '1.25rem 3rem',
                            fontSize: isMobile ? '1.125rem' : '1.5rem',
                            fontWeight: 'bold'
                        }}
                    >
                        ▶ Start Game
                    </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="btn-secondary" onClick={() => setShowLeaderboard(true)}>
                        🏆 View Leaderboard
                    </button>
                </div>

                {showLeaderboard && (
                    <Leaderboard gameId="memory" onClose={() => setShowLeaderboard(false)} />
                )}
            </div>
        );
    }

    return (
        <>
            <div className="memory-container" style={{ maxWidth: isMobile ? '100%' : '700px', margin: '0 auto' }}>
                {/* Stats */}
                <div className="card" style={{ marginBottom: '1rem', padding: isMobile ? '1rem' : '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Moves</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: isMobile ? '0.875rem' : '1rem' }}>{moves}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: isMobile ? '0.875rem' : '1rem' }}>{formatTime(timer)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Matched</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--success)', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                                {matchedPairs.length}/{difficulty.pairs}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="glass-panel" style={{
                    padding: isMobile ? '0.75rem' : '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${difficulty.gridCols}, 1fr)`,
                        gap: isMobile ? '0.5rem' : '0.75rem',
                        maxWidth: isMobile ? '100%' : '600px',
                        margin: '0 auto'
                    }}>
                        {cards.map((card) => {
                            const isFlipped = card.isFlipped || card.isMatched;
                            const isSelected = flippedCards.includes(card.id);
                            
                            return (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    disabled={isFlipped || isFlipping || isComplete}
                                    className="memory-card"
                                    style={{
                                        aspectRatio: '1',
                                        minHeight: isMobile ? '70px' : '100px',
                                        background: isFlipped 
                                            ? (card.isMatched 
                                                ? 'linear-gradient(135deg, var(--success), var(--success))' 
                                                : 'var(--bg-tertiary)')
                                            : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        border: isSelected ? '3px solid var(--accent-primary)' : '2px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isMobile ? '2rem' : '3rem',
                                        cursor: isFlipped || isFlipping || isComplete ? 'default' : 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: isFlipped ? 'rotateY(0deg) scale(1)' : 'rotateY(180deg) scale(1)',
                                        opacity: card.isMatched ? 0.8 : 1,
                                        boxShadow: isSelected 
                                            ? 'var(--shadow-glow)' 
                                            : card.isMatched 
                                                ? '0 0 20px rgba(74, 222, 128, 0.5)' 
                                                : 'var(--shadow-md)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transformStyle: 'preserve-3d'
                                    }}
                                >
                                    {isFlipped ? (
                                        <span style={{ 
                                            animation: card.isMatched ? 'pulse 0.6s ease 2' : 'none',
                                            display: 'block',
                                            transform: 'rotateY(0deg)',
                                            backfaceVisibility: 'hidden'
                                        }}>
                                            {card.emoji}
                                        </span>
                                    ) : (
                                        <span style={{ 
                                            fontSize: isMobile ? '1.5rem' : '2rem',
                                            opacity: 0.9,
                                            fontWeight: 'bold',
                                            transform: 'rotateY(180deg)',
                                            backfaceVisibility: 'hidden'
                                        }}>
                                            ?
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button 
                        className="btn-secondary" 
                        onClick={() => {
                            if (window.confirm('Are you sure you want to restart?')) {
                                initializeCards();
                                setHasStarted(false);
                            }
                        }}
                    >
                        🔄 Restart
                    </button>
                    <button className="btn-secondary" onClick={() => setShowLeaderboard(true)}>
                        🏆 Leaderboard
                    </button>
                </div>

                {showLeaderboard && (
                    <Leaderboard gameId="memory" onClose={() => setShowLeaderboard(false)} />
                )}

                {/* Win Modal */}
                {isComplete && (
                    <div className="glass-panel animate-fade-in" style={{
                        padding: '2rem',
                        textAlign: 'center',
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '400px',
                        zIndex: 1000,
                        background: 'var(--glass-bg)'
                    }}>
                        <h2 style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '1.75rem' }}>🎉 Perfect Match!</h2>
                        <p style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.125rem' }}>
                            Moves: {moves}
                        </p>
                        <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Time: {formatTime(timer)}
                        </p>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            Score: {Math.max(0, 1000 - (moves * 10) - (timer * 2) + (difficulty === DIFFICULTIES.HARD ? 500 : difficulty === DIFFICULTIES.MEDIUM ? 200 : 0))}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    initializeCards();
                                    setHasStarted(false);
                                }}
                            >
                                Play Again
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const nextDiff = difficulty === DIFFICULTIES.EASY 
                                        ? DIFFICULTIES.MEDIUM 
                                        : difficulty === DIFFICULTIES.MEDIUM 
                                        ? DIFFICULTIES.HARD 
                                        : DIFFICULTIES.EASY;
                                    setDifficulty(nextDiff);
                                    setTimeout(() => {
                                        initializeCards();
                                        setHasStarted(false);
                                    }, 100);
                                }}
                            >
                                Next Difficulty
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay for win modal */}
            {isComplete && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}
        </>
    );
};

export default MemoryGame;
