import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useTMDB from '../hooks/useTMDB';
import MovieCard from './MovieCard';

export const TrendingCarousel = () => {
  const { trending, loading } = useTMDB();
  const carouselRef = useRef(null);
  
  // Drag scroll states
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragMoved, setDragMoved] = useState(false); // prevent clicks on drag release
  const [showArrows, setShowArrows] = useState(false);

  // Left/Right scrolling arrows
  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Mouse Drag Event Handlers
  const handleMouseDown = (e) => {
    setIsDown(true);
    setDragMoved(false);
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // scroll speed multiplier
    
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

  if (loading && (!trending || trending.length === 0)) {
    return (
      <div className="w-full px-6 sm:px-12 py-12 bg-dark">
        <div className="shimmer h-8 rounded w-48 mb-6" />
        <div className="flex gap-4 overflow-x-hidden">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="w-[140px] aspect-[2/3] bg-card rounded-lg shimmer flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!trending || trending.length === 0) {
    return null;
  }

  // Metalic rank badge styles
  const getRankBadge = (index) => {
    if (index === 0) return { label: '#1 Rank', style: 'bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black font-extrabold' };
    if (index === 1) return { label: '#2 Rank', style: 'bg-gradient-to-r from-[#d7d7d7] via-[#f3f3f3] to-[#b4b4b4] text-black font-extrabold' };
    if (index === 2) return { label: '#3 Rank', style: 'bg-gradient-to-r from-[#a05a2c] via-[#e28c50] to-[#8c4a1b] text-white font-extrabold' };
    return null;
  };

  return (
    <section 
      id="trending"
      className="w-full px-6 sm:px-12 py-12 relative select-none bg-dark group/section"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Header Row */}
      <div className="flex items-end justify-between mb-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#999999]">
            WHAT'S HOT
          </span>
          <h2 className="font-title text-2xl sm:text-3xl text-white tracking-wide">
            Trending Now
          </h2>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-6 top-[55%] z-30 p-2 rounded-full bg-black/70 border border-white/10 text-white hover:bg-red hover:border-red transition-all duration-200 shadow-xl focus:outline-none"
            aria-label="Scroll carousel left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-6 top-[55%] z-30 p-2 rounded-full bg-black/70 border border-white/10 text-white hover:bg-red hover:border-red transition-all duration-200 shadow-xl focus:outline-none"
            aria-label="Scroll carousel right"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Horizontal Carousel */}
      <div
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClickCapture={preventGhostClick}
        className="flex gap-4 overflow-x-auto thin-scrollbar pb-4 carousel-snap select-none cursor-grab active:cursor-grabbing"
        style={{ scrollBehavior: 'smooth' }}
      >
        {trending.map((movie, index) => {
          const badgeMeta = getRankBadge(index);
          const customMovieObj = {
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
            rating: movie.vote_average,
            genre: movie.genre || 'Action',
            tmdbPosterPath: movie.poster_path,
            poster_url: movie.poster_url || (movie.poster_path ? tmdbService.getPosterUrl(movie.poster_path) : '')
          };

          return (
            <div 
              key={movie.id} 
              className="carousel-snap-item flex-shrink-0 flex items-end relative"
            >
              {/* Optional Massive Rank Numbers for Top 3 behind the card */}
              {index < 3 && (
                <div className="absolute -left-4 -bottom-6 font-title text-[100px] leading-none text-stroke-rank font-black select-none pointer-events-none z-0">
                  {index + 1}
                </div>
              )}
              
              <div className={`relative ${index < 3 ? 'pl-8' : ''} z-10`}>
                <MovieCard 
                  movie={customMovieObj} 
                  size="sm" 
                  showMatch={false}
                />
                
                {/* Overlay rank badge on top left */}
                {badgeMeta && (
                  <span className={`absolute top-2 right-2 z-10 text-[9px] px-2 py-0.5 rounded shadow ${badgeMeta.style}`}>
                    {badgeMeta.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrendingCarousel;
