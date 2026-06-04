import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useTMDB from '../hooks/useTMDB';
import tmdbService from '../services/tmdb';
import SearchBar from './SearchBar';
import MoodBar from './MoodBar';

/**
 * Stunning full-screen Hero Section serving as the focal point of the HomePage.
 */
export const HeroSection = ({ onSearch, onMoodSelect, activeMood }) => {
  const { trending } = useTMDB();
  const [backdropUrl, setBackdropUrl] = useState('');
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Load first trending movie's backdrop, fallback to premium Unsplash theater banner
  useEffect(() => {
    if (trending && trending.length > 0) {
      const firstMovie = trending[0];
      if (firstMovie.backdrop_path) {
        setBackdropUrl(tmdbService.getBackdropUrl(firstMovie.backdrop_path));
      }
    } else {
      setBackdropUrl('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1800&q=80');
    }
  }, [trending]);

  // Hide scroll indicator after scrolling 50px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen min-h-[650px] w-full flex items-center justify-center overflow-hidden bg-dark">
      
      {/* 1. Full-screen background image backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out scale-102"
        style={{ backgroundImage: `url('${backdropUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1800&q=80'}')` }}
      />

      {/* 2. Radial gradient overlay (Red glow bottom-left, Purple glow top-right) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(229,9,20,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.12),transparent_55%)] pointer-events-none" />

      {/* 3. Linear gradient: transparent to dark at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-dark/40 to-dark pointer-events-none" />

      {/* 4. Content Container */}
      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center space-y-6 sm:space-y-8 select-none">
        
        {/* AI Badge - Fade in from top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-purple/40 bg-purple/15 text-purple-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.15)]"
        >
          <span>✦</span> AI-Powered • 10,000+ Films
        </motion.div>

        {/* Heading title - Slide up + fade in */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="font-title text-[60px] sm:text-[85px] lg:text-[115px] font-black leading-none tracking-widest text-white uppercase"
          >
            CINEMATCH
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="font-title text-[50px] sm:text-[75px] lg:text-[100px] font-black leading-none tracking-widest uppercase bg-gradient-to-r from-red to-purple bg-clip-text text-transparent"
          >
            AI
          </motion.h1>
        </div>

        {/* Subtitle - Fade in */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-2xl font-body font-light text-white/70 text-sm sm:text-base lg:text-lg leading-relaxed px-4"
        >
          Discover your next favorite movie with AI-powered recommendations.
          Tell us your mood — we'll handle the rest.
        </motion.p>

        {/* Search Bar - Slide up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="w-full flex justify-center px-4"
        >
          <SearchBar onSearch={onSearch} size="hero" />
        </motion.div>

        {/* Mood Bar - Fade in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="w-full flex justify-center"
        >
          <MoodBar activeMood={activeMood} onMoodSelect={onMoodSelect} />
        </motion.div>

      </div>

      {/* Scroll indicator at bottom center */}
      {showScrollHint && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 text-[10px] tracking-widest uppercase font-semibold pointer-events-none select-none"
        >
          <div className="w-5 h-8 rounded-full border border-white/30 relative flex items-start justify-center p-1">
            <motion.div 
              animate={{ 
                y: [0, 10, 0],
                opacity: [1, 0, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: 'easeInOut'
              }}
              className="w-1 h-2 rounded-full bg-white/60"
            />
          </div>
          <span>Scroll</span>
        </motion.div>
      )}

    </section>
  );
};

export default HeroSection;
