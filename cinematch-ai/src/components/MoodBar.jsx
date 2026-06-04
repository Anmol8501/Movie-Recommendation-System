import React from 'react';

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', description: 'uplifting, warm, feel-good, life-affirming' },
  { id: 'emotional', label: 'Emotional', emoji: '😢', description: 'deeply moving, cathartic, emotionally complex' },
  { id: 'thriller', label: 'Thriller', emoji: '😱', description: 'tension-building, suspenseful, edge-of-seat' },
  { id: 'romantic', label: 'Romantic', emoji: '❤️', description: 'tender, passionate, emotionally intimate' },
  { id: 'scifi', label: 'Sci-Fi', emoji: '🚀', description: 'intellectually stimulating, speculative, visionary' },
  { id: 'mystery', label: 'Mystery', emoji: '🔮', description: 'intriguing, cerebral, layered with secrets' }
];

/**
 * Mood selector bar featuring pill buttons that glow when selected.
 * Renders as a single row on desktop and wraps to a 2x3 grid on mobile.
 */
export const MoodBar = ({ activeMood, onMoodSelect }) => {
  return (
    <div className="w-full max-w-2xl px-4 select-none">
      <div 
        className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap justify-center gap-2.5 sm:gap-3"
        role="group"
        aria-label="Filter recommendations by mood"
      >
        {MOODS.map((mood) => {
          const isActive = activeMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onMoodSelect(mood.id)}
              aria-pressed={isActive}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-body font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-red/20 border-red text-white shadow-[0_0_15px_rgba(229,9,20,0.3)] scale-[1.02]'
                  : 'bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodBar;
