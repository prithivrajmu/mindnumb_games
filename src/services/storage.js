/**
 * Data Access Layer for Mind Numb Games
 * Abstracts the storage mechanism (currently localStorage)
 */

const STORAGE_KEYS = {
  LEADERBOARD: 'mng_leaderboard',
  SETTINGS: 'mng_settings',
  PROGRESS: 'mng_progress'
};

class StorageService {
  constructor() {
    this.type = 'local'; // Can be 'supabase', 'api', etc. in future
  }

  // Generic helper for local storage
  _getLocal(key, defaultVal = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      console.error('Storage Read Error:', e);
      return defaultVal;
    }
  }

  _setLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage Write Error:', e);
      return false;
    }
  }

  // Leaderboard Methods
  async getLeaderboard(gameId) {
    const allScores = this._getLocal(STORAGE_KEYS.LEADERBOARD, {});
    return allScores[gameId] || [];
  }

  async saveScore(gameId, entry) {
    // entry: { name, score, date, difficulty }
    const allScores = this._getLocal(STORAGE_KEYS.LEADERBOARD, {});
    const gameScores = allScores[gameId] || [];
    
    gameScores.push(entry);
    
    // Sort by score (descending) - adapt if lower is better for some games
    gameScores.sort((a, b) => b.score - a.score);
    
    // Keep top 10
    const top10 = gameScores.slice(0, 10);
    
    allScores[gameId] = top10;
    this._setLocal(STORAGE_KEYS.LEADERBOARD, allScores);
    
    return top10;
  }

  // Highest score ever saved for a game, or null
  async getBest(gameId) {
    const scores = await this.getLeaderboard(gameId);
    return scores.length ? scores[0].score : null;
  }

  // Progress/Save State Methods
  async saveProgress(gameId, state) {
    const allProgress = this._getLocal(STORAGE_KEYS.PROGRESS, {});
    allProgress[gameId] = {
      state,
      timestamp: new Date().toISOString()
    };
    this._setLocal(STORAGE_KEYS.PROGRESS, allProgress);
  }

  async getProgress(gameId) {
    const allProgress = this._getLocal(STORAGE_KEYS.PROGRESS, {});
    return allProgress[gameId] || null;
  }
}

export const storage = new StorageService();

// Player name used on the leaderboard; asked once, then remembered.
export const getPlayerName = () => {
  try {
    let name = localStorage.getItem('mng_player_name');
    if (!name) {
      name = (prompt('🎉 Enter your name for the leaderboard:', '') || '').trim().substring(0, 20);
      if (name) localStorage.setItem('mng_player_name', name);
    }
    return name || 'Anonymous';
  } catch {
    return 'Anonymous';
  }
};
