import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-navy/90 border-b border-slate/30 sticky top-0 z-50 backdrop-blur-md">
      {/* Updated flex container for mobile wrapping */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        
        {/* App Logo / Title */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-cyan tracking-wider hover:opacity-85 transition-opacity"
        >
          FilmFusion
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center font-medium">
          <Link 
            to="/" 
            className="text-white hover:text-cyan transition-all duration-200 hover:scale-105"
          >
            Home
          </Link>
          <Link 
            to="/favorites" 
            className="text-white hover:text-pink transition-all duration-200 hover:scale-105 flex items-center gap-1"
          >
            Favorites <span>❤️</span>
          </Link>
          <Link to="/watchlist" className="text-white hover:text-cyan font-semibold transition-colors">
            Watchlist
          </Link>

          {/* More Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-white hover:text-cyan transition-colors flex items-center gap-1 font-medium focus:outline-none py-1"
            >
              <span>More</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Content */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-navy border border-slate/30 rounded-xl shadow-2xl py-2 z-50 flex flex-col">
                <Link 
                  to="/blog" 
                  onClick={() => setDropdownOpen(false)}
                  className="px-4 py-2 hover:bg-slate/20 text-amber-400 font-medium transition-colors text-left"
                >
                  📝 Blog & Articles
                </Link>
              </div>
            )}
          </div>
        </div>

        <LoginButton/>
      </div>
    </nav>
  );
}