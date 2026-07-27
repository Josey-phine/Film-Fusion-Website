import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { IMAGE_BASE_URL } from '../services/tmdb';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-cyan pl-3">My Watchlist</h1>
      
      {watchlist?.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-slate text-xl">Your watchlist is empty.</p>
          <Link to="/" className="inline-block mt-4 text-amber-400 hover:text-amber-500 underline font-semibold">
            Explore movies to add!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {watchlist.map((movie) => (
            <div key={movie.id} className="relative bg-slate/30 rounded-xl overflow-hidden shadow-lg border border-slate/40 group flex flex-col hover:border-cyan/50 transition-colors">
              <Link to={`/movie/${movie.id}`}>
                <img
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={movie.title}
                  className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <Link to={`/movie/${movie.id}`}>
                  <h3 className="font-bold text-white text-sm line-clamp-2 hover:text-cyan transition-colors">{movie.title}</h3>
                </Link>
                <button 
                  onClick={() => removeFromWatchlist(movie)}
                  className="mt-4 w-full py-2 bg-slate-800 text-white hover:bg-pink-600 rounded-lg text-sm font-semibold transition-colors border border-slate-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}