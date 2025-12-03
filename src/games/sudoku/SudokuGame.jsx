import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { generateGame, checkSolution, DIFFICULTY, getHint } from './sudokuLogic';
import { storage } from '../../services/storage';
import Leaderboard from '../../components/Leaderboard';

const SudokuGame = () => {
    const [gameData, setGameData] = useState(null);
    const [grid, setGrid] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null); // [row, col]
    const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY);
    const [isComplete, setIsComplete] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [history, setHistory] = useState([]); // Array of grid states

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
    }, [difficulty]);

    // Initial Load
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
        // Don't select pre-filled cells
        if (gameData.initial[row][col] !== 0) return;
        setSelectedCell([row, col]);
    };

    // Handle Number Input
    const handleNumberInput = async (num) => {
        if (!selectedCell || isComplete) return;
        const [r, c] = selectedCell;

        // Save to history before modifying
        setHistory(prev => [...prev, grid.map(row => [...row])]);

        // Update Grid
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = num;
        setGrid(newGrid);

        // Check if board is full
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

        // Celebration
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Save Score
        const score = Math.max(0, 1000 - (timer * 2) - (mistakes * 50) + (difficulty === DIFFICULTY.HARD ? 500 : difficulty === DIFFICULTY.MEDIUM ? 200 : 0));
        await storage.saveScore('sudoku', {
            date: new Date().toISOString(),
            score,
            difficulty: difficulty === DIFFICULTY.EASY ? 'Easy' : difficulty === DIFFICULTY.MEDIUM ? 'Medium' : 'Hard',
            time: timer
        });
    };

    // Undo
    const handleUndo = () => {
        if (history.length === 0 || isComplete) return;
        const previousGrid = history[history.length - 1];
        setGrid(previousGrid);
        setHistory(prev => prev.slice(0, -1));
    };

    // Reset
    const handleReset = () => {
        if (isComplete) return;
        if (window.confirm('Are you sure you want to reset the board?')) {
            setGrid(gameData.initial.map(row => [...row]));
            setHistory([]);
            setMistakes(0);
            setTimer(0); // Optional: reset timer or keep it running? Usually reset for full restart.
        }
    };

    // Hint
    const handleHint = () => {
        if (isComplete) return;
        const hint = getHint(grid, gameData.solution);
        if (hint) {
            // Save history
            setHistory(prev => [...prev, grid.map(row => [...row])]);

            // Apply hint
            const newGrid = grid.map(row => [...row]);
            newGrid[hint.row][hint.col] = hint.value;
            setGrid(newGrid);

            // Highlight/Select the hinted cell
            setSelectedCell([hint.row, hint.col]);

            // Penalty for using hint? (Optional, maybe reduce score)
            setTimer(t => t + 10); // Add 10 seconds penalty
        }
    };

    // Keyboard Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedCell) return;

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
    }, [selectedCell, grid, isComplete, history]);

    // Format Time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Render
    if (!gameData) return <div className="flex-center" style={{ height: '100%' }}>Loading...</div>;

    return (
        <div className="sudoku-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <div>Difficulty: <span style={{ color: 'var(--text-primary)' }}>{difficulty === DIFFICULTY.EASY ? 'Easy' : difficulty === DIFFICULTY.MEDIUM ? 'Medium' : 'Hard'}</span></div>
                <div>Time: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{formatTime(timer)}</span></div>
                <div>Mistakes: <span style={{ color: 'var(--error)' }}>{mistakes}</span></div>
            </div>

            {/* Grid */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', aspectRatio: '1', marginBottom: '2rem' }}>
                {grid.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                        const isInitial = gameData.initial[rIndex][cIndex] !== 0;
                        const isSelected = selectedCell && selectedCell[0] === rIndex && selectedCell[1] === cIndex;

                        // Border logic for 2x3 boxes
                        const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 5 ? '2px solid rgba(255,255,255,0.2)' : 'none';
                        const borderBottom = (rIndex + 1) % 2 === 0 && rIndex !== 5 ? '2px solid rgba(255,255,255,0.2)' : 'none';

                        return (
                            <div
                                key={`${rIndex}-${cIndex}`}
                                onClick={() => handleCellClick(rIndex, cIndex)}
                                className="flex-center"
                                style={{
                                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : isInitial ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                                    color: isInitial ? 'var(--text-secondary)' : 'var(--accent-primary)',
                                    fontSize: '1.5rem',
                                    fontWeight: isInitial ? 'normal' : 'bold',
                                    cursor: isInitial ? 'default' : 'pointer',
                                    borderRadius: '4px',
                                    borderRight,
                                    borderBottom,
                                    transition: 'background 0.2s'
                                }}
                            >
                                {cell !== 0 ? cell : ''}
                            </div>
                        );
                    })
                ))}
            </div>

            {/* Game Controls (Undo, Reset, Hint) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className="btn-secondary" onClick={handleUndo} disabled={history.length === 0 || isComplete} title="Undo">
                    ↩ Undo
                </button>
                <button className="btn-secondary" onClick={handleHint} disabled={isComplete} title="Get a Hint (+10s penalty)">
                    💡 Hint
                </button>
                <button className="btn-secondary" onClick={handleReset} disabled={isComplete} title="Reset Board">
                    🔄 Reset
                </button>
            </div>

            {/* Number Pad */}
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

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <button className="btn-secondary" onClick={() => setShowLeaderboard(true)}>
                    🏆 View Leaderboard
                </button>
            </div>

            {showLeaderboard && (
                <Leaderboard gameId="sudoku" onClose={() => setShowLeaderboard(false)} />
            )}

            {/* Win State / Next Level */}
            {isComplete && (
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: '400px', zIndex: 10 }}>
                    <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Level Complete!</h2>
                    <p style={{ marginBottom: '2rem' }}>Score: {Math.max(0, 1000 - (timer * 2) - (mistakes * 50) + (difficulty === DIFFICULTY.HARD ? 500 : difficulty === DIFFICULTY.MEDIUM ? 200 : 0))}</p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
                            Next Level (Tougher)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SudokuGame;
