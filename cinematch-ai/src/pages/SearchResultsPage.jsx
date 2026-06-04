import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowLeft, AlertCircle, TrendingUp } from 'lucide-react';
import tmdbService from '../services/tmdb';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { staggerContainerVariant, fadeUpVariant } from '../utils/animations';
import { motion } from 'framer-motion';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const genreId = searchParams.get('genre') || '';
  const genreName = searchParams.get('name') || '';
  const isTrending = searchParams.get('trending') === '1';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination tracking
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Setup intersection observer for infinite scroll
  // We set triggerOnce to false so it repeatedly triggers when scrolling down
  const [loaderRef, isNearBottom] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: false
  });

  // Fetch initial results when search queries change
  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      setPage(1);
      setMovies([]);
      
      try {
        let data = null;
        if (isTrending) {
          const trendingResults = await tmdbService.getTrending('movie', 'week');
          data = { results: trendingResults || [], total_pages: 1 };
        } else if (genreId) {
          data = await tmdbService.getMoviesByGenre(genreId, 1);
        } else if (query) {
          data = await tmdbService.searchMovies(query, 1);
        } else {
          // Empty state: default to popular movies
          const nowPlaying = await tmdbService.getNowPlaying(1);
          data = { results: nowPlaying || [], total_pages: 5 };
        }

        if (active && data) {
          setMovies(data.results || []);
          setTotalPages(data.total_pages || 1);
        }
      } catch (err) {
        console.error('Error fetching initial search results:', err);
        setError('Connection error. Failed to retrieve matching films from TMDB.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInitial();

    return () => {
      active = false;
    };
  }, [query, genreId, isTrending]);

  // Load next page function for infinite scroll
  const loadNextPage = useCallback(async () => {
    if (loadingNext || page >= totalPages) return;
    setLoadingNext(true);
    const nextPage = page + 1;

    try {
      let data = null;
      if (genreId) {
        data = await tmdbService.getMoviesByGenre(genreId, nextPage);
      } else if (query) {
        data = await tmdbService.searchMovies(query, nextPage);
      } else if (!isTrending) {
        data = await tmdbService.getNowPlaying(nextPage);
      }

      if (data && data.results) {
        setMovies(prev => [...prev, ...data.results]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading next page for infinite scroll:', err);
    } finally {
      setLoadingNext(false);
    }
  }, [page, totalPages, query, genreId, isTrending, loadingNext]);

  // Trigger loadNextPage when page boundary is visible
  useEffect(() => {
    if (isNearBottom && !loading && !loadingNext && page < totalPages) {
      loadNextPage();
    }
  }, [isNearBottom, loading, loadingNext, page, totalPages, loadNextPage]);

  const handleSearchSubmit = (newQuery) => {
    setSearchParams({ q: newQuery });
  };

  // Label text helper
  const getHeaderTitle = () => {
    if (isTrending) return 'Trending Movies';
    if (genreName) return `${genreName} Movies`;
    if (query) return `Search Results for "${query}"`;
    return 'Browse Movies';
  };

  return (
    <div className="min-h-screen bg-dark text-text flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-6 sm:px-12 w-full max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Search header container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 select-none">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999] flex items-center gap-1">
              {isTrending && <TrendingUp size={11} className="text-red" />}
              {isTrending ? 'PLATFORM TRENDS' : 'TMDB DISCOVER'}
            </span>
            <h1 className="font-title text-3xl sm:text-4xl text-white tracking-wide uppercase">
              {getHeaderTitle()}
            </h1>
          </div>
          
          <button
            onClick={() => navigate(-1)}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-colors"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>

        {/* Inline Search Bar */}
        <div className="w-full max-w-xl select-none">
          <SearchBar onSearch={handleSearchSubmit} placeholder="Filter search query..." size="compact" />
        </div>

        {/* Results Block */}
        {loading && movies.length === 0 ? (
          // INITIAL LOADING STATE
          <div className="flex-grow flex items-center justify-center py-24 select-none">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-red animate-spin" />
              <span className="text-xs text-muted font-semibold tracking-wider uppercase">Searching records...</span>
            </div>
          </div>
        ) : error ? (
          // ERROR STATE
          <div className="flex-grow flex flex-col items-center justify-center py-20 text-center select-none">
            <AlertCircle size={40} className="text-red mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Search Failure</h3>
            <p className="text-sm text-muted max-w-xs">{error}</p>
          </div>
        ) : movies.length === 0 ? (
          // NO RESULTS
          <div className="flex-grow flex flex-col items-center justify-center py-20 text-center select-none">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-bold text-white mb-2">No Movies Found</h3>
            <p className="text-sm text-muted max-w-sm">We couldn't find any movies matching "{query || genreName}". Check spelling or try a different term.</p>
          </div>
        ) : (
          // SUCCESS GRID DISPLAY
          <div className="space-y-12">
            <motion.div 
              variants={staggerContainerVariant}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center"
            >
              {movies.map((movie) => {
                const mappedMovie = {
                  id: movie.id,
                  title: movie.title,
                  year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
                  rating: movie.vote_average,
                  genre: movie.genre || 'Action',
                  tmdbPosterPath: movie.poster_path,
                  poster_url: movie.poster_url || (movie.poster_path ? tmdbService.getPosterUrl(movie.poster_path) : ''),
                  overview: movie.overview
                };

                return (
                  <motion.div 
                    key={movie.id}
                    variants={fadeUpVariant}
                    className="w-full flex justify-center"
                  >
                    <MovieCard 
                      movie={mappedMovie} 
                      size="md" 
                      showMatch={false} 
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Bottom Loader node watched by Intersection Observer */}
            {page < totalPages && (
              <div 
                ref={loaderRef} 
                className="w-full flex justify-center py-8 select-none"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-muted tracking-widest uppercase">
                  <Loader2 className="w-5 h-5 text-purple animate-spin" />
                  Loading More Matches...
                </div>
              </div>
            )}

            {page >= totalPages && movies.length > 5 && (
              <p className="text-center text-xs text-muted font-medium select-none pt-4">
                ✦ You've reached the end of the collection ✦
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
