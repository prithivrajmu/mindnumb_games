// Game Registry - Add new games here
import SudokuGame from './sudoku/SudokuGame';
import GravityGame from './gravity/GravityGame';
import MemoryGame from './memory/MemoryGame';

const GAMES = [
    {
        id: 'sudoku',
        name: 'Mini Sudoku',
        icon: '🧩',
        description: 'Classic 6x6 Sudoku puzzle',
        component: SudokuGame
    },
    {
        id: 'gravity',
        name: 'Gravity Drop',
        icon: '🎯',
        description: 'Physics-based puzzle game',
        component: GravityGame
    },
    {
        id: 'memory',
        name: 'Memory Match',
        icon: '🧠',
        description: 'Match pairs of cards',
        component: MemoryGame
    }
];

export const getGame = (id) => GAMES.find(g => g.id === id);
export const getAllGames = () => GAMES;
export { GAMES };
