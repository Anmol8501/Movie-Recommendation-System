import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Instagram, Cpu } from 'lucide-react';

/**
 * Cinematic footer containing platform links, social references, and TMDB/Claude attributions.
 */
export const Footer = () => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.06] px-6 sm:px-12 py-12 text-muted font-body text-xs sm:text-sm select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
        
        {/* Column 1: Logo & Socials */}
        <div className="space-y-4">
          <span className="font-title text-2xl font-extrabold tracking-widest bg-gradient-to-r from-red to-purple bg-clip-text text-transparent">
            CINEMATCH AI
          </span>
          <p className="text-xs text-[#999999] leading-relaxed max-w-sm mx-auto md:mx-0">
            A production-grade cinematic movie discovery engine. Tell us your mood, drop a description, and let the AI find your next favorite watch.
          </p>
          <div className="flex justify-center md:justify-start gap-4 text-white/50">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-red transition-colors" aria-label="CineMatch AI Twitter Profile">
              <Twitter size={16} />
            </a>
            <a href="https://github.com/Anmol8501/Movie-Recommendation-System" target="_blank" rel="noopener noreferrer" className="hover:text-red transition-colors" aria-label="CineMatch AI Github Project">
              <Github size={16} />
            </a>
            <a href="https://www.instagram.com/anmo_lkuntal" target="_blank" rel="noopener noreferrer" className="hover:text-red transition-colors" aria-label="CineMatch AI Instagram Page">
              <Instagram size={16} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
            Quick Navigation
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs max-w-xs mx-auto md:mx-0">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <a href="#genres" className="hover:text-white transition-colors">Genres</a>
            <Link to="/watchlist" className="hover:text-white transition-colors">Watchlist</Link>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-about-modal'))} 
              className="hover:text-white transition-colors text-left focus:outline-none"
            >
              About Us
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))} 
              className="hover:text-white transition-colors text-left focus:outline-none"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Column 3: Powered by */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
            Technology integrations
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white">
              <Cpu size={16} className="text-purple" />
              <span className="text-xs font-bold font-body tracking-wide">Anthropic Claude AI Brain</span>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="The Movie Database Logo"
                className="h-4 object-contain select-none"
              />
              <p className="text-[10px] text-[#999999] leading-tight text-center md:text-left">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/[0.04] text-center text-[10px] sm:text-xs text-[#999999] flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2025 CineMatch AI. Built with Claude + TMDB. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
