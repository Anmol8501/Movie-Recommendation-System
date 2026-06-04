import { useState, useEffect, useCallback } from 'react';
import watchlistService from '../services/watchlist';

const WATCHLIST_EVENT = 'watchlist-updated';

/**
 * Custom React Hook to sync and manage the user's watchlist with localStorage.
 * Uses window events to sync state updates across disparate components.
 */
export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(() => watchlistService.getWatchlist());
  const [stats, setStats] = useState(() => watchlistService.getStats());

  // Helper to trigger re-renders everywhere
  const syncWatchlist = useCallback(() => {
    const list = watchlistService.getWatchlist();
    setWatchlist(list);
    setStats(watchlistService.getStats());
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    window.addEventListener(WATCHLIST_EVENT, syncWatchlist);
    return () => {
      window.removeEventListener(WATCHLIST_EVENT, syncWatchlist);
    };
  }, [syncWatchlist]);

  // Dispatch event after mutations to keep other components in sync
  const dispatchSync = () => {
    window.dispatchEvent(new CustomEvent(WATCHLIST_EVENT));
  };

  const add = useCallback((movie) => {
    watchlistService.addToWatchlist(movie);
    syncWatchlist();
    dispatchSync();
  }, [syncWatchlist]);

  const remove = useCallback((idOrTitle) => {
    watchlistService.removeFromWatchlist(idOrTitle);
    syncWatchlist();
    dispatchSync();
  }, [syncWatchlist]);

  const toggle = useCallback((movie) => {
    if (!movie) return;
    const movieIdentifier = movie.id || movie.title;
    const isSaved = watchlistService.isInWatchlist(movie.id, movie.title);
    
    if (isSaved) {
      watchlistService.removeFromWatchlist(movieIdentifier);
    } else {
      watchlistService.addToWatchlist(movie);
    }
    syncWatchlist();
    dispatchSync();
  }, [syncWatchlist]);

  const isSaved = useCallback((id, title = '') => {
    return watchlistService.isInWatchlist(id, title);
  }, []);

  return {
    watchlist,
    stats,
    count: watchlist.length,
    add,
    remove,
    toggle,
    isSaved
  };
};

export default useWatchlist;
