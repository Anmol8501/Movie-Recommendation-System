import React, { useState, useEffect } from 'react';
import { X, Mail, Github, Instagram, Sparkles, User, Code, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AboutContactModals = () => {
  const [modalType, setModalType] = useState(null); // 'about' | 'contact' | null

  useEffect(() => {
    const openAbout = () => setModalType('about');
    const openContact = () => setModalType('contact');

    window.addEventListener('open-about-modal', openAbout);
    window.addEventListener('open-contact-modal', openContact);

    return () => {
      window.removeEventListener('open-about-modal', openAbout);
      window.removeEventListener('open-contact-modal', openContact);
    };
  }, []);

  const closeModal = () => setModalType(null);

  return (
    <AnimatePresence>
      {modalType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#0e0e12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl select-none overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-red/5 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {modalType === 'about' ? (
              /* ABOUT MODAL */
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-red font-bold">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-title">About the Platform</span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-title text-2xl text-white font-extrabold uppercase tracking-wide">
                    CineMatch AI
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-light">
                    CineMatch AI is an intelligent film discovery engine that replaces generic matching with precise semantic similarity calculations. By tokenizing and stemming movie overviews, genres, cast, crew, and keywords, the system builds a content similarity matrix that delivers highly accurate recommendations.
                  </p>
                  
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Code size={18} className="text-purple flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-white">System Architecture</h4>
                        <p className="text-[11px] text-[#999999] leading-relaxed">
                          Powered by a Python Flask backend (running CountVectorizer & Cosine Similarity) and a React SPA client leveraging the OMDb API for high-speed poster resolution.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User size={18} className="text-red flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-white">The Creator</h4>
                        <p className="text-[11px] text-[#999999] leading-relaxed">
                          Designed and engineered by Anmol Singh, a passionate full-stack developer focused on creating clean, premium AI integrations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-lg bg-red hover:bg-red/90 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red/25"
                >
                  Explore Movies
                </button>
              </div>
            ) : (
              /* CONTACT MODAL */
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <User size={18} />
                  <span className="text-xs uppercase tracking-widest font-title">Get in Touch</span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-title text-2xl text-white font-extrabold uppercase tracking-wide">
                    Anmol Singh
                  </h3>
                  <p className="text-sm text-[#999999] leading-relaxed">
                    Have questions about the algorithm, project design, or want to collaborate? Reach out via email or connect on social media.
                  </p>

                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3.5">
                    {/* Email */}
                    <a
                      href="mailto:anmolkuntal85@gmail.com"
                      className="flex items-center gap-3 text-white/80 hover:text-red transition-colors group text-sm"
                    >
                      <Mail size={16} className="text-red" />
                      <span className="font-medium group-hover:underline">anmolkuntal85@gmail.com</span>
                    </a>

                    {/* Phone */}
                    <a
                      href="tel:+919548673526"
                      className="flex items-center gap-3 text-white/80 hover:text-red transition-colors group text-sm"
                    >
                      <Phone size={16} className="text-emerald-400" />
                      <span className="font-medium group-hover:underline">+91 95486 73526</span>
                    </a>

                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/anmo_lkuntal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/80 hover:text-red transition-colors group text-sm"
                    >
                      <Instagram size={16} className="text-purple-400" />
                      <span className="font-medium group-hover:underline">@anmo_lkuntal</span>
                    </a>

                    {/* GitHub */}
                    <a
                      href="https://github.com/Anmol8501/Movie-Recommendation-System"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/80 hover:text-red transition-colors group text-sm"
                    >
                      <Github size={16} className="text-white/60" />
                      <span className="font-medium group-hover:underline">Anmol8501 / Movie-System</span>
                    </a>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutContactModals;
