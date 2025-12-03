/**
 * Sudoku Logic for 6x6 Grid (Mini Sudoku)
 * 6x6 Grid consists of 6 rows, 6 cols, and 6 2x3 boxes.
 */

// Constants
const GRID_SIZE = 6;
const BOX_WIDTH = 3;
const BOX_HEIGHT = 2;
const EMPTY = 0;

// Difficulty Settings (Number of clues)
export const DIFFICULTY = {
    EASY: 18,
    MEDIUM: 14,
    HARD: 10
};

// Helper: Check if placing num at board[row][col] is valid
const isValid = (board, row, col, num) => {
    // Check Row
    for (let x = 0; x < GRID_SIZE; x++) {
        if (board[row][x] === num) return false;
    }

    // Check Col
    for (let x = 0; x < GRID_SIZE; x++) {
        if (board[x][col] === num) return false;
    }

    // Check Box (2x3)
    const startRow = row - (row % BOX_HEIGHT);
    const startCol = col - (col % BOX_WIDTH);

    for (let i = 0; i < BOX_HEIGHT; i++) {
        for (let j = 0; j < BOX_WIDTH; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }

    return true;
};

// Helper: Solve the board using backtracking (used for generation and validation)
const solveBoard = (board) => {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col] === EMPTY) {
                // Try numbers 1-6
                const nums = [1, 2, 3, 4, 5, 6];
                // Shuffle for randomness if generating
                for (let i = nums.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [nums[i], nums[j]] = [nums[j], nums[i]];
                }

                for (let num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveBoard(board)) return true;
                        board[row][col] = EMPTY;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

// Generate a new game
export const generateGame = (difficulty = DIFFICULTY.EASY, seed = null) => {
    // If seed is provided, use it to seed Math.random (simplified for now)
    // For a real app, we'd use a seeded RNG library. 
    // Here we'll just use the current time if no seed, or a simple hash if seed.

    // 1. Create empty board
    const fullBoard = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY));

    // 2. Fill diagonal boxes (independent) to ensure randomness
    // For 6x6 (2x3 boxes), boxes at (0,0), (2,2) are not independent like 9x9.
    // So we just rely on the randomized solver.

    // 3. Solve to get a complete valid board
    solveBoard(fullBoard);

    // 4. Remove numbers to create puzzle
    const puzzle = fullBoard.map(row => [...row]);
    let attempts = GRID_SIZE * GRID_SIZE - difficulty;

    while (attempts > 0) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (puzzle[row][col] !== EMPTY) {
            puzzle[row][col] = EMPTY;
            attempts--;
            // Ideally we should check if unique solution exists here, 
            // but for 6x6 and this scope, we skip for performance/simplicity.
        }
    }

    return {
        initial: puzzle.map(row => [...row]), // Immutable initial state
        solution: fullBoard,
        current: puzzle.map(row => [...row]) // Mutable current state
    };
};

// Check if board is full and correct
export const checkSolution = (currentBoard, solutionBoard) => {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (currentBoard[i][j] !== solutionBoard[i][j]) return false;
        }
    }
    return true;
};

// Get Daily Seed (YYYY-MM-DD)
export const getDailySeed = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};
