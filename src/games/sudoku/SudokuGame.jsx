import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { generateGame, checkSolution, DIFFICULTY, getHint } from './sudokuLogic';
import { storage } from '../../services/storage';
import Leaderboard from '../../components/Leaderboard';

const SudokuGame = () => {
    const [gameData, setGameData] = useState(null);
    const [grid, setGrid] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY);
    const [isComplete, setIsComplete] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [history, setHistory] = useState([]);
    const [showNumberPad, setShowNumberPad] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [hintsUsed, setHintsUsed] = useState(0);
    const MAX_HINTS = 3;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize Game
    const startNewGame = useCallback((diff = difficulty) => {
        const newGame = generateGame(diff);
        setGameData(newGame);
        setGrid(newGame.current);
        setIsComplete(false);
        setTimer(0);
        setIsActive(true);
        setMistakes(0);
        setSelectedCell(null);
        setHistory([]);
        setShowNumberPad(false);
        setHintsUsed(0);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, []);

    // Timer
    useEffect(() => {
        let interval = null;
        if (isActive && !isComplete) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isComplete]);

    // Handle Cell Click
    const handleCellClick = (row, col) => {
        if (isComplete) return;
        if (gameData.initial[row][col] !== 0) return;
        setSelectedCell([row, col]);
        if (isMobile) {
            setShowNumberPad(true);
        }
    };

    // Handle Number Input
    const handleNumberInput = async (num) => {
        if (!selectedCell || isComplete) return;
        const [r, c] = selectedCell;

        setHistory(prev => [...prev, grid.map(row => [...row])]);

        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = num;
        setGrid(newGrid);

        if (isMobile && num !== 0) {
            setShowNumberPad(false);
        }

        let isFull = true;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                if (newGrid[i][j] === 0) {
                    isFull = false;
                    break;
                }
            }
        }

        if (isFull) {
            if (checkSolution(newGrid, gameData.solution)) {
                handleWin();
            } else {
                setMistakes(m => m + 1);
            }
        }
    };

    const handleWin = async () => {
        setIsComplete(true);
        setIsActive(false);

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Prompt for player name
        let playerName = localStorage.getItem('mng_player_name');
        if (!playerName) {
            playerName = prompt('🎉 Congratulations! Enter your name for the leaderboard:', '');
            if (playerName && playerName.trim()) {
                playerName = playerName.trim().substring(0, 20); // Limit to 20 chars
                localStorage.setItem('mng_player_name', playerName);
            } else {
                playerName = 'Anonymous';
            }
        }

        // Calculate score with hint penalty
        const baseScore = 1000 - (timer * 2) - (mistakes * 50);
        const difficultyBonus = difficulty === DIFFICULTY.HARD ? 500 : difficulty === DIFFICULTY.MEDIUM ? 200 : 0;
        const hintPenalty = hintsUsed * 100; // 100 points per hint
        const score = Math.max(0, baseScore + difficultyBonus - hintPenalty);

        await storage.saveScore('sudoku', {
            name: playerName,
            date: new Date().toISOString(),
            score,
            difficulty: difficulty === DIFFICULTY.EASY ? 'Easy' : difficulty === DIFFICULTY.MEDIUM ? 'Medium' : 'Hard',
            time: timer,
            hintsUsed
        });
    };

    const handleUndo = () => {
        if (history.length === 0 || isComplete) return;
        const previousGrid = history[history.length - 1];
        setGrid(previousGrid);
        setHistory(prev => prev.slice(0, -1));
    };

    const handleReset = () => {
        if (isComplete) return;
        if (window.confirm('Are you sure you want to reset the board?')) {
            setGrid(gameData.initial.map(row => [...row]));
            setHistory([]);
            setMistakes(0);
            setTimer(0);
        }
    };

    const handleHint = () => {
        if (isComplete) return;
        if (hintsUsed >= MAX_HINTS) {
            alert(`You've used all ${MAX_HINTS} hints for this game!`);
            return;
        }

        const hint = getHint(grid, gameData.solution);
        if (hint) {
            setHistory(prev => [...prev, grid.map(row => [...row])]);

            const newGrid = grid.map(row => [...row]);
            newGrid[hint.row][hint.col] = hint.value;
            setGrid(newGrid);

            setSelectedCell([hint.row, hint.col]);
            setHintsUsed(prev => prev + 1);

            // Show feedback
            if (hint.type === 'correction') {
                // Briefly highlight the corrected cell
                setTimeout(() => setSelectedCell(null), 1500);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedCell || isMobile) return;

            const num = parseInt(e.key);
            if (num >= 1 && num <= 6) {
                handleNumberInput(num);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleNumberInput(0);
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                handleUndo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, grid, isComplete, history, isMobile]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!gameData) return <div className="flex-center" style={{ height: '100%' }}>Loading...</div>;

    return (
        <>
            <div className="sudoku-container" style={{ maxWidth: isMobile ? '100%' : '600px', margin: '0 auto' }}>
                {/* Header Info */}
                <div className="card" style={{ marginBottom: '1rem', padding: isMobile ? '1rem' : '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Difficulty</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                                {difficulty === DIFFICULTY.EASY ? 'Easy' : difficulty === DIFFICULTY.MEDIUM ? 'Medium' : 'Hard'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: isMobile ? '0.875rem' : '1rem' }}>{formatTime(timer)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Mistakes</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--error)', fontSize: isMobile ? '0.875rem' : '1rem' }}>{mistakes}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hints</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--warning)', fontSize: isMobile ? '0.875rem' : '1rem' }}>{MAX_HINTS - hintsUsed}</div>
                        </div>
                    </div>
                </div>
                {/* Grid */}
                <div className="glass-panel sudoku-grid" style={{
                    padding: isMobile ? '0.5rem' : '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: isMobile ? '2px' : '4px',
                    aspectRatio: '1',
                    marginBottom: '1rem',
                    maxWidth: isMobile ? '100%' : '500px',
                    margin: '0 auto 1rem'
                }}>
                    {grid.map((row, rIndex) => (
                        row.map((cell, cIndex) => {
                            const isInitial = gameData.initial[rIndex][cIndex] !== 0;
                            const isSelected = selectedCell && selectedCell[0] === rIndex && selectedCell[1] === cIndex;

                            const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 5 ? '2px solid var(--grid-line)' : 'none';
                            const borderBottom = (rIndex + 1) % 2 === 0 && rIndex !== 5 ? '2px solid var(--grid-line)' : 'none';

                            return (
                                <div
                                    key={`${rIndex}-${cIndex}`}
                                    onClick={() => handleCellClick(rIndex, cIndex)}
                                    className="flex-center"
                                    style={{
                                        background: isSelected ? 'var(--cell-bg-selected)' : isInitial ? 'var(--cell-bg-initial)' : 'transparent',
                                        color: isInitial ? 'var(--text-secondary)' : 'var(--accent-primary)',
                                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                                        fontWeight: isInitial ? 'normal' : 'bold',
                                        cursor: isInitial ? 'default' : 'pointer',
                                        borderRadius: '4px',
                                        borderRight,
                                        borderBottom,
                                        transition: 'background 0.2s',
                                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid transparent',
                                        minHeight: isMobile ? '44px' : 'auto'
                                    }}
                                >
                                    {cell !== 0 ? cell : ''}
                                </div>
                            );
                        })
                    ))}
                </div>

                {/* Desktop Controls */}
                {!isMobile && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button className="btn-secondary" onClick={handleUndo} disabled={history.length === 0 || isComplete} title="Undo">
                                ↩ Undo
                            </button>
                            <button className="btn-secondary" onClick={handleHint} disabled={isComplete || hintsUsed >= MAX_HINTS} title={`Get a Hint (-100 pts, ${MAX_HINTS - hintsUsed} left)`}>
                                💡 Hint ({MAX_HINTS - hintsUsed})
                            </button>
                            <button className="btn-secondary" onClick={handleReset} disabled={isComplete} title="Reset Board">
                                🔄 Reset
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <button
                                    key={num}
                                    className="btn-secondary"
                                    onClick={() => handleNumberInput(num)}
                                    disabled={isComplete}
                                    style={{ padding: '1rem 0' }}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <div style={{ textAlign: 'center', marginBottom: isMobile ? '1rem' : '2rem' }}>
                    <button className="btn-secondary" onClick={() => setShowLeaderboard(true)}>
                        🏆 View Leaderboard
                    </button>
                </div>

                {showLeaderboard && (
                    <Leaderboard gameId="sudoku" onClose={() => setShowLeaderboard(false)} />
                )}

                {/* Win State */}
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
                        zIndex: 10,
                        background: 'var(--glass-bg)'
                    }}>
                        <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Level Complete!</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Score: {Math.max(0, 1000 - (timer * 2) - (mistakes * 50) + (difficulty === DIFFICULTY.HARD ? 500 : difficulty === DIFFICULTY.MEDIUM ? 200 : 0))}</p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => startNewGame(difficulty)}
                            >
                                Replay
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const nextDiff = difficulty === DIFFICULTY.EASY ? DIFFICULTY.MEDIUM : DIFFICULTY.HARD;
                                    setDifficulty(nextDiff);
                                    startNewGame(nextDiff);
                                }}
                            >
                                Next Level
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile FAB for Hint */}
            {isMobile && !isComplete && hintsUsed < MAX_HINTS && (
                <button className="fab" onClick={handleHint} title={`Hint (${MAX_HINTS - hintsUsed} left)`}>
                    💡
                </button>
            )}

            {/* Mobile Bottom Sheet Number Pad */}
            {isMobile && (
                <div className={`bottom-sheet ${showNumberPad ? 'open' : ''}`}>
                    <div className="bottom-sheet-handle" onClick={() => setShowNumberPad(false)}></div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Select Number</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <button
                                key={num}
                                className="btn-secondary"
                                onClick={() => handleNumberInput(num)}
                                style={{ padding: '1.5rem', fontSize: '1.5rem' }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <button className="btn-secondary" onClick={handleUndo} disabled={history.length === 0} style={{ padding: '0.75rem' }}>
                            ↩ Undo
                        </button>
                        <button className="btn-secondary" onClick={() => handleNumberInput(0)} style={{ padding: '0.75rem' }}>
                            ❌ Clear
                        </button>
                        <button className="btn-secondary" onClick={handleReset} style={{ padding: '0.75rem' }}>
                            🔄 Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay for bottom sheet */}
            {isMobile && showNumberPad && (
                <div
                    onClick={() => setShowNumberPad(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}
        </>
    );
};

export default SudokuGame;
