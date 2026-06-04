import React from 'react';

// Exact Genre metadata map matching the requirements in Section 4G
const GENRE_METADATA = [
  { id: 28, name: 'Action', emoji: '💥', count: '2,340', gradient: 'from-[#7f1d1d] to-[#991b1b]' },
  { id: 878, name: 'Sci-Fi', emoji: '🚀', count: '1,820', gradient: 'from-[#1e1b4b] to-[#3730a3]' },
  { id: 18, name: 'Drama', emoji: '🎭', count: '3,100', gradient: 'from-[#064e3b] to-[#065f46]' },
  { id: 27, name: 'Horror', emoji: '👻', count: '1,450', gradient: 'from-[#1c1917] to-[#44403c]' },
  { id: 10749, name: 'Romance', emoji: '❤️', count: '980', gradient: 'from-[#831843] to-[#9d174d]' },
  { id: 53, name: 'Thriller', emoji: '🔪', count: '1,670', gradient: 'from-[#1e3a5f] to-[#1e40af]' },
  { id: 35, name: 'Comedy', emoji: '😂', count: '2,100', gradient: 'from-[#713f12] to-[#92400e]' },
  { id: 16, name: 'Animation', emoji: '🎨', count: '720', gradient: 'from-[#3b0764] to-[#6b21a8]' },
  { id: 80, name: 'Crime', emoji: '🕵️', count: '1,230', gradient: 'from-[#0c1445] to-[#1e3a8a]' },
  { id: 14, name: 'Fantasy', emoji: '🧙', count: '890', gradient: 'from-[#1a1035] to-[#4c1d95]' }
];

/**
 * Visual interactive grid of movie genres.
 * Clicking a genre triggers a callback to filter recommendations by that category.
 */
export const GenreExplorer = ({ onGenreClick }) => {
  const handleCardClick = (id, name) => {
    if (onGenreClick) {
      onGenreClick({ id, name });
    }
  };

  return (
    <section 
      id="genres" 
      className="w-full px-6 sm:px-12 py-16 bg-[#0e0e0e] border-t border-white/5 scroll-mt-16 select-none"
    >
      {/* Header */}
      <div className="space-y-1 mb-8">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#999999]">
          EXPLORE
        </span>
        <h2 className="font-title text-2xl sm:text-3xl text-white tracking-wide">
          Genre Explorer
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-4">
        {GENRE_METADATA.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleCardClick(genre.id, genre.name)}
            className={`group rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 transform hover:scale-105 hover:brightness-110 bg-gradient-to-br ${genre.gradient} border border-white/5 shadow-md opacity-90 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red`}
            style={{ minHeight: '130px' }}
          >
            <span className="text-3xl group-hover:animate-bounce transition-transform duration-300" role="img" aria-label={genre.name}>
              {genre.emoji}
            </span>
            <div className="space-y-0.5">
              <h3 className="font-body font-bold text-white text-sm tracking-wide leading-tight">
                {genre.name}
              </h3>
              <p className="text-[10px] text-white/60 font-medium">
                {genre.count} films
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default GenreExplorer;
