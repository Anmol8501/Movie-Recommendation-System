import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import RecommendationGrid from '../components/RecommendationGrid';
import TrendingCarousel from '../components/TrendingCarousel';
import GenreExplorer from '../components/GenreExplorer';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import SimilarMoviesRow from '../components/SimilarMoviesRow';
import Footer from '../components/Footer';
import useRecommendations from '../hooks/useRecommendations';

export const HomePage = () => {
  const { 
    recommendations, 
    loading, 
    error, 
    query, 
    fetchRecommendations, 
    clearResults 
  } = useRecommendations();

  const [currentMood, setCurrentMood] = useState('');

  // Trigger search from SearchBar inputs
  const handleSearch = (q) => {
    fetchRecommendations(q, currentMood);
  };

  // Trigger search from mood selection pills
  const handleMoodSelect = (moodId) => {
    setCurrentMood(moodId);
    
    // Map moodId to user-friendly label
    const moodLabels = {
      happy: 'Happy',
      emotional: 'Emotional',
      thriller: 'Thriller',
      romantic: 'Romantic',
      scifi: 'Sci-Fi',
      mystery: 'Mystery'
    };
    const label = moodLabels[moodId] || moodId;
    
    // Immediately fire search
    fetchRecommendations(`${label} movies`, moodId);
  };

  // Trigger search from GenreExplorer clicks
  const handleGenreClick = ({ id, name }) => {
    setCurrentMood(''); // clear active mood
    fetchRecommendations(`Best ${name} movies`, '');
  };

  // Refine action: clears inputs and scrolls page back to top
  const handleRefine = () => {
    clearResults();
    setCurrentMood('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Similar Movies Row is only visible after a recommendation is successfully fetched.
  // We use the first recommendation card as the source target.
  const hasRecommendations = recommendations && recommendations.length > 0;
  const sourceMovie = hasRecommendations ? recommendations[0] : null;

  return (
    <div className="min-h-screen bg-dark text-text flex flex-col">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Full-viewport Hero Banner */}
      <HeroSection 
        onSearch={handleSearch} 
        onMoodSelect={handleMoodSelect} 
        activeMood={currentMood} 
      />

      {/* 3. AI Results Grid (Hidden when idle) */}
      <RecommendationGrid 
        movies={recommendations} 
        loading={loading} 
        error={error} 
        query={query} 
        onRefine={handleRefine}
      />

      {/* 4. Trending Carousel */}
      <TrendingCarousel />

      {/* 5. Genre Grid Explorer */}
      <GenreExplorer onGenreClick={handleGenreClick} />

      {/* 6. Platform Analytics Dash */}
      <AnalyticsDashboard />

      {/* 7. Similar movie row (rendered after recommendation search) */}
      {hasRecommendations && sourceMovie && (
        <SimilarMoviesRow 
          sourceTitle={sourceMovie.title} 
          sourceGenres={sourceMovie.genres || [sourceMovie.genre]} 
        />
      )}

      {/* 8. Footer credits */}
      <Footer />
    </div>
  );
};

export default HomePage;
