import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrendingMovies, fetchSearchMovies, fetchMoviesByCategory, IMAGE_BASE_URL } from '../services/tmdb';
import { FavoritesContext } from '../context/FavoritesContext';

// Define our categories array for easy rendering
const CATEGORIES = [
  { id: 'trending', label: 'Trending' },
  { id: 'popular', label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'upcoming', label: 'Upcoming' }
];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('trending');
  
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  const loadCategoryMovies = async (categoryId) => {
    setLoading(true);
    setIsSearching(false);
    setSearchQuery('');
    setActiveCategory(categoryId);

    let data;
    if (categoryId === 'trending') {
      data = await fetchTrendingMovies();
    } else {
      data = await fetchMoviesByCategory(categoryId);
    }
    
    setMovies(data);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadCategoryMovies('trending');
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadCategoryMovies('trending');
      return;
    }
    setLoading(true);
    setActiveCategory(''); // Clear active category highlight while searching
    const data = await fetchSearchMovies(searchQuery);
    setMovies(data);
    setIsSearching(true);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg bg-slate/20 text-white border border-slate/40 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
        />
        <button 
          type="submit"
          className="px-6 py-3 bg-cyan/80 text-navy font-bold rounded-lg hover:bg-cyan transition-colors"
        >
          Search
        </button>
      </form>

      {/* Category Filters */}
      {!isSearching && (
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => loadCategoryMovies(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all-duration-200 hover:scale-105 border ${
                activeCategory === cat.id
                  ? 'bg-cyan text-navy border-cyan'
                  : 'bg-transparent text-slate border-slate/40 hover:border-cyan hover:text-cyan'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Header */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-cyan capitalize">
          {isSearching ? `Search Results for "${searchQuery}"` : 
           activeCategory === 'trending' ? 'Trending Movies' : 
           `${activeCategory.replace('_', ' ')} Movies`}
        </h1>
        {isSearching && (
          <button 
            onClick={() => loadCategoryMovies('trending')}
            className="text-slate hover:text-white transition-colors text-sm underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center mt-10 text-xl text-slate">Loading...</div>
      ) : movies.length === 0 ? (
        <div className="text-center mt-10 text-xl text-pink">No movies found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="relative bg-slate/30 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 border border-slate/40 flex flex-col"
            >
              <Link to={`/movie/${movie.id}`} className="block flex-1 cursor-pointer">
                <img 
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'} 
                  alt={movie.title}
                  className="w-full h-80 object-cover"
                />
                <div className="p-4">
                  <h2 className="font-semibold text-lg truncate text-white">{movie.title}</h2>
                  <p className="text-slate text-sm mt-1">⭐ {movie.vote_average?.toFixed(1)} / 10</p>
                </div>
              </Link>
              
              <button
                onClick={() => toggleFavorite(movie)}
                className="absolute top-2 right-2 p-2 bg-navy/80 rounded-full hover:bg-navy transition-colors text-xl backdrop-blur-sm z-10"
                title="Toggle Favorite"
              >
                {isFavorite(movie.id) ? '❤️' : '🤍'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}