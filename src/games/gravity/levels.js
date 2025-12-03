// Level definitions for Gravity Drop
// Each level has objects, goals, and constraints

export const LEVELS = [
    // Level 1: Tutorial - Simple Drop
    {
        id: 1,
        name: "First Drop",
        difficulty: "easy",
        par: 1, // Target number of drops
        gravity: { x: 0, y: 1 },
        objects: [
            // Static platforms
            { type: 'rectangle', x: 400, y: 550, width: 600, height: 20, isStatic: true, color: '#4a5568' },
            { type: 'rectangle', x: 200, y: 400, width: 200, height: 20, isStatic: true, color: '#4a5568' },
        ],
        goal: {
            type: 'zone',
            x: 650,
            y: 500,
            width: 100,
            height: 50,
            color: '#48bb78'
        },
        spawnPoint: { x: 150, y: 100 },
        availableObjects: [
            { type: 'circle', radius: 20, color: '#f56565' }
        ]
    },

    // Level 2: Ramp Challenge
    {
        id: 2,
        name: "Roll Down",
        difficulty: "easy",
        par: 2,
        gravity: { x: 0, y: 1 },
        objects: [
            { type: 'rectangle', x: 400, y: 550, width: 800, height: 20, isStatic: true, color: '#4a5568' },
            { type: 'rectangle', x: 200, y: 350, width: 300, height: 20, isStatic: true, angle: 0.3, color: '#4a5568' },
            { type: 'rectangle', x: 500, y: 250, width: 200, height: 20, isStatic: true, color: '#4a5568' },
        ],
        goal: {
            type: 'zone',
            x: 650,
            y: 500,
            width: 100,
            height: 50,
            color: '#48bb78'
        },
        spawnPoint: { x: 100, y: 100 },
        availableObjects: [
            { type: 'circle', radius: 20, color: '#f56565' },
            { type: 'rectangle', width: 40, height: 40, color: '#4299e1' }
        ]
    },

    // Level 3: Stack and Reach
    {
        id: 3,
        name: "Stack High",
        difficulty: "medium",
        par: 3,
        gravity: { x: 0, y: 1 },
        objects: [
            { type: 'rectangle', x: 400, y: 550, width: 800, height: 20, isStatic: true, color: '#4a5568' },
            { type: 'rectangle', x: 200, y: 300, width: 150, height: 20, isStatic: true, color: '#4a5568' },
            { type: 'rectangle', x: 600, y: 450, width: 150, height: 20, isStatic: true, color: '#4a5568' },
        ],
        goal: {
            type: 'zone',
            x: 600,
            y: 200,
            width: 100,
            height: 50,
            color: '#48bb78'
        },
        spawnPoint: { x: 200, y: 100 },
        availableObjects: [
            { type: 'rectangle', width: 60, height: 30, color: '#4299e1' },
            { type: 'circle', radius: 15, color: '#f56565' }
        ]
    }
];

export const getDailyLevel = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const levelIndex = dayOfYear % LEVELS.length;
    return LEVELS[levelIndex];
};

export const getLevel = (levelId) => {
    return LEVELS.find(l => l.id === levelId) || LEVELS[0];
};
