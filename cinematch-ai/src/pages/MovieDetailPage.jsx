import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart, ArrowLeft, Calendar, Clock, Star, Sparkles } from 'lucide-react';
import tmdbService from '../services/tmdb';
import claudeService from '../services/claude';
import useWatchlist from '../hooks/useWatchlist';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SimilarMoviesRow from '../components/SimilarMoviesRow';
import TrailerModal from '../components/TrailerModal';
import { formatRuntime, formatRating } from '../utils/helpers';

// Helper component to stream text like Claude's output
const StreamingText = ({ text, delay = 15 }) => {
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    setCurrentText('');
    if (!text) return;

    let index = 0;
    const interval = setInterval(() => {
      setCurrentText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  return <span>{currentText}</span>;
};

export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggle } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchMovieData = async () => {
      setLoading(true);
      setInsight(null);
      try {
        const details = await tmdbService.getMovieDetails(id);
        if (!active || !details) return;

        setMovie(details);

        // Extract YouTube trailer key
        const videos = details.videos?.results || [];
        const officialTrailer = videos.find(
          v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        setTrailerKey(officialTrailer ? officialTrailer.key : (videos[0]?.key || ''));

        // Fetch AI Insight for movie
        const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : '2024';
        setInsightLoading(true);
        const aiInsight = await claudeService.getMovieInsight(details.title, releaseYear);
        if (active && aiInsight) {
          setInsight(aiInsight);
        }
        setInsightLoading(false);
      } catch (err) {
        console.error('Error loading movie details:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMovieData();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-red animate-spin" />
            <span className="text-sm text-muted font-body font-semibold tracking-wider animate-pulse">Loading cinematic data...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-6xl">🎞️</span>
          <h2 className="text-xl font-bold font-body">Movie Not Found</h2>
          <p className="text-sm text-muted max-w-sm">We couldn't retrieve the details of this movie from TMDB database.</p>
          <button onClick={() => navigate(-1)} className="bg-red text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-red/80 transition-colors">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const directorName = movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown';
  const saved = isSaved(movie.id, movie.title);

  // Wrap details movie object into custom format for watchlists
  const watchlistMovieObj = {
    id: movie.id,
    title: movie.title,
    year: releaseYear,
    rating: movie.vote_average,
    genre: movie.genres?.[0]?.name || 'Drama',
    tmdbPosterPath: movie.poster_path
  };

  return (
    <div className="min-h-screen bg-dark text-text flex flex-col justify-between">
      <Navbar />

      {/* 1. HERO BACKDROP AREA */}
      <section className="relative min-h-[600px] lg:h-[75vh] w-full flex items-end pt-24 pb-12 px-6 sm:px-12 bg-dark">
        {/* Full-width backdrop image blur/fade */}
        <div 
          className="absolute inset-0 bg-cover bg-top bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: `url('${tmdbService.getBackdropUrl(movie.backdrop_path)}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/40 to-transparent pointer-events-none" />

        {/* Floating movie details card inside hero */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-end select-none">
          {/* Poster Left */}
          <div className="w-[180px] sm:w-[240px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 bg-surface">
            {movie.poster_path ? (
              <img 
                src={tmdbService.getPosterUrl(movie.poster_path, 'w500')} 
                alt={`${movie.title} poster`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-title text-4xl bg-surface text-muted">🎬</div>
            )}
          </div>

          {/* Details Right */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            {/* Header / Title */}
            <div className="space-y-1">
              <h1 className="font-title text-4xl sm:text-5xl lg:text-6.5xl font-black leading-none tracking-wide text-white uppercase">
                {movie.title}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted font-medium pt-1">
                <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  <Star size={13} fill="currentColor" /> {formatRating(movie.vote_average)}
                </span>
                <span className="flex items-center gap-1"><Calendar size={13} /> {releaseYear}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {formatRuntime(movie.runtime)}</span>
                <span>·</span>
                <span>Dir: <span className="text-white font-semibold">{directorName}</span></span>
              </div>
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {movie.genres?.map(g => (
                <span key={g.id} className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/90">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview description */}
            <p className="max-w-2xl text-xs sm:text-sm text-white/80 leading-relaxed font-light">
              {movie.overview || "No overview available for this film."}
            </p>

            {/* Actions button row */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              {/* Back Button */}
              <button 
                onClick={() => navigate(-1)} 
                className="px-4 py-2.5 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-xs sm:text-sm font-semibold"
              >
                <ArrowLeft size={16} /> Back
              </button>

              {/* Watch Trailer */}
              <button 
                onClick={() => setIsTrailerOpen(true)}
                className="px-5 py-2.5 rounded-full bg-red hover:bg-red/90 text-white font-semibold flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-red/20 transition-all duration-200 hover:scale-102"
              >
                <Play size={16} fill="currentColor" /> Watch Trailer
              </button>

              {/* Watchlist Toggle */}
              <button 
                onClick={() => toggle(watchlistMovieObj)}
                className={`px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 text-xs sm:text-sm transition-all duration-200 ${
                  saved 
                    ? 'bg-purple text-white shadow-lg shadow-purple/20' 
                    : 'border border-white/15 bg-black/40 text-white hover:bg-white/5'
                }`}
              >
                <Heart size={16} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-white' : 'text-muted'} />
                {saved ? 'Saved in Watchlist' : 'Save to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI INSIGHT PANEL */}
      <section className="w-full px-6 sm:px-12 py-10 bg-dark select-none">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl p-6 sm:p-8 bg-card border border-purple/35 overflow-hidden shadow-2xl">
            {/* Background glowing decorations */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-red/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 text-purple-300 font-semibold mb-6">
              <Sparkles size={18} className="text-purple animate-pulse" />
              <span className="text-xs sm:text-sm tracking-wider uppercase font-bold">CineMatch AI Critic Insight</span>
            </div>

            {insightLoading ? (
              // Typewriting / Insight Loading state
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple animate-ping" />
                  <span className="text-xs text-muted font-medium">AI is generating thematic insights...</span>
                </div>
                <div className="space-y-2">
                  <div className="shimmer h-4 rounded w-4/5" />
                  <div className="shimmer h-4 rounded w-3/5" />
                  <div className="shimmer h-4 rounded w-5/6" />
                </div>
              </div>
            ) : insight ? (
              // INSIGHT SUCCESS WITH TYPEWRITING STREAMING
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-xs sm:text-sm leading-relaxed">
                
                {/* Themes */}
                <div className="space-y-2 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6">
                  <h4 className="text-white font-bold tracking-wide uppercase">Core Themes</h4>
                  <p className="text-white/80 font-light">
                    <StreamingText text={insight.themes} />
                  </p>
                </div>

                {/* Legacy */}
                <div className="space-y-2 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6">
                  <h4 className="text-white font-bold tracking-wide uppercase">Why It Endures</h4>
                  <p className="text-white/80 font-light">
                    <StreamingText text={insight.legacy} />
                  </p>
                </div>

                {/* Trivia */}
                <div className="space-y-2">
                  <h4 className="text-white font-bold tracking-wide uppercase">Behind the Scenes</h4>
                  <p className="text-white/80 font-light">
                    <StreamingText text={insight.trivia} />
                  </p>
                  {insight.similarDirectors && insight.similarDirectors.length > 0 && (
                    <div className="pt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-muted uppercase font-bold">Similar styles:</span>
                      {insight.similarDirectors.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-purple-300 border border-white/[0.04]">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <p className="text-xs text-muted">Thematic insights are temporarily unavailable.</p>
            )}
          </div>
        </div>
      </section>

      {/* 3. CAST ROW */}
      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <section className="w-full px-6 sm:px-12 py-10 bg-dark select-none">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">CREDITS</span>
              <h2 className="font-title text-2xl text-white tracking-wide">Featured Cast</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto thin-scrollbar pb-3 cursor-grab select-none">
              {movie.credits.cast.slice(0, 12).map((actor, index) => (
                <div 
                  key={actor.id || actor.name || index} 
                  className="flex-shrink-0 w-28 text-center flex flex-col items-center gap-2"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 shadow-lg bg-surface">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                        alt={actor.name} 
                        loading="lazy"
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-surface text-muted">👤</div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white truncate w-24 leading-snug">{actor.name}</h4>
                    <p className="text-[10px] text-muted truncate w-24 leading-snug">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. SIMILAR MOVIES ROW */}
      <div className="max-w-7xl mx-auto w-full">
        <SimilarMoviesRow 
          sourceTitle={movie.title} 
          sourceGenres={movie.genres?.map(g => g.name) || ['Drama']}
          movies={movie.similar?.results} 
        />
      </div>

      {/* 5. TRAILER MODAL */}
      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoKey={trailerKey} 
        title={movie.title} 
      />

      <Footer />
    </div>
  );
};

export default MovieDetailPage;
