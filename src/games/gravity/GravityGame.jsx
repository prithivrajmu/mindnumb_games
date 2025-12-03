import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PhysicsEngine } from './physicsEngine';
import { LEVELS, getLevel } from './levels';
import { storage } from '../../services/storage';
import Leaderboard from '../../components/Leaderboard';

const GravityGame = () => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const animationRef = useRef(null);

    const [currentLevel, setCurrentLevel] = useState(1);
    const [levelData, setLevelData] = useState(null);
    const [dropsUsed, setDropsUsed] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [goalBody, setGoalBody] = useState(null);

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load level
    useEffect(() => {
        const level = getLevel(currentLevel);
        setLevelData(level);
        setDropsUsed(0);
        setIsWon(false);
        setTimer(0);
        setHasStarted(false);
    }, [currentLevel]);

    // Initialize physics engine
    useEffect(() => {
        if (!levelData || !canvasRef.current) return;

        const engine = new PhysicsEngine(CANVAS_WIDTH, CANVAS_HEIGHT, levelData.gravity);
        engineRef.current = engine;

        // Add level objects
        levelData.objects.forEach(obj => {
            engine.addBody(obj);
        });

        // Create goal zone (sensor)
        const goal = engine.addBody({
            type: 'rectangle',
            x: levelData.goal.x,
            y: levelData.goal.y,
            width: levelData.goal.width,
            height: levelData.goal.height,
            isStatic: true,
            color: levelData.goal.color,
            label: 'goal'
        });
        setGoalBody(goal);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (engineRef.current) {
                engineRef.current.reset();
            }
        };
    }, [levelData]);

    // Timer
    useEffect(() => {
        let interval = null;
        if (isActive && !isWon && hasStarted) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isWon, hasStarted]);

    // Game loop
    useEffect(() => {
        if (!engineRef.current || !canvasRef.current || !hasStarted) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const engine = engineRef.current;

        // Get computed background color from document
        const bgColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--bg-primary').trim() || '#0f172a';

        const render = () => {
            // Clear canvas with actual color
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw all bodies
            engine.getAllBodies().forEach(body => {
                ctx.save();
                ctx.translate(body.position.x, body.position.y);
                ctx.rotate(body.angle);

                // Get color from body render property
                ctx.fillStyle = body.render.fillStyle;

                // Make goal semi-transparent
                if (body.label === 'goal') {
                    ctx.globalAlpha = 0.3;
                } else {
                    ctx.globalAlpha = 1.0;
                }

                if (body.circleRadius) {
                    // Circle
                    ctx.beginPath();
                    ctx.arc(0, 0, body.circleRadius, 0, Math.PI * 2);
                    ctx.fill();

                    // Add stroke for visibility
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    // Rectangle
                    const vertices = body.vertices;
                    ctx.beginPath();
                    ctx.moveTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
                    for (let i = 1; i < vertices.length; i++) {
                        ctx.lineTo(vertices[i].x - body.position.x, vertices[i].y - body.position.y);
                    }
                    ctx.closePath();
                    ctx.fill();

                    // Add stroke for visibility
                    if (body.label !== 'goal') {
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }

                ctx.restore();
            });

            // Step physics
            engine.step();

            // Check win condition
            if (!isWon && goalBody) {
                const dynamicBodies = engine.getDynamicBodies();
                const bodyInGoal = dynamicBodies.some(body => {
                    return engine.isInBounds(body, {
                        x: levelData.goal.x - levelData.goal.width / 2,
                        y: levelData.goal.y - levelData.goal.height / 2,
                        width: levelData.goal.width,
                        height: levelData.goal.height
                    });
                });

                if (bodyInGoal && dynamicBodies.length > 0) {
                    handleWin();
                }
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [hasStarted, isWon, goalBody, levelData]);

    const handleCanvasClick = (e) => {
        if (!hasStarted || isWon || !engineRef.current || !levelData) return;
        if (dropsUsed >= levelData.par) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Drop object at click position
        const objType = levelData.availableObjects[dropsUsed % levelData.availableObjects.length];
        engineRef.current.addBody({
            ...objType,
            x,
            y,
            isStatic: false
        });

        setDropsUsed(d => d + 1);
        if (!isActive) setIsActive(true);
    };

    const handleWin = async () => {
        setIsWon(true);
        setIsActive(false);

        confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 }
        });

        // Calculate score
        const parBonus = dropsUsed <= levelData.par ? 300 : 0;
        const timeBonus = Math.max(0, 100 - timer);
        const score = 1000 + parBonus + timeBonus - (dropsUsed * 50);

        let playerName = localStorage.getItem('mng_player_name') || 'Anonymous';

        await storage.saveScore('gravity', {
            name: playerName,
            date: new Date().toISOString(),
            score,
            level: currentLevel,
            drops: dropsUsed,
            time: timer
        });
    };

    const startGame = () => {
        setHasStarted(true);
    };

    const nextLevel = () => {
        if (currentLevel < LEVELS.length) {
            setCurrentLevel(c => c + 1);
        } else {
            setCurrentLevel(1);
        }
    };

    const resetLevel = () => {
        setCurrentLevel(c => c); // Triggers re-render
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!levelData) return <div className="flex-center" style={{ height: '100%' }}>Loading...</div>;

    // Start Screen
    if (!hasStarted) {
        return (
            <div className="gravity-container" style={{ maxWidth: isMobile ? '100%' : '900px', margin: '0 auto' }}>
                <div className="card" style={{ marginBottom: '1rem', padding: isMobile ? '1rem' : '1.5rem', opacity: 0.5 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Level</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentLevel}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Par</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--warning)' }}>{levelData.par}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>0:00</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{
                    padding: '2rem',
                    textAlign: 'center',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        {levelData.name}
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Drop objects to reach the green goal zone. Par: {levelData.par} drops
                    </p>
                    <button
                        className="btn-primary"
                        onClick={startGame}
                        style={{ padding: '1.25rem 3rem', fontSize: '1.5rem', fontWeight: 'bold' }}
                    >
                        ▶ Start Level
                    </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="btn-secondary" onClick={() => setShowLeaderboard(true)}>
                        🏆 View Leaderboard
                    </button>
                </div>

                {showLeaderboard && (
                    <Leaderboard gameId="gravity" onClose={() => setShowLeaderboard(false)} />
                )}
            </div>
        );
    }

    return (
        <div className="gravity-container" style={{ maxWidth: isMobile ? '100%' : '900px', margin: '0 auto' }}>
            {/* Stats */}
            <div className="card" style={{ marginBottom: '1rem', padding: isMobile ? '1rem' : '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Level</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentLevel}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Drops</div>
                        <div style={{ fontWeight: 'bold', color: dropsUsed > levelData.par ? 'var(--error)' : 'var(--success)' }}>
                            {dropsUsed}/{levelData.par}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{formatTime(timer)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Name</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{levelData.name}</div>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onClick={handleCanvasClick}
                    style={{
                        border: '2px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: dropsUsed < levelData.par && !isWon ? 'crosshair' : 'default',
                        maxWidth: '100%',
                        height: 'auto'
                    }}
                />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button className="btn-secondary" onClick={resetLevel} disabled={isWon}>
                    🔄 Reset
                </button>
                <button className="btn-secondary" onClick={() => setShowLeaderboard(true)}>
                    🏆 Leaderboard
                </button>
            </div>

            {showLeaderboard && (
                <Leaderboard gameId="gravity" onClose={() => setShowLeaderboard(false)} />
            )}

            {/* Win Modal */}
            {isWon && (
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
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Drops: {dropsUsed} {dropsUsed <= levelData.par ? '⭐' : ''}
                    </p>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                        Time: {formatTime(timer)}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={resetLevel}>
                            Replay
                        </button>
                        <button className="btn-primary" onClick={nextLevel}>
                            {currentLevel < LEVELS.length ? 'Next Level' : 'Level 1'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GravityGame;
