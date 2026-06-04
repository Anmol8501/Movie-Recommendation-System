import { Anthropic } from '@anthropic-ai/sdk';
import tmdbService from './tmdb';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// Initialize Anthropic client if key is available.
// Browser builds require dangerouslyAllowBrowser: true.
let anthropic = null;
if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
  anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true
  });
}

/**
 * Verbatim System Prompt required by Section 6
 */
const RECOMMENDATION_SYSTEM_PROMPT = `You are CineMatch AI, a world-class cinephile and recommendation
engine with encyclopedic knowledge of global cinema across all
decades, genres, and countries.
Your sole job is to return a JSON array of exactly 6 movie
recommendations. You must respond with ONLY the raw JSON array —
no markdown code fences, no explanation, no preamble, no postamble.
The very first character of your response must be '[' and the last
must be ']'.
Each element in the array must be a JSON object with exactly these
fields (all required, no extras):
{
"title"          : "Exact English title (or romanized if foreign)",
"year"           : 2001,
"rating"         : 8.5,
"genre"          : "Sci-Fi",
"genres"         : ["Sci-Fi", "Thriller", "Drama"],
"matchScore"     : 94,
"reasons"        : [
"Mind-bending narrative structure",
"Visually stunning cinematography",
"Explores themes of identity"
],
"overview"       : "One gripping sentence about the film, max 90 chars.",
"director"       : "Christopher Nolan",
"tmdbPosterPath" : "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
}
Rules:
matchScore must be an integer between 80 and 99
reasons must be exactly 3 items, each 3-6 words
genres must have 2-3 items
Vary matchScore naturally (not all 95+)
tmdbPosterPath must be a real TMDB path you are certain about,
or an empty string "" if you are not certain
Never repeat a film across calls in the same session
Prioritize genuine thematic fit over popularity
Include international/arthouse films when appropriate`;

/**
 * Intelligent Fallback Recommendation Engine
 * Used when ANTHROPIC_API_KEY is not set. It parses the query, searches TMDB,
 * and builds a compliant recommendation structure.
 */
const runFallbackRecommendations = async (query, mood = '') => {
  console.log(`Running CineMatch Local Fallback Engine for query: "${query}" (Mood: ${mood})`);
  
  try {
    let movies = [];
    
    // 1. Check if user is asking for similar movies to a specific title
    const similarMatch = query.match(/(?:similar to|like|after|watched)\s+([^,]+)/i);
    const moodClean = mood.replace(/[^\w\s-]/g, '').trim().toLowerCase();
    
    if (similarMatch && similarMatch[1]) {
      const targetMovieName = similarMatch[1].trim();
      const searchRes = await tmdbService.searchMovies(targetMovieName);
      if (searchRes && searchRes.results?.length > 0) {
        const primaryMovie = searchRes.results[0];
        // Fetch details including similar movies
        const details = await tmdbService.getMovieDetails(primaryMovie.id);
        if (details && details.similar?.results?.length > 0) {
          movies = details.similar.results.slice(0, 6);
        }
      }
    }
    
    // 2. Check if we have genre indicators or need a fallback category
    if (movies.length === 0) {
      const genresList = await tmdbService.getGenres();
      let matchedGenreId = null;
      
      if (genresList) {
        // Try matching query/mood with actual genre names
        const searchTerms = `${query} ${mood}`.toLowerCase();
        const foundGenre = genresList.find(g => searchTerms.includes(g.name.toLowerCase()));
        if (foundGenre) matchedGenreId = foundGenre.id;
      }
      
      if (matchedGenreId) {
        const discoverRes = await tmdbService.getMoviesByGenre(matchedGenreId);
        if (discoverRes && discoverRes.results?.length > 0) {
          movies = discoverRes.results.slice(0, 6);
        }
      }
    }
    
    // 3. Last fallback: Fetch trending movies
    if (movies.length === 0) {
      const trending = await tmdbService.getTrending('movie', 'week');
      if (trending) {
        movies = trending.slice(0, 6);
      }
    }
    
    // 4. Transform TMDB results into standard CineMatch AI structure
    const results = await Promise.all(movies.map(async (m, index) => {
      // Fetch full details to get director and proper data
      const fullDetails = await tmdbService.getMovieDetails(m.id);
      
      const director = fullDetails?.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown Director';
      const releaseYear = m.release_date ? new Date(m.release_date).getFullYear() : 2024;
      const tmdbGenres = fullDetails?.genres?.map(g => g.name) || [m.genre || 'Drama'];
      
      // Seeded random match score
      const matchScore = 99 - (index * 2) - Math.floor(Math.random() * 3);
      
      // Dynamic reasons based on genres and details
      const primaryGenre = tmdbGenres[0] || 'Drama';
      const reasons = [
        `Compelling ${primaryGenre.toLowerCase()} narrative`,
        `Masterfully directed by ${director.split(' ').pop()}`,
        `Visually memorable cinema experience`
      ];
      
      return {
        id: m.id, // preserve for details routing
        title: m.title,
        year: releaseYear,
        rating: parseFloat(m.vote_average?.toFixed(1) || '7.5'),
        genre: primaryGenre,
        genres: tmdbGenres.slice(0, 3),
        matchScore: Math.max(80, Math.min(99, matchScore)),
        reasons,
        overview: m.overview ? m.overview.substring(0, 87) + '...' : 'An outstanding cinematic selection.',
        director,
        tmdbPosterPath: m.poster_path || ''
      };
    }));
    
    return results;
  } catch (error) {
    console.error("Local fallback recommendation failed:", error);
    return [];
  }
};

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

const fetchRecommendationsFromBackend = async (query, count = 6) => {
  try {
    const url = `${BACKEND_API_URL}/api/recommend?movie=${encodeURIComponent(query)}&count=${count}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }
    const data = await response.json();
    const mapped = await Promise.all(data.recommendations.map(async (movie) => {
      try {
        const details = await tmdbService.getMovieDetails(movie.id);
        const mappedMovie = {
          ...movie,
          tmdbPosterPath: details?.poster_path || '',
          backdrop_path: details?.backdrop_path || '',
          poster_path: details?.poster_path || '',
          poster_url: details?.poster_url || ''
        };

        // Phase 1: Data Inspection
        const missing = [];
        if (!mappedMovie.title) missing.push('title');
        if (mappedMovie.rating === undefined) missing.push('rating');
        if (!mappedMovie.genres) missing.push('genres');
        if (!mappedMovie.poster_path) missing.push('poster_path');
        if (!mappedMovie.poster_url) missing.push('poster_url');
        if (missing.length > 0) {
          console.warn(`[DATA INSPECTION] Movie ID ${movie.id} "${movie.title || 'Unknown'}" is missing fields: ${missing.join(', ')}`);
        }

        return mappedMovie;
      } catch (tmdbErr) {
        return {
          ...movie,
          tmdbPosterPath: '',
          backdrop_path: '',
          poster_path: '',
          poster_url: ''
        };
      }
    }));
    return mapped;
  } catch (err) {
    console.warn(`Local Python backend failed:`, err);
  }
  return null;
};

/**
 * Fetch recommendation list from Claude AI, falling back to TMDB processing if key is missing.
 * @param {string} query 
 * @param {string} mood 
 * @param {Array} watchHistory 
 */
export const getMovieRecommendations = async (query, mood = '', watchHistory = []) => {
  // Try local Python recommendation engine first
  const backendResults = await fetchRecommendationsFromBackend(query, 6);
  if (backendResults && backendResults.length > 0) {
    return backendResults;
  }

  if (!anthropic) {
    return runFallbackRecommendations(query, mood);
  }

  try {
    let userPrompt = `Query: "${query}"`;
    if (mood) {
      userPrompt += `\nUser Mood: ${mood}`;
    }
    if (watchHistory.length > 0) {
      userPrompt += `\nWatch history context (avoid recommending these): ${watchHistory.join(', ')}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // updated to active claude model identifier
      max_tokens: 1200,
      system: RECOMMENDATION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].text;
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error fetching recommendations from Claude API:', error);
    return runFallbackRecommendations(query, mood); // fallback on api error
  }
};

/**
 * Fetch mood based recommendations
 * @param {string} mood - happy | emotional | thriller | romantic | scifi | mystery
 */
export const getMoodRecommendations = async (mood) => {
  const moodDescriptions = {
    happy: 'uplifting, warm, feel-good, life-affirming',
    emotional: 'deeply moving, cathartic, emotionally complex',
    thriller: 'tension-building, suspenseful, edge-of-seat',
    romantic: 'tender, passionate, emotionally intimate',
    scifi: 'intellectually stimulating, speculative, visionary',
    mystery: 'intriguing, cerebral, layered with secrets'
  };

  const desc = moodDescriptions[mood] || mood;
  
  // Try local Python recommendation engine first
  const backendResults = await fetchRecommendationsFromBackend(desc, 6);
  if (backendResults && backendResults.length > 0) {
    return backendResults;
  }

  const moodPrompt = `User mood: ${mood}. Prioritize films that evoke ${desc}. The emotional resonance is more important than genre.`;
  
  if (!anthropic) {
    return runFallbackRecommendations(`Best movies matching emotional vibe: ${desc}`, mood);
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      system: RECOMMENDATION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: moodPrompt }],
    });

    const text = response.content[0].text;
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error(`Error fetching mood (${mood}) recommendations from Claude:`, error);
    return runFallbackRecommendations(`Best movies matching emotional vibe: ${desc}`, mood);
  }
};

/**
 * Returns 8 similar films
 * @param {string} title 
 * @param {Array|string} genres 
 */
export const getSimilarMovies = async (title, genres) => {
  // Try local Python recommendation engine first
  const backendResults = await fetchRecommendationsFromBackend(title, 8);
  if (backendResults && backendResults.length > 0) {
    return backendResults;
  }

  const genresStr = Array.isArray(genres) ? genres.join(', ') : genres;
  
  if (!anthropic) {
    // Fallback: search TMDB and get similar
    try {
      const searchRes = await tmdbService.searchMovies(title);
      if (searchRes?.results?.length > 0) {
        const details = await tmdbService.getMovieDetails(searchRes.results[0].id);
        if (details?.similar?.results?.length > 0) {
          return details.similar.results.slice(0, 8).map(m => ({
            title: m.title,
            year: m.release_date ? new Date(m.release_date).getFullYear() : 2024,
            rating: m.vote_average,
            tmdbPosterPath: m.poster_path || ''
          }));
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      system: `You are a film expert. Return ONLY a raw JSON array of exactly 8 films similar to "${title}" (Genre DNA: ${genresStr}). No code blocks, no preamble, only JSON.
Each object must contain exactly:
"title" : string (English title)
"year" : number
"rating" : number (1-10)
"tmdbPosterPath" : string (TMDB path or empty string if unsure)`,
      messages: [{ role: 'user', content: `Provide 8 similar films to "${title}" (${genresStr})` }],
    });

    const text = response.content[0].text;
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error fetching similar movies from Claude:', error);
    return [];
  }
};

/**
 * Returns a streaming-style film analysis: themes, legacy, trivia, similarDirectors
 * @param {string} title 
 * @param {number|string} year 
 */
export const getMovieInsight = async (title, year) => {
  const defaultInsight = {
    themes: "Explores complex narrative structures, human character study, and deep philosophical concepts.",
    legacy: "Remains a highly praised benchmark in modern cinematography and continues to influence young directors globally.",
    trivia: "The director preferred shooting on physical film to preserve organic visual texture and scale.",
    similarDirectors: ["Christopher Nolan", "Denis Villeneuve", "David Fincher"]
  };

  if (!anthropic) {
    return defaultInsight;
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      system: `You are an expert film historian. Provide a JSON analysis of "${title}" (${year}). Respond with ONLY the raw JSON object - no formatting, no preamble.
The JSON must match exactly:
{
  "themes": "A short paragraph about core themes (max 180 chars)",
  "legacy": "A short paragraph about why it endures (max 180 chars)",
  "trivia": "A fascinating behind-the-scenes trivia fact (max 180 chars)",
  "similarDirectors": ["Director Name 1", "Director Name 2"]
}`,
      messages: [{ role: 'user', content: `Analyze "${title}" (${year})` }],
    });

    const text = response.content[0].text;
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error fetching insights from Claude:', error);
    return defaultInsight;
  }
};

export default {
  getMovieRecommendations,
  getMoodRecommendations,
  getSimilarMovies,
  getMovieInsight
};
