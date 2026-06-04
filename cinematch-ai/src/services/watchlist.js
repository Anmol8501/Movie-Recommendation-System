/**
 * LocalStorage manager for watchlist, watch history, and analytics stats
 */

const WATCHLIST_KEY = 'cinematch_watchlist';
const HISTORY_KEY = 'cinematch_history';

/**
 * Fetch all items in the watchlist
 * @returns {Array}
 */
export const getWatchlist = () => {
  try {
    const list = localStorage.getItem(WATCHLIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error('Error reading watchlist from localStorage:', e);
    return [];
  }
};

/**
 * Add a movie to the watchlist
 * @param {object} movie 
 */
export const addToWatchlist = (movie) => {
  if (!movie || (!movie.id && !movie.title)) return;
  try {
    const list = getWatchlist();
    // Prevent duplicate entries by checking ID or Title
    const exists = list.some(item => 
      (movie.id && item.id === movie.id) || 
      (item.title.toLowerCase() === movie.title.toLowerCase())
    );
    if (!exists) {
      const updated = [...list, { ...movie, dateAdded: new Date().toISOString() }];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error adding to watchlist:', e);
  }
};

/**
 * Remove a movie from the watchlist by ID or Title
 * @param {string|number} idOrTitle 
 */
export const removeFromWatchlist = (idOrTitle) => {
  if (!idOrTitle) return;
  try {
    const list = getWatchlist();
    const updated = list.filter(item => {
      const matchId = item.id && (item.id === idOrTitle || item.id.toString() === idOrTitle.toString());
      const matchTitle = item.title && item.title.toLowerCase() === idOrTitle.toString().toLowerCase();
      return !matchId && !matchTitle;
    });
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error removing from watchlist:', e);
  }
};

/**
 * Check if a movie is in the watchlist
 * @param {string|number} id - TMDB movie ID
 * @param {string} [title] - Movie Title
 * @returns {boolean}
 */
export const isInWatchlist = (id, title = '') => {
  const list = getWatchlist();
  return list.some(item => 
    (id && item.id === id) || 
    (id && item.id?.toString() === id.toString()) ||
    (title && item.title?.toLowerCase() === title.toLowerCase())
  );
};

/**
 * Clear the watchlist completely
 */
export const clearWatchlist = () => {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Error clearing watchlist:', e);
  }
};

/**
 * Retrieve user's search / mood queries history
 * @returns {Array}
 */
export const getWatchHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error('Error reading history from localStorage:', e);
    return [];
  }
};

/**
 * Log a query to search history
 * @param {string} query 
 */
export const addToHistory = (query) => {
  if (!query || !query.trim()) return;
  try {
    let history = getWatchHistory();
    // Remove if query already exists (so it can be bumped to top)
    history = history.filter(q => q.toLowerCase() !== query.trim().toLowerCase());
    
    // Add to beginning of array
    history.unshift(query.trim());
    
    // Cap at 10 items
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving query history:', e);
  }
};

/**
 * Compiles user profile statistics from their watchlist
 * @returns {object} { totalSaved, topGenre, avgRating, oldestSaved }
 */
export const getStats = () => {
  const list = getWatchlist();
  
  if (list.length === 0) {
    return {
      totalSaved: 0,
      topGenre: 'None',
      avgRating: '0.0',
      oldestSaved: 'N/A'
    };
  }

  // Calculate Average Rating
  let ratingCount = 0;
  const ratingSum = list.reduce((sum, movie) => {
    const val = parseFloat(movie.rating || movie.vote_average);
    if (!isNaN(val) && val > 0) {
      ratingCount++;
      return sum + val;
    }
    return sum;
  }, 0);
  const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';

  // Calculate Top Genre
  const genreCounts = {};
  list.forEach(movie => {
    // Check if genres array is available, else check singular genre string
    const genresList = movie.genres || (movie.genre ? [movie.genre] : []);
    genresList.forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });
  
  let topGenre = 'None';
  let maxCount = 0;
  Object.entries(genreCounts).forEach(([genre, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topGenre = genre;
    }
  });

  // Calculate Oldest Saved Release Year
  let oldestYear = Infinity;
  list.forEach(movie => {
    const dateStr = movie.release_date || movie.year;
    if (dateStr) {
      // Parse year
      const year = parseInt(dateStr.toString().substring(0, 4));
      if (!isNaN(year) && year < oldestYear) {
        oldestYear = year;
      }
    }
  });
  const oldestSaved = oldestYear === Infinity ? 'N/A' : oldestYear.toString();

  return {
    totalSaved: list.length,
    topGenre,
    avgRating,
    oldestSaved
  };
};

export default {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  clearWatchlist,
  getWatchHistory,
  addToHistory,
  getStats
};
