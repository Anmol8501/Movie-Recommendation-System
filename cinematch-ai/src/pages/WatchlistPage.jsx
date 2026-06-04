import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Film, Star, Calendar, RefreshCcw, Tag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWatchlist from '../hooks/useWatchlist';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { staggerContainerVariant, fadeUpVariant } from '../utils/animations';

export const WatchlistPage = () => {
  const navigate = useNavigate();
  const { watchlist, stats, remove, toggle, clearWatchlist } = useWatchlist();

  const [sortBy, setSortBy] = useState('dateAdded');
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Extract all unique genres present in the current watchlist for filter pills
  const availableGenres = useMemo(() => {
    const genresSet = new Set();
    watchlist.forEach(movie => {
      const genresList = movie.genres || (movie.genre ? [movie.genre] : []);
      genresList.forEach(g => {
        if (g) genresSet.add(g);
      });
    });
    return Array.from(genresSet);
  }, [watchlist]);

  // Handle multi-select genre filter toggle
  const toggleGenreFilter = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  // Filter and sort the watchlist data dynamically
  const processedWatchlist = useMemo(() => {
    let result = [...watchlist];

    // 1. Filter by selected genres (OR logic: movie must match at least one selected genre)
    if (selectedGenres.length > 0) {
      result = result.filter(movie => {
        const movieGenres = movie.genres || (movie.genre ? [movie.genre] : []);
        return movieGenres.some(g => selectedGenres.includes(g));
      });
    }

    // 2. Sort by chosen sort key
    result.sort((a, b) => {
      if (sortBy === 'dateAdded') {
        return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
      }
      if (sortBy === 'rating') {
        const rA = parseFloat(a.rating || a.vote_average || 0);
        const rB = parseFloat(b.rating || b.vote_average || 0);
        return rB - rA;
      }
      if (sortBy === 'year') {
        const yA = parseInt(a.year || a.release_date?.toString().substring(0,4) || 0);
        const yB = parseInt(b.year || b.release_date?.toString().substring(0,4) || 0);
        return yB - yA;
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [watchlist, sortBy, selectedGenres]);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      clearWatchlist();
      // Dispatch custom window event to sync counts
      window.dispatchEvent(new CustomEvent('watchlist-updated'));
    }
  };

  return (
    <div className="min-h-screen bg-dark text-text flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-6 sm:px-12 w-full max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 select-none">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#999999]">
              MY COLLECTION
            </span>
            <div className="flex items-center gap-3">
              <h1 className="font-title text-3xl sm:text-4xl text-white tracking-wide uppercase">
                My Watchlist
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-red text-white text-xs font-bold shadow-md">
                {watchlist.length} saved
              </span>
            </div>
          </div>
          
          {watchlist.length > 0 && (
            <button
              onClick={handleClearAll}
              className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-white border border-white/10 hover:border-red hover:bg-red/5 px-4 py-2 rounded-full transition-all duration-200"
            >
              <Trash2 size={13} />
              Clear Watchlist
            </button>
          )}
        </div>

        {/* Watchlist content layout */}
        {watchlist.length === 0 ? (
          // EMPTY WATCHLIST STATE
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-card border border-white/[0.04] rounded-2xl max-w-md mx-auto my-12"
          >
            <div className="w-20 h-20 rounded-full bg-red/10 border border-red/20 flex items-center justify-center text-red mb-6 shadow-inner select-none">
              <Film size={36} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-body">Your Watchlist is Empty</h2>
            <p className="text-sm text-muted max-w-xs mb-8 font-light leading-relaxed">
              Explore films on our homepage, select your moods, and click the heart icon on any card to save your matches.
            </p>
            <Link 
              to="/" 
              className="px-6 py-3 rounded-full bg-red hover:bg-red/90 text-white font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all duration-200 shadow-lg shadow-red/20"
            >
              Discover Movies <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          // WATCHLIST WITH ITEMS
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
              <div className="bg-card border border-white/[0.04] p-4 rounded-xl text-center">
                <span className="block text-2xl font-title font-black text-white">{stats.totalSaved}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted mt-1 block">Total Saved</span>
              </div>
              <div className="bg-card border border-white/[0.04] p-4 rounded-xl text-center">
                <span className="block text-2xl font-title font-black text-purple-300 truncate px-2">{stats.topGenre}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted mt-1 block">Top Genre</span>
              </div>
              <div className="bg-card border border-white/[0.04] p-4 rounded-xl text-center">
                <span className="block text-2xl font-title font-black text-amber-500 flex justify-center items-center gap-0.5">
                  <Star size={16} fill="currentColor" /> {stats.avgRating}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted mt-1 block">Avg Rating</span>
              </div>
              <div className="bg-card border border-white/[0.04] p-4 rounded-xl text-center">
                <span className="block text-2xl font-title font-black text-red">{stats.oldestSaved}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted mt-1 block">Oldest Saved</span>
              </div>
            </div>

            {/* Sorting & Filters Control Bar */}
            <div className="flex flex-col gap-4 bg-[#111111] p-4 rounded-xl border border-white/[0.04] select-none">
              {/* Top row: Sort criteria */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <span className="text-muted uppercase tracking-wider flex items-center gap-1.5"><RefreshCcw size={12} /> Sort By:</span>
                <div className="flex gap-2">
                  {[
                    { id: 'dateAdded', label: 'Date Added' },
                    { id: 'rating', label: 'Rating' },
                    { id: 'title', label: 'Title' },
                    { id: 'year', label: 'Release Year' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        sortBy === option.id 
                          ? 'bg-red border-red text-white' 
                          : 'bg-dark border-white/5 text-white/70 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom row: Genre multi-filters (only render if there are genres saved) */}
              {availableGenres.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-3 border-t border-white/[0.03]">
                  <span className="text-muted uppercase tracking-wider flex items-center gap-1.5"><Tag size={12} /> Filter Genre:</span>
                  <div className="flex flex-wrap gap-2">
                    {availableGenres.map(genre => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenreFilter(genre)}
                          className={`px-3 py-1.5 rounded-full border transition-all ${
                            isSelected 
                              ? 'bg-purple border-purple text-white shadow-sm' 
                              : 'bg-dark border-white/5 text-white/60 hover:text-white hover:border-white/10'
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                    {selectedGenres.length > 0 && (
                      <button
                        onClick={() => setSelectedGenres([])}
                        className="text-red font-bold hover:underline hover:scale-102 transition-transform py-1.5 px-2"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Grid display with Exit Animations */}
            {processedWatchlist.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-white/[0.04] select-none">
                <p className="text-muted text-sm font-light">No saved films match the selected genre filters.</p>
              </div>
            ) : (
              <motion.div 
                variants={staggerContainerVariant}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center"
              >
                <AnimatePresence mode="popLayout">
                  {processedWatchlist.map((movie) => (
                    <motion.div
                      key={movie.id || movie.title}
                      layout
                      variants={fadeUpVariant}
                      exit={{ opacity: 0, scale: 0.8, y: 15, transition: { duration: 0.2 } }}
                      className="w-full flex justify-center relative group"
                    >
                      {/* Overlay custom trash icon on top right to quickly delete */}
                      <button
                        onClick={() => remove(movie.id || movie.title)}
                        className="absolute top-2 right-2 z-30 p-2 rounded-full bg-black/80 border border-white/10 text-white hover:bg-red hover:border-red opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200"
                        aria-label={`Remove ${movie.title} from watchlist`}
                      >
                        <Trash2 size={13} />
                      </button>

                      <MovieCard 
                        movie={movie} 
                        size="md" 
                        showMatch={false} 
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WatchlistPage;
