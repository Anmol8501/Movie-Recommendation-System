import React, { useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import { staggerContainerVariant, fadeUpVariant } from '../utils/animations';

export const RecommendationGrid = ({ movies = [], loading = false, error = null, query = '', onRefine }) => {
  const containerRef = useRef(null);

  // Auto-scroll to recommendations grid when loading starts or succeeds
  useEffect(() => {
    if (loading || (movies && movies.length > 0)) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, movies]);

  // IDLE State
  if (!loading && !error && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <section 
      ref={containerRef} 
      id="ai-results-section" 
      className="scroll-mt-20 w-full px-6 sm:px-12 py-16 flex flex-col gap-8 bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 select-none">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple">
            AI Recommendations
          </span>
          <h2 className="font-title text-3xl sm:text-4xl text-white tracking-wider">
            Your Perfect Matches
          </h2>
          {query && !loading && (
            <p className="text-xs sm:text-sm text-muted">
              {movies.length} films custom-selected for: <span className="text-white italic">"{query}"</span>
            </p>
          )}
        </div>
        
        {!loading && onRefine && (
          <button 
            onClick={onRefine}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-red hover:underline hover:scale-102 transition-transform duration-150 border border-red/20 px-4 py-2 rounded-full bg-red/5"
          >
            <RefreshCw size={12} />
            Refine Search
          </button>
        )}
      </div>

      {/* Grid Content / Skeletons / Errors */}
      {loading ? (
        // LOADING State - 6 skeleton cards
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="w-full flex justify-center">
              <SkeletonCard size="md" />
            </div>
          ))}
        </div>
      ) : error ? (
        // ERROR State
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-12 flex flex-col items-center justify-center text-center bg-[#111111] border border-white/5 rounded-2xl p-6"
        >
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold text-white mb-2">Recommendation Engine Failure</h3>
          <p className="text-sm text-muted max-w-md mb-6">{error}</p>
          {onRefine && (
            <button 
              onClick={onRefine}
              className="bg-red hover:bg-red/80 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Try Another Search
            </button>
          )}
        </motion.div>
      ) : (
        // SUCCESS State
        <>
          <motion.div 
            variants={staggerContainerVariant}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6"
          >
            {movies.map((movie, index) => (
              <motion.div 
                key={movie.id || movie.title}
                variants={fadeUpVariant}
                className="w-full flex justify-center"
              >
                <MovieCard 
                  movie={movie} 
                  size="md" 
                  showMatch={true} 
                  showReasons={true} 
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Reasoning Explanation Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 rounded-xl bg-card border border-white/[0.04] flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">How did we find these?</h4>
              <p className="text-xs text-muted">CineMatch AI analyzed the database and cross-referenced matching criteria:</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-white/80 font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-purple" /> Query Intent</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-purple" /> Genre DNA</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-purple" /> Thematic Resonance</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-purple" /> Decade Preferences</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-purple" /> Director Style</span>
            </div>
          </motion.div>
        </>
      )}
    </section>
  );
};

export default RecommendationGrid;
