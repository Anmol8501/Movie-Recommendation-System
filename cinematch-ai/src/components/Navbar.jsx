import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWatchlist from '../hooks/useWatchlist';
import SearchBar from './SearchBar';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  
  const { count } = useWatchlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll listener for solid background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scroll when search overlay is open
  useEffect(() => {
    if (searchOverlayOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOverlayOpen, mobileMenuOpen]);

  // Close menus on location changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOverlayOpen(false);
  }, [location.pathname]);

  const handleOverlaySearch = (query) => {
    setSearchOverlayOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Genres', path: '/#genres' },
    { label: 'Watchlist', path: '/watchlist' }
  ];

  const handleGenreScroll = (e, path) => {
    if (path === '/#genres') {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate('/#genres');
      } else {
        const el = document.getElementById('genres');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 h-16 z-50 px-6 sm:px-12 flex items-center justify-between transition-all duration-300 ${
          scrolled 
            ? 'bg-dark border-b border-white/5 shadow-lg' 
            : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        {/* Left Side: Logo */}
        <Link to="/" className="flex items-center gap-2 select-none group focus:outline-none">
          <span className="font-title text-2xl sm:text-3xl font-extrabold tracking-widest bg-gradient-to-r from-red to-purple bg-clip-text text-transparent group-hover:scale-102 transition-transform duration-200">
            CINEMATCH
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 select-none">
          {navItems.map((item) => {
            const isGenreLink = item.path === '/#genres';
            const isActive = isGenreLink 
              ? location.hash === '#genres' 
              : location.pathname === item.path && location.hash !== '#genres';

            return isGenreLink ? (
              <a
                key={item.label}
                href="#genres"
                onClick={(e) => handleGenreScroll(e, item.path)}
                className={`text-sm font-body font-medium transition-colors duration-200 hover:text-white ${
                  isActive ? 'text-white font-semibold' : 'text-white/70'
                }`}
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive: linkActive }) => 
                  `text-sm font-body font-medium relative py-1 transition-colors duration-200 hover:text-white ${
                    linkActive && location.hash !== '#genres' ? 'text-white font-semibold' : 'text-white/70'
                  }`
                }
              >
                {({ isActive: linkActive }) => (
                  <>
                    {item.label}
                    {linkActive && location.hash !== '#genres' && (
                      <motion.span 
                        layoutId="nav-underline" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-red rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 select-none">
          
          {/* Search Icon Toggle */}
          <button
            onClick={() => setSearchOverlayOpen(true)}
            aria-label="Open search menu"
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <Search size={18} />
          </button>

          {/* Watchlist Counter Button */}
          <Link
            to="/watchlist"
            aria-label={`View watchlist containing ${count} items`}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/5 relative transition-all duration-150"
          >
            <Heart size={18} />
            {count > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-red text-white text-[9px] font-bold flex items-center justify-center rounded-full"
              >
                {count}
              </motion.span>
            )}
          </Link>

          {/* Sign In ghost button */}
          <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white hover:bg-white/5 transition-all duration-150">
            <User size={12} />
            Sign In
          </button>

          {/* Mobile Hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* FULL SCREEN SEARCH OVERLAY */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark/95 backdrop-blur-xl flex flex-col justify-start pt-24 px-6"
          >
            <button
              onClick={() => setSearchOverlayOpen(false)}
              aria-label="Close search overlay"
              className="absolute top-6 right-8 p-3 rounded-full bg-white/5 hover:bg-red text-white transition-all duration-150"
            >
              <X size={20} />
            </button>
            <div className="w-full max-w-2xl mx-auto space-y-8 text-center">
              <div className="space-y-2">
                <span className="font-title text-4xl bg-gradient-to-r from-red to-purple bg-clip-text text-transparent tracking-widest">
                  CINEMATCH AI
                </span>
                <p className="text-sm text-muted">What are you in the mood to watch today?</p>
              </div>
              <SearchBar autoFocus onSearch={handleOverlaySearch} size="hero" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE IN MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[#0e0e0e] border-l border-white/5 flex flex-col p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8 select-none">
                <span className="font-title text-xl tracking-wider text-white">MENU</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full text-white/70 hover:text-white"
                  aria-label="Close menu drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Links List */}
              <div className="flex flex-col gap-5 text-lg select-none">
                {navItems.map((item) => {
                  const isGenreLink = item.path === '/#genres';
                  const isActive = isGenreLink 
                    ? location.hash === '#genres' 
                    : location.pathname === item.path && location.hash !== '#genres';

                  return isGenreLink ? (
                    <a
                      key={item.label}
                      href="#genres"
                      onClick={(e) => handleGenreScroll(e, item.path)}
                      className={`font-body font-medium transition-colors ${
                        isActive ? 'text-red font-semibold' : 'text-white/70'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`font-body font-medium transition-colors ${
                        isActive ? 'text-red font-semibold' : 'text-white/70'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Action Button */}
              <button className="mt-auto w-full flex items-center justify-center gap-2 bg-red text-white py-3 rounded-lg font-semibold hover:bg-red/80 transition-colors">
                <User size={16} />
                Sign In
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
