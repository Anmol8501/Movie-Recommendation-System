import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "mind-bending sci-fi like Interstellar...",
  "feel-good movies for a rainy evening...",
  "best Korean thrillers of the decade...",
  "movies that will make me cry...",
  "gripping crime mystery like Se7en...",
  "uplifting sports drama to motivate me..."
];

export const SearchBar = ({ onSearch, placeholder = '', autoFocus = false, size = 'hero' }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Suggestion cycling interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      rec.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setInputValue(result);
        if (onSearch) {
          onSearch(result);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setVoiceError('Voice recognition error. Try again.');
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [onSearch]);

  const handleSearchSubmit = () => {
    if (inputValue.trim() && onSearch) {
      onSearch(inputValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert("Voice search is not supported by your browser. Try Google Chrome or Microsoft Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const clearInput = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const isHero = size === 'hero';

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Voice feedback tooltip */}
      {(isListening || voiceError) && (
        <div className={`absolute -top-10 px-3 py-1 rounded-full text-xs font-semibold select-none z-10 shadow-lg ${
          isListening ? 'bg-purple text-white animate-bounce' : 'bg-red text-white'
        }`}>
          {isListening ? '🎙️ Listening to your voice...' : voiceError}
        </div>
      )}

      {/* Main Search Bar Wrapper */}
      <div 
        className={`w-full flex items-center relative transition-all duration-300 border border-white/10 ${
          isHero 
            ? 'max-w-[580px] p-2 bg-white/[0.07] backdrop-blur-2xl rounded-full focus-within:shadow-[0_0_0_3px_rgba(229,9,20,0.2)] focus-within:border-red/60' 
            : 'max-w-full p-1 bg-white/[0.05] backdrop-blur-md rounded-xl focus-within:border-red/60'
        }`}
      >
        {/* Left Search Icon */}
        <Search className={`text-muted ml-3 flex-shrink-0 ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} />

        {/* Text Input */}
        <div className="flex-1 relative overflow-hidden h-full flex items-center">
          {/* Animated Suggestion Placeholders when input is empty */}
          <AnimatePresence mode="wait">
            {!inputValue && (
              <motion.span
                key={suggestionIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.4, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`absolute left-3 pointer-events-none text-white select-none whitespace-nowrap overflow-hidden text-ellipsis w-[90%] text-left ${
                  isHero ? 'text-base' : 'text-sm'
                }`}
              >
                {placeholder || `Try: ${SUGGESTIONS[suggestionIndex]}`}
              </motion.span>
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="text"
            role="search"
            aria-label="Search for movies"
            autoFocus={autoFocus}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent border-0 text-white outline-none pl-3 pr-8 ${
              isHero ? 'h-10 text-base' : 'h-8 text-sm'
            }`}
          />
        </div>

        {/* Clear Button */}
        {inputValue && (
          <button
            onClick={clearInput}
            className="p-1 rounded-full text-muted hover:text-white transition-colors duration-150 mr-1"
            aria-label="Clear search input"
          >
            <X size={16} />
          </button>
        )}

        {/* Voice Search Button */}
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-full mr-2 transition-all duration-200 ${
              isListening 
                ? 'bg-red text-white animate-pulse' 
                : 'text-muted hover:text-white hover:bg-white/10'
            }`}
            aria-label="Search with voice"
            aria-pressed={isListening}
          >
            <Mic size={isHero ? 18 : 16} />
          </button>
        )}

        {/* Right Search Button */}
        <button
          onClick={handleSearchSubmit}
          className={`flex-shrink-0 bg-red text-white font-semibold hover:bg-red/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${
            isHero ? 'px-6 py-2.5 rounded-full text-sm' : 'px-4 py-1.5 rounded-lg text-xs'
          }`}
        >
          Find Films
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
