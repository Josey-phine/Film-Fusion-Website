import { useEffect, useState } from 'react';
import { fetchTrendingMovies, IMAGE_BASE_URL } from '../services/tmdb';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMovies = async () => {
      const data = await fetchTrendingMovies();
      setMovies(data);
      setLoading(false);
    };
    getMovies();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-xl text-slate">Loading trending movies...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      <h1 className="text-3xl font-bold mb-6 text-cyan">Trending Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div 
            key={movie.id} 
            className="bg-slate/30 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer border border-slate/40"
          >
            <img 
              src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'} 
              alt={movie.title}
              className="w-full h-80 object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold text-lg truncate text-white">{movie.title}</h2>
              <p className="text-slate text-sm mt-1">⭐ {movie.vote_average?.toFixed(1)} / 10</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}