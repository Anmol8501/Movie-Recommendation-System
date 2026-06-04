import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import tmdbService from '../services/tmdb';
import WatchlistButton from './WatchlistButton';
import { formatRating } from '../utils/helpers';

/**
 * Universal premium Movie Card used throughout the application.
 */
export const MovieCard = ({ 
  movie, 
  size = 'md', 
  showMatch = false, 
  showReasons = false, 
  onClick 
}) => {
  const navigate = useNavigate();

  const hasHttpUrl = (url) => url && (url.startsWith('http://') || url.startsWith('https://'));
  
  const getInitialPoster = () => {
    if (hasHttpUrl(movie.poster_url)) return movie.poster_url;
    if (hasHttpUrl(movie.poster_path)) return movie.poster_path;
    return '';
  };

  const [posterUrl, setPosterUrl] = useState(getInitialPoster());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fetchingPoster, setFetchingPoster] = useState(false);

  useEffect(() => {
    const initial = getInitialPoster();
    setPosterUrl(initial);
    setImageLoaded(false);
    setImageError(false);
    setFetchingPoster(false);

    if (initial) {
      return;
    }

    let active = true;
    const loadPoster = async () => {
      setFetchingPoster(true);
      try {
        const year = movie.year || (movie.release_date ? new Date(movie.release_date).getFullYear() : null);
        const resolvedUrl = await tmdbService.fetchPosterByTitle(movie.title, year);
        if (active) {
          if (resolvedUrl) {
            setPosterUrl(resolvedUrl);
          } else {
            setImageError(true);
          }
        }
      } catch (err) {
        console.error('Failed dynamic poster load inside MovieCard:', err);
        if (active) setImageError(true);
      } finally {
        if (active) setFetchingPoster(false);
      }
    };

    loadPoster();
    return () => {
      active = false;
    };
  }, [movie.title, movie.year, movie.poster_url, movie.poster_path]);

  if (!movie) return null;

  // Handle standard navigation if no custom onClick is supplied
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (movie.id) {
      navigate(`/movie/${movie.id}`);
      window.scrollTo(0, 0);
    } else {
      // Fallback if movie was custom generated without TMDB ID
      // We can search for it dynamically
      navigate(`/search?q=${encodeURIComponent(movie.title)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Dimensions classes
  const widthClasses = {
    sm: 'w-[130px] sm:w-[140px]',
    md: 'w-[190px]',
    lg: 'w-[240px]',
  };

  const textTruncateClass = size === 'sm' ? 'w-[120px] sm:w-[130px]' : 'w-full';

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleCardClick}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex-shrink-0 flex flex-col bg-card rounded-xl overflow-hidden border border-white/[0.04] hover:border-purple/30 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red ${widthClasses[size] || widthClasses.md}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-surface flex-shrink-0">
        
        {/* Match Score Badge (Top Right) */}
        {showMatch && movie.matchScore && (
          <span className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple to-red text-[10px] font-bold text-white px-2 py-0.5 rounded-full select-none shadow-md">
            {movie.matchScore}% Match
          </span>
        )}

        {/* Watchlist Heart Button (Top Left, invisible by default, visible on hover, or always visible if saved) */}
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <WatchlistButton movie={movie} />
        </div>

        {/* Shimmer state while fetching URL */}
        {(fetchingPoster || (posterUrl && !imageLoaded && !imageError)) && (
          <div className="absolute inset-0 shimmer bg-[#1a1a1a]" />
        )}

        {/* Poster Image or Placeholder */}
        {posterUrl && !imageError ? (
          <motion.img
            src={posterUrl}
            alt={`${movie.title} movie poster`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={imageLoaded ? { opacity: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? '' : 'absolute inset-0 opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f0f23] to-[#1a1a3e] flex flex-col items-center justify-center text-center p-3 select-none">
            {imageError ? (
              <img
                src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500"
                alt="Cinematic placeholder"
                className="w-full h-full object-cover absolute inset-0 opacity-80"
              />
            ) : null}
            <div className="relative z-10">
              <span className="text-3xl mb-1 block">🎬</span>
              <span className="text-[10px] text-muted-default font-medium uppercase tracking-wider px-2 line-clamp-2">
                {movie.title}
              </span>
            </div>
          </div>
        )}

        {/* Dark Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none select-none z-20">
          <span className="text-purple-300 text-[10px] font-bold tracking-wider uppercase mb-1">
            {movie.genre || movie.genres?.[0] || 'Movie'}
          </span>
          <h4 className="font-serif text-white font-bold leading-tight text-sm line-clamp-2 mb-1.5">
            {movie.title}
          </h4>
          {movie.overview && (
            <p className="text-[11px] text-white/70 line-clamp-3 leading-snug">
              {movie.overview}
            </p>
          )}
          <span className="mt-2 text-[10px] font-semibold text-red hover:underline self-start">
            View Details →
          </span>
        </div>
      </div>

      {/* Info Body below Poster (always visible) */}
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className={`font-body font-semibold text-white text-sm truncate leading-snug ${textTruncateClass}`}>
            {movie.title}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-muted mt-1 select-none">
            <span className="flex items-center gap-0.5 text-amber-500 font-medium">
              <Star size={11} fill="currentColor" className="flex-shrink-0" />
              {formatRating(movie.rating || movie.vote_average)}
            </span>
            <span>·</span>
            <span>{movie.year || (movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A')}</span>
            <span>·</span>
            <span className="truncate max-w-[50px]">{movie.genre || movie.genres?.[0] || 'Drama'}</span>
          </div>
        </div>

        {/* Reason Tags (optional AI feedback tags) */}
        {showReasons && movie.reasons && movie.reasons.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-white/[0.04] space-y-1 select-none">
            {movie.reasons.map((reason, index) => (
              <div 
                key={index} 
                className="text-[10px] text-purple-300/90 font-medium flex items-start gap-1 leading-normal"
              >
                <span className="text-purple flex-shrink-0 font-bold">✓</span>
                <span className="line-clamp-1">{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MovieCard;
