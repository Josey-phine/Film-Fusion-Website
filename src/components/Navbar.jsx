import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-navy/90 border-b border-slate/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* App Logo / Title */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-cyan tracking-wider hover:opacity-85 transition-opacity"
        >
          FilmFusion
        </Link>

        {/* Navigation Links with Hover Effects */}
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
        </div>
      </div>
    </nav>
  );
}