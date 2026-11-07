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

// Count solutions (stops at `limit`) so puzzles can be kept uniquely solvable
const countSolutions = (board, limit = 2) => {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col] !== EMPTY) continue;
            let n = 0;
            for (let num = 1; num <= GRID_SIZE && n < limit; num++) {
                if (isValid(board, row, col, num)) {
                    board[row][col] = num;
                    n += countSolutions(board, limit - n);
                    board[row][col] = EMPTY;
                }
            }
            return n;
        }
    }
    return 1;
};

// Generate a new game
export const generateGame = (difficulty = DIFFICULTY.EASY) => {
    // 1. Solve an empty board with the randomized solver
    const fullBoard = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY));
    solveBoard(fullBoard);

    // 2. Remove cells in random order, keeping the solution unique
    // (otherwise a valid but "different" fill would be rejected as wrong).
    // Very hard targets may keep a few extra clues if uniqueness would break.
    const puzzle = fullBoard.map(row => [...row]);
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) cells.push([r, c]);
    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    let clues = GRID_SIZE * GRID_SIZE;
    for (const [r, c] of cells) {
        if (clues <= difficulty) break;
        const keep = puzzle[r][c];
        puzzle[r][c] = EMPTY;
        if (countSolutions(puzzle.map(row => [...row])) === 1) clues--;
        else puzzle[r][c] = keep;
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

// Get Hint
export const getHint = (currentGrid, solutionGrid) => {
    // 1. Check for mistakes (filled cells that don't match solution)
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (currentGrid[r][c] !== EMPTY && currentGrid[r][c] !== solutionGrid[r][c]) {
                return {
                    type: 'correction',
                    row: r,
                    col: c,
                    value: solutionGrid[r][c],
                    message: 'Correction: This cell has the wrong number.'
                };
            }
        }
    }

    // 2. If no mistakes, reveal a random empty cell
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (currentGrid[r][c] === EMPTY) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        return {
            type: 'reveal',
            row: randomCell.r,
            col: randomCell.c,
            value: solutionGrid[randomCell.r][randomCell.c],
            message: 'Hint: Here is a number for you.'
        };
    }

    return null; // Board is full/correct
};
