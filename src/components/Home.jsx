import { getAllGames } from '../games/registry';

const Home = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Pick a game</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Small games for short focus breaks.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
            {getAllGames().map(game => (
                <a key={game.id} href={`#${game.id}`} className="card"
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', minHeight: '44px' }}>
                    <span style={{ fontSize: '2rem' }}>{game.icon}</span>
                    <span>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{game.name}</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{game.description}</span>
                    </span>
                </a>
            ))}
        </div>
    </div>
);

export default Home;
