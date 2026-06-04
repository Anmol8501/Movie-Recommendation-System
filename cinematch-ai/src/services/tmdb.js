import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || '7d4dc7e4';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

const posterCache = new Map();

// Local backend client
const localApi = axios.create({
  baseURL: BACKEND_API_URL,
});

/**
 * Fetch poster by movie title and year from OMDb API with caching
 */
export const fetchPosterByTitle = async (title, year) => {
  if (!title) return null;
  const cacheKey = `${title.toLowerCase().trim()}-${year || ''}`;
  if (posterCache.has(cacheKey)) {
    return posterCache.get(cacheKey);
  }

  try {
    let url = `${OMDB_BASE_URL}/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
    if (year) {
      url += `&y=${year}`;
    }
    const response = await axios.get(url);
    if (response.data && response.data.Response === 'True' && response.data.Poster && response.data.Poster !== 'N/A') {
      posterCache.set(cacheKey, response.data.Poster);
      return response.data.Poster;
    }

    // Try without year if searching with year failed
    if (year) {
      const fallbackUrl = `${OMDB_BASE_URL}/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
      const fallbackResponse = await axios.get(fallbackUrl);
      if (fallbackResponse.data && fallbackResponse.data.Response === 'True' && fallbackResponse.data.Poster && fallbackResponse.data.Poster !== 'N/A') {
        posterCache.set(cacheKey, fallbackResponse.data.Poster);
        return fallbackResponse.data.Poster;
      }
    }
  } catch (error) {
    console.error('Error fetching poster from OMDb:', title, error);
  }

  posterCache.set(cacheKey, null);
  return null;
};

/**
 * Fetch trending movies from local database popularity sorting
 */
export const getTrending = async (mediaType = 'movie', timeWindow = 'week') => {
  try {
    const response = await localApi.get('/api/trending');
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching trending from local backend:', error);
    return [];
  }
};

/**
 * Search movies by keyword query using OMDb Search API
 */
export const searchMovies = async (query, page = 1) => {
  if (!query) return { results: [], total_pages: 0, total_results: 0 };
  try {
    const url = `${OMDB_BASE_URL}/?s=${encodeURIComponent(query)}&page=${page}&apikey=${OMDB_API_KEY}&type=movie`;
    const response = await axios.get(url);
    const data = response.data;
    if (data && data.Response === 'True' && data.Search) {
      // Map OMDb response back to expected movie structure
      const results = data.Search.map(m => ({
        id: m.imdbID,
        title: m.Title,
        release_date: m.Year ? `${m.Year}-01-01` : '2024-01-01',
        vote_average: 7.0,
        poster_path: m.Poster !== 'N/A' ? m.Poster : null,
        poster_url: m.Poster !== 'N/A' ? m.Poster : null
      }));
      const totalResults = parseInt(data.totalResults) || 0;
      const totalPages = Math.ceil(totalResults / 10);
      return {
        results,
        total_pages: totalPages,
        total_results: totalResults
      };
    }
  } catch (error) {
    console.error('Error searching movies from OMDb:', error);
  }
  return { results: [], total_pages: 0, total_results: 0 };
};

/**
 * Fetch full movie details.
 * If movieId starts with 'tt', fetch from OMDb by IMDb ID.
 * If numeric (TMDB ID), fetch from local backend and enrich with OMDb poster by title.
 */
export const getMovieDetails = async (movieId) => {
  if (!movieId) return null;
  
  try {
    // 1. Check if it's an OMDb IMDb ID (starts with 'tt')
    if (typeof movieId === 'string' && movieId.startsWith('tt')) {
      const url = `${OMDB_BASE_URL}/?i=${movieId}&plot=full&apikey=${OMDB_API_KEY}`;
      const response = await axios.get(url);
      const data = response.data;
      if (data && data.Response === 'True') {
        const ratingMatch = data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : 7.0;
        return {
          id: data.imdbID,
          title: data.Title,
          overview: data.Plot !== 'N/A' ? data.Plot : 'A fine cinematic feature.',
          poster_path: data.Poster !== 'N/A' ? data.Poster : '',
          poster_url: data.Poster !== 'N/A' ? data.Poster : '',
          backdrop_path: data.Poster !== 'N/A' ? data.Poster : '',
          release_date: data.Released && data.Released !== 'N/A' ? data.Released : `${data.Year}-01-01`,
          vote_average: ratingMatch,
          genres: data.Genre ? data.Genre.split(', ').slice(0, 3) : ['Drama'],
          credits: {
            crew: [{ job: 'Director', name: data.Director || 'Unknown Director' }],
            cast: data.Actors ? data.Actors.split(', ').map(actor => ({ name: actor })) : []
          },
          similar: {
            results: []
          }
        };
      }
    }
    
    // 2. Otherwise, it is a numeric TMDB ID. Query local database first
    const localResponse = await localApi.get(`/api/movie/${movieId}`);
    if (localResponse.data && localResponse.data.success && localResponse.data.movie) {
      const movie = localResponse.data.movie;
      
      // Enrich with OMDb poster/details by title and year
      try {
        const omdbUrl = `${OMDB_BASE_URL}/?t=${encodeURIComponent(movie.title)}&y=${movie.year}&apikey=${OMDB_API_KEY}`;
        const omdbResponse = await axios.get(omdbUrl);
        const omdbData = omdbResponse.data;
        if (omdbData && omdbData.Response === 'True') {
          return {
            ...movie,
            poster_path: omdbData.Poster !== 'N/A' ? omdbData.Poster : '',
            poster_url: omdbData.Poster !== 'N/A' ? omdbData.Poster : '',
            backdrop_path: omdbData.Poster !== 'N/A' ? omdbData.Poster : '',
            overview: omdbData.Plot !== 'N/A' ? omdbData.Plot : movie.overview,
            credits: {
              crew: [{ job: 'Director', name: omdbData.Director || movie.director }],
              cast: omdbData.Actors ? omdbData.Actors.split(', ').map(actor => ({ name: actor })) : []
            },
            similar: {
              results: []
            }
          };
        }
      } catch (e) {
        console.warn('OMDb enrichment failed for title:', movie.title, e);
      }
      
      // Return local details if OMDb fails
      return {
        ...movie,
        poster_path: '',
        poster_url: '',
        backdrop_path: '',
        credits: {
          crew: [{ job: 'Director', name: movie.director }],
          cast: []
        },
        similar: {
          results: []
        }
      };
    }
  } catch (error) {
    console.error(`Error fetching movie details (${movieId}):`, error);
  }
  return null;
};

/**
 * Discover movies filtered by genre ID from local backend database
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await localApi.get(`/api/discover?genre=${genreId}&page=${page}`);
    return response.data || { results: [], total_pages: 0, total_results: 0 };
  } catch (error) {
    console.error(`Error discovering movies by genre (${genreId}) from local backend:`, error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

/**
 * Fetch available genres (hardcoded match to local backend mapping)
 */
export const getGenres = async () => {
  return [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" }
  ];
};

/**
 * Fetch top rated movies from local backend
 */
export const getTopRated = async (page = 1) => {
  try {
    const response = await localApi.get(`/api/top_rated?page=${page}`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching top rated from local backend:', error);
    return [];
  }
};

/**
 * Fetch now playing movies from local backend
 */
export const getNowPlaying = async (page = 1) => {
  try {
    const response = await localApi.get(`/api/now_playing?page=${page}`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching now playing from local backend:', error);
    return [];
  }
};

/**
 * Returns poster URL. If it's already a full HTTP url (OMDb), return it as is.
 */
export const getPosterUrl = (path, size = 'w500') => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Returns backdrop URL. If it's a full URL, return it as is.
 */
export const getBackdropUrl = (path) => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1800&q=80';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `https://image.tmdb.org/t/p/original${path}`;
};

export default {
  getTrending,
  searchMovies,
  getMovieDetails,
  getMoviesByGenre,
  getGenres,
  getTopRated,
  getNowPlaying,
  getPosterUrl,
  getBackdropUrl,
  fetchPosterByTitle
};
