import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FavoritesContext } from '../context/FavoritesContext';
import { IMAGE_BASE_URL } from '../services/tmdb';

export default function Favorites() {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6 text-pink">My Favorite Movies</h1>
        <p className="text-slate text-xl">
          You haven't saved any movies yet. Go back to the home page and click some hearts!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      <h1 className="text-3xl font-bold mb-6 text-pink">My Favorite Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {favorites.map((movie) => (
          <div 
            key={movie.id} 
            className="relative bg-slate/30 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 border border-slate/40 flex flex-col"
          >
            {/* Clickable Area Navigating to Movie Details */}
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
            
            {/* Remove from Favorites Button (Kept separate from Link) */}
            <button
              onClick={() => toggleFavorite(movie)}
              className="absolute top-2 right-2 p-2 bg-navy/80 rounded-full hover:bg-navy transition-colors text-xl backdrop-blur-sm z-10"
              title="Remove Favorite"
            >
              ❤️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}