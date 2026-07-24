import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, IMAGE_BASE_URL } from '../services/tmdb';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetails = async () => {
      const data = await fetchMovieDetails(id);
      setMovie(data);
      setLoading(false);
    };
    getDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-20 text-xl text-slate">Loading movie details...</div>;
  }

  if (!movie) {
    return <div className="text-center mt-20 text-xl text-pink">Movie not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-slate/20 text-white rounded hover:bg-slate/40 transition-colors"
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-8 bg-slate/10 p-6 rounded-xl border border-slate/30">
        {/* Movie Poster */}
        <div className="w-full md:w-1/3 flex-shrink-0">
          <img 
            src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'} 
            alt={movie.title}
            className="w-full rounded-lg shadow-xl"
          />
        </div>

        {/* Movie Info */}
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-cyan mb-2">{movie.title}</h1>
          <p className="text-slate text-sm italic mb-6">{movie.tagline}</p>
          
          <div className="flex gap-4 mb-6 text-sm">
            <span className="bg-pink/20 text-pink px-3 py-1 rounded-full border border-pink/50">
              ⭐ {movie.vote_average?.toFixed(1)} / 10
            </span>
            <span className="bg-slate/20 text-white px-3 py-1 rounded-full border border-slate/50">
              {movie.release_date?.split('-')[0]}
            </span>
            <span className="bg-slate/20 text-white px-3 py-1 rounded-full border border-slate/50">
              {movie.runtime} min
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-2">Overview</h2>
          <p className="text-slate leading-relaxed mb-6">
            {movie.overview}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {movie.genres?.map((genre) => (
              <span key={genre.id} className="text-xs bg-navy px-2 py-1 rounded text-cyan border border-cyan/30">
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}