import { useState, useEffect, useRef, useCallback } from 'react';
import tmdbService from '../services/tmdb';

/**
 * Custom React Hook to manage TMDB states and request caching
 */
export const useTMDB = () => {
  const [trending, setTrending] = useState([]);
  const [genres, setGenres] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // In-memory cache Map to hold query search results and genre discoveries
  const cacheRef = useRef(new Map());

  // Automatically fetch trending and genres on mount
  useEffect(() => {
    let active = true;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [trendingData, genresData, nowPlayingData, topRatedData] = await Promise.all([
          tmdbService.getTrending('movie', 'week'),
          tmdbService.getGenres(),
          tmdbService.getNowPlaying(1),
          tmdbService.getTopRated(1)
        ]);

        if (active) {
          if (trendingData) setTrending(trendingData);
          if (genresData) setGenres(genresData);
          if (nowPlayingData) setNowPlaying(nowPlayingData);
          if (topRatedData) setTopRated(topRatedData);
        }
      } catch (err) {
        console.error('Error in useTMDB initial fetch:', err);
        setError('Failed to fetch movie listings from TMDB.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Search movies using cache fallback
   * @param {string} query 
   * @param {number} [page=1]
   */
  const search = useCallback(async (query, page = 1) => {
    if (!query) return { results: [], total_pages: 0, total_results: 0 };
    const cacheKey = `search-${query}-${page}`;
    
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    try {
      const data = await tmdbService.searchMovies(query, page);
      if (data) {
        cacheRef.current.set(cacheKey, data);
        return data;
      }
      return { results: [], total_pages: 0, total_results: 0 };
    } catch (err) {
      console.error(err);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }, []);

  /**
   * Fetch movies discover page by genre using cache fallback
   * @param {number|string} genreId 
   * @param {number} [page=1]
   */
  const fetchByGenre = useCallback(async (genreId, page = 1) => {
    if (!genreId) return { results: [], total_pages: 0, total_results: 0 };
    const cacheKey = `genre-${genreId}-${page}`;

    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    try {
      const data = await tmdbService.getMoviesByGenre(genreId, page);
      if (data) {
        cacheRef.current.set(cacheKey, data);
        return data;
      }
      return { results: [], total_pages: 0, total_results: 0 };
    } catch (err) {
      console.error(err);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }, []);

  return {
    trending,
    genres,
    nowPlaying,
    topRated,
    loading,
    error,
    searchMovies: search,
    fetchByGenre
  };
};

export default useTMDB;
