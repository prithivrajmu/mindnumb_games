import SudokuGame from './sudoku/SudokuGame';

export const GAMES = {
    sudoku: {
        id: 'sudoku',
        name: 'Mini Sudoku',
        description: 'A 6x6 Sudoku puzzle. Perfect for a quick mental workout.',
        component: SudokuGame,
        icon: '🧩' // Placeholder icon
    },
    // Future games can be added here
    // zipline: { ... }
};

export const getGame = (id) => GAMES[id];
export const getAllGames = () => Object.values(GAMES);
