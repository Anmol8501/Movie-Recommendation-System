import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Centered modal overlay that embeds a YouTube video trailer
 */
export const TrailerModal = ({ isOpen, onClose, videoKey, title }) => {
  // Listen for Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock page scroll
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative z-10 w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-card border border-white/10 shadow-2xl"
          >
            {/* Header controls overlay */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
              <span className="hidden sm:inline text-xs font-semibold tracking-wide text-white/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                {title || 'Official Trailer'}
              </span>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-black/60 border border-white/10 text-white hover:bg-red hover:border-red transition-all duration-200"
                aria-label="Close trailer modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video content */}
            {videoKey ? (
              <iframe
                title={`${title} Trailer`}
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-surface">
                <span className="text-4xl mb-4">🎬</span>
                <h3 className="text-lg font-bold text-white mb-2">Trailer Unavailable</h3>
                <p className="text-sm text-muted max-w-sm">
                  We couldn't find an official trailer for "{title}". Try searching directly on YouTube.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;
