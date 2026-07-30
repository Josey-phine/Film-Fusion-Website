import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchTrendingMovies,
  fetchSearchMovies,
  fetchMoviesByCategory,
  fetchGenres,
  fetchMoviesByGenre,
  IMAGE_BASE_URL
} from '../services/tmdb';
import { FavoritesContext } from '../context/FavoritesContext';
import { useWatchHistory } from '../context/WatchHistoryContext';
import RecommendedMovies from '../components/RecommendedMovies';

const CATEGORIES = [
  { id: 'trending', label: 'Trending' },
  { id: 'popular', label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'upcoming', label: 'Upcoming' }
];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [activeGenre, setActiveGenre] = useState(null);
  const { history, clearHistory, removeFromHistory } = useWatchHistory();

  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  // Load initial data (Trending + Genres list)
  useEffect(() => {
    const loadInitialData = async () => {
      const [trendingData, genreData] = await Promise.all([
        fetchTrendingMovies(),
        fetchGenres()
      ]);
      setMovies(trendingData);
      setGenres(genreData);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const loadCategoryMovies = async (categoryId) => {
    setLoading(true);
    setIsSearching(false);
    setSearchQuery('');
    setActiveGenre(null); // Clear active genre
    setActiveCategory(categoryId);

    const data = categoryId === 'trending'
      ? await fetchTrendingMovies()
      : await fetchMoviesByCategory(categoryId);

    setMovies(data);
    setLoading(false);
  };

  const loadGenreMovies = async (genreId) => {
    setLoading(true);
    setIsSearching(false);
    setSearchQuery('');
    setActiveCategory(''); // Clear active category
    setActiveGenre(genreId);

    const data = await fetchMoviesByGenre(genreId);
    setMovies(data);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadCategoryMovies('trending');
      return;
    }
    setLoading(true);
    setActiveCategory('');
    setActiveGenre(null);
    const data = await fetchSearchMovies(searchQuery);
    setMovies(data);
    setIsSearching(true);
    setLoading(false);
  };

  // Helper to determine the header title
  const getHeaderTitle = () => {
    if (isSearching) return `Search Results for "${searchQuery}"`;
    if (activeCategory) {
      return activeCategory === 'trending' ? 'Trending Movies' : `${activeCategory.replace('_', ' ')} Movies`;
    }
    if (activeGenre) {
      const genreName = genres.find(g => g.id === activeGenre)?.name;
      return `${genreName} Movies`;
    }
    return 'Movies';
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-slate/20 text-white border border-slate/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-cyan text-navy font-bold rounded-lg hover:bg-cyan/80 hover:scale-105 transition-all duration-200"
        >
          Search
        </button>
      </form>

      {/* Categories & Genres Filters */}
      {!isSearching && (
        <div className="flex flex-col gap-4 mb-8">
          {/* Main Categories (Primary Color: Cyan) */}
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => loadCategoryMovies(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 border ${
                  activeCategory === cat.id
                    ? 'bg-cyan text-navy border-cyan shadow-lg shadow-cyan/20'
                    : 'bg-transparent text-slate border-slate/40 hover:border-cyan hover:text-cyan'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Genres (Secondary Color: Amber) */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => loadGenreMovies(genre.id)}
                className={`px-3 py-1.5 whitespace-nowrap rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 border ${
                  activeGenre === genre.id
                    ? 'bg-amber-400 text-navy border-amber-400 shadow-md shadow-amber-400/20'
                    : 'bg-transparent text-slate border-slate/50 hover:border-amber-400 hover:text-amber-400'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Movies Section */}
      {!isSearching && (
        <div className="mb-12">
          <RecommendedMovies />
        </div>
      )}

      {/* Dynamic Header */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white capitalize">
          {getHeaderTitle()}
        </h1>
        {isSearching && (
          <button
            onClick={() => loadCategoryMovies('trending')}
            className="text-amber-400 hover:text-amber-300 transition-colors text-sm underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center mt-10 text-xl text-amber-400 animate-pulse">Loading...</div>
      ) : movies.length === 0 ? (
        <div className="text-center mt-10 text-xl text-pink">No movies found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="relative bg-slate/30 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-cyan/10 transition-all duration-300 border border-slate/40 flex flex-col group"
            >
              <Link to={`/movie/${movie.id}`} className="block flex-1 cursor-pointer">
                <img
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={movie.title}
                  className="w-full h-80 object-cover"
                />
                <div className="p-4">
                  <h2 className="font-semibold text-lg truncate text-white group-hover:text-cyan transition-colors">{movie.title}</h2>
                  <p className="text-amber-400 text-sm mt-1">⭐ {movie.vote_average?.toFixed(1)} / 10</p>
                </div>
              </Link>

              <button
                onClick={() => toggleFavorite(movie)}
                className="absolute top-2 right-2 p-2 bg-navy/80 rounded-full hover:bg-navy hover:scale-110 transition-all duration-200 text-xl backdrop-blur-sm z-10 shadow-lg"
                title="Toggle Favorite"
              >
                {isFavorite(movie.id) ? '❤️' : '🤍'}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* --- RECENTLY VIEWED SECTION --- */}
      {history && history.length > 0 && (
        <div className="mt-16 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white border-l-4 border-cyan pl-3">Recently Viewed</h2>
            
            {/* Clear All Button */}
            <button
              onClick={clearHistory}
              className="text-sm font-semibold text-pink hover:text-red-400 transition-colors border border-pink/30 hover:border-red-400/50 rounded-full px-4 py-1.5"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {history.map((movie) => (
              <div key={movie.id} className="relative min-w-[160px] md:min-w-[200px] group">
                
                <Link
                  to={`/movie/${movie.id}`}
                  className="block bg-slate/30 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan/10 transition-all duration-300 border border-slate/40"
                >
                  <img
                    src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-64 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4 rounded-b-xl">
                    <h3 className="font-semibold text-sm truncate text-white group-hover:text-cyan">{movie.title}</h3>
                  </div>
                </Link>

                {/* Specific Remove (X) Button - Appears on hover */}
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevents the <Link> from navigating
                    removeFromHistory(movie);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-slate-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-pink hover:scale-110 z-10 shadow-lg border border-white/10"
                  title="Remove from history"
                >
                  ✕
                </button>
                
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}