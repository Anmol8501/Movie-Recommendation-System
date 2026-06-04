import React from 'react';
import { Heart } from 'lucide-react';
import useWatchlist from '../hooks/useWatchlist';

/**
 * Reusable Watchlist toggle button rendering a heart icon
 */
export const WatchlistButton = ({ movie, className = '' }) => {
  const { isSaved, toggle } = useWatchlist();
  
  if (!movie) return null;
  const saved = isSaved(movie.id, movie.title);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card clicks or route navigations
    toggle(movie);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all duration-200 ${
        saved 
          ? 'bg-red hover:bg-red/80 text-white' 
          : 'bg-black/60 hover:bg-red text-white hover:scale-105 border border-white/20'
      } ${className}`}
      aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
      aria-pressed={saved}
    >
      <Heart className="w-4/5 h-4/5" fill={saved ? 'currentColor' : 'none'} size={16} />
    </button>
  );
};

export default WatchlistButton;
