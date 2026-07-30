import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useWatchHistory } from "../context/WatchHistoryContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { getTopUserGenres, getMoviesByGenres } from "../services/recommendations";
import { fetchTrendingMovies, IMAGE_BASE_URL } from "../services/tmdb";

export default function RecommendedMovies() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { history } = useWatchHistory();
  const { favorites } = useContext(FavoritesContext);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const topGenres = getTopUserGenres(favorites, history);

        let movies = [];
        if (topGenres.length > 0) {
          movies = await getMoviesByGenres(topGenres);
          
          const watchedOrFavIds = new Set([
            ...history.map((m) => m.id),
            ...favorites.map((m) => m.id),
          ]);

          movies = movies.filter((movie) => !watchedOrFavIds.has(movie.id));
        }

        if (movies.length === 0) {
          movies = await fetchTrendingMovies();
        }

        setRecommendations(movies.slice(0, 10));
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [favorites, history]);

  if (!loading && recommendations.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan pl-3">
        Recommended For You
      </h2>

      {loading ? (
        <div className="text-slate text-center py-6">Loading recommendations...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recommendations.map((movie) => (
            <div 
              key={movie.id} 
              className="relative bg-slate/30 rounded-xl overflow-hidden shadow-lg border border-slate/40 group flex flex-col hover:border-cyan/50 transition-colors"
            >
              <Link to={`/movie/${movie.id}`}>
                <img
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={movie.title}
                  className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <Link to={`/movie/${movie.id}`}>
                  <h3 className="font-bold text-white text-sm line-clamp-2 hover:text-cyan transition-colors">
                    {movie.title}
                  </h3>
                </Link>
                <p className="text-slate text-xs mt-2">⭐ {movie.vote_average?.toFixed(1)} / 10</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}