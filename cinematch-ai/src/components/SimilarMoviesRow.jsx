import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import claudeService from '../services/claude';

/**
 * Tray showing similar movies to a specific target film.
 * Automatically fetches items on mount if movies array is not provided.
 */
export const SimilarMoviesRow = ({ sourceTitle, sourceGenres = [], movies: initialMovies }) => {
  const [movies, setMovies] = useState(initialMovies || []);
  const [loading, setLoading] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  
  const carouselRef = useRef(null);

  // Fetch similar movies if none are supplied in props
  useEffect(() => {
    if (initialMovies) {
      setMovies(initialMovies);
      return;
    }

    if (!sourceTitle) return;

    let active = true;
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const results = await claudeService.getSimilarMovies(sourceTitle, sourceGenres);
        if (active && results) {
          setMovies(results);
        }
      } catch (err) {
        console.error('Error fetching similar movies in SimilarMoviesRow:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSimilar();

    return () => {
      active = false;
    };
  }, [sourceTitle, sourceGenres, initialMovies]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Drag scroll support
  const [isDown, setIsDown] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setDragMoved(false);
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      setDragMoved(true);
    }
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const preventGhostClick = (e) => {
    if (dragMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // If not loading and there are no similar movies, hide component
  if (!loading && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <section 
      className="w-full px-6 sm:px-12 py-12 relative bg-dark/40 border-t border-white/5 group/similar select-none"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Header */}
      <div className="mb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#999999]">
          YOU MIGHT ALSO LIKE
        </span>
        <h2 className="font-body text-lg sm:text-xl font-medium text-white mt-1">
          People who liked <span className="italic font-serif text-red font-semibold">{sourceTitle}</span> also watched
        </h2>
      </div>

      {/* Nav Arrows */}
      {showArrows && !loading && movies.length > 3 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-6 top-[55%] z-30 p-2 rounded-full bg-black/70 border border-white/10 text-white hover:bg-red hover:border-red transition-all duration-200 shadow-xl focus:outline-none"
            aria-label="Scroll similar list left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-6 top-[55%] z-30 p-2 rounded-full bg-black/70 border border-white/10 text-white hover:bg-red hover:border-red transition-all duration-200 shadow-xl focus:outline-none"
            aria-label="Scroll similar list right"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Horizontal Carousel List */}
      <div
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setIsDown(false)}
        onMouseUp={() => setIsDown(false)}
        onMouseMove={handleMouseMove}
        onClickCapture={preventGhostClick}
        className="flex gap-4 overflow-x-auto thin-scrollbar pb-4 carousel-snap cursor-grab active:cursor-grabbing"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loading ? (
          // LOADING: 8 skeleton cards
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="carousel-snap-item flex-shrink-0">
              <SkeletonCard size="sm" />
            </div>
          ))
        ) : (
          movies.map((movie) => {
            const customMovieObj = {
              id: movie.id,
              title: movie.title,
              year: movie.year || (movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'),
              rating: movie.rating || movie.vote_average,
              genre: movie.genre || 'Drama',
              tmdbPosterPath: movie.tmdbPosterPath || movie.poster_path
            };

            return (
              <div key={movie.id || movie.title} className="carousel-snap-item flex-shrink-0">
                <MovieCard 
                  movie={customMovieObj} 
                  size="sm" 
                  showMatch={false} 
                />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default SimilarMoviesRow;
