import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import WatchlistPage from './pages/WatchlistPage';
import SearchResultsPage from './pages/SearchResultsPage';

/**
 * Main application routing configuration binding page components.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* / → <HomePage /> */}
        <Route path="/" element={<HomePage />} />
        
        {/* /movie/:id → <MovieDetailPage /> */}
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        
        {/* /watchlist → <WatchlistPage /> */}
        <Route path="/watchlist" element={<WatchlistPage />} />
        
        {/* /search → <SearchResultsPage /> */}
        <Route path="/search" element={<SearchResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
