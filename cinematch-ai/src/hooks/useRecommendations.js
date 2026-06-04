import { useState, useCallback, useRef } from 'react';
import claudeService from '../services/claude';
import watchlistService from '../services/watchlist';

/**
 * Custom React Hook to manage AI recommendations query state and triggers
 */
export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  
  const lastQueryRef = useRef('');
  const timeoutRef = useRef(null);

  const clearResults = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setQuery('');
    lastQueryRef.current = '';
  }, []);

  /**
   * Internal function to execute the recommendation fetch
   */
  const executeFetch = async (searchQuery, moodVal) => {
    setLoading(true);
    setError(null);
    try {
      const history = watchlistService.getWatchHistory();
      const results = await claudeService.getMovieRecommendations(searchQuery, moodVal, history);
      
      if (results && results.length > 0) {
        setRecommendations(results);
        // Log query to search history on success
        watchlistService.addToHistory(searchQuery);
      } else {
        setError('No recommendations found matching that description. Try refining your terms.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Could not contact the recommendation engine.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Triggers a search with 300ms debouncing support if typed, or immediate search.
   * @param {string} searchString - Search input query
   * @param {string} [mood=''] - Optional active mood key
   * @param {boolean} [immediate=true] - If true, triggers immediately without debounce
   */
  const fetchRecommendations = useCallback((searchString, mood = '', immediate = true) => {
    const trimmed = searchString?.trim();
    if (!trimmed) return;
    
    // Avoid double trigger of same query
    if (trimmed.toLowerCase() === lastQueryRef.current.toLowerCase() && !mood) {
      return;
    }
    
    setQuery(trimmed);
    lastQueryRef.current = trimmed;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (immediate) {
      executeFetch(trimmed, mood);
    } else {
      timeoutRef.current = setTimeout(() => {
        executeFetch(trimmed, mood);
      }, 300);
    }
  }, []);

  return {
    recommendations,
    loading,
    error,
    query,
    fetchRecommendations,
    clearResults
  };
};

export default useRecommendations;
