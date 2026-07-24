import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrendingMovies, fetchSearchMovies, IMAGE_BASE_URL } from '../services/tmdb';
import { FavoritesContext } from '../context/FavoritesContext';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  const loadTrending = async () => {
    setLoading(true);
    const data = await fetchTrendingMovies();
    setMovies(data);
    setIsSearching(false);
    setLoading(false);
  };

  useEffect(() => {
    loadTrending();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadTrending();
      return;
    }
    setLoading(true);
    const data = await fetchSearchMovies(searchQuery);
    setMovies(data);
    setIsSearching(true);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
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

      {/* Dynamic Header */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-cyan">
          {isSearching ? `Search Results for "${searchQuery}"` : 'Trending Movies'}
        </h1>
        {isSearching && (
          <button 
            onClick={() => {
              setSearchQuery('');
              loadTrending();
            }}
            className="text-slate hover:text-white transition-colors text-sm underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center mt-10 text-xl text-slate">Loading...</div>
      ) : movies.length === 0 ? (
        <div className="text-center mt-10 text-xl text-pink">No movies found for that search.</div>
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