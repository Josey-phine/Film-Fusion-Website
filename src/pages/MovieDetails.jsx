import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchMovieWithDetails, IMAGE_BASE_URL } from '../services/tmdb';
import { FavoritesContext } from '../context/FavoritesContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useWatchHistory } from '../context/WatchHistoryContext';
import { useReviews } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext';
import CommentsSection from "../components/CommentsSection"

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { reviews, fetchMovieReviews, addReview, deleteReview, loading: reviewsLoading } = useReviews();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (id) {
      fetchMovieReviews(id);
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    await addReview(id, rating, reviewText);
    setReviewText("");
    setRating(5);
  };

  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { addToHistory } = useWatchHistory();

  const isWatchlisted = watchlist?.some((item) => item.id === movie?.id);

  useEffect(() => {
    const getDetails = async () => {
      setLoading(true);
      const data = await fetchMovieWithDetails(id);
      setMovie(data);
      if (data && data.success !== false) {
        addToHistory(data);
      }
      setLoading(false);
      window.scrollTo(0, 0);
    };
    getDetails();
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-xl text-amber-400 animate-pulse">Loading Details...</div>;
  if (!movie || movie.success === false) return <div className="text-center mt-10 text-xl text-pink">Movie not found.</div>;

  const trailer = movie.videos?.results?.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube') || movie.videos?.results?.[0];
  const director = movie.credits?.crew?.find(member => member.job === 'Director');
  const topCast = movie.credits?.cast?.slice(0, 10) || [];
  const similarMovies = movie.similar?.results?.slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-slate hover:text-amber-400 transition-colors font-semibold flex items-center gap-2"
      >
        <span>←</span> Back
      </button>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12 bg-slate/10 p-6 rounded-2xl border border-slate/30">
        <img
          src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
          alt={movie.title}
          className="w-full md:w-80 rounded-xl shadow-lg object-cover"
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => isWatchlisted ? removeFromWatchlist(movie) : addToWatchlist(movie)}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 shadow-lg border border-slate/40 flex items-center gap-2 ${
                  isWatchlisted 
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-500' 
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Toggle Watchlist"
              >
                {isWatchlisted ? '✓ Watchlisted' : '+ Watchlist'}
              </button>

              <button
                onClick={() => toggleFavorite(movie)}
                className="p-3 bg-navy rounded-full hover:bg-slate/80 hover:scale-110 transition-all duration-200 text-2xl shadow-lg shadow-cyan/10 border border-slate/40"
                title="Toggle Favorite"
              >
                {isFavorite(movie.id) ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
          
          <p className="text-slate text-sm mb-6 font-medium italic">{movie.tagline}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genres?.map(g => (
              <span key={g.id} className="px-3 py-1 bg-amber-400/20 text-amber-400 rounded text-xs font-semibold border border-amber-400/30">
                {g.name}
              </span>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-cyan mb-2">Overview</h3>
            <p className="text-slate leading-relaxed">{movie.overview}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-slate">
            <div>
              <span className="block text-white font-semibold">Rating</span>
              ⭐ {movie.vote_average?.toFixed(1)} / 10
            </div>
            <div>
              <span className="block text-white font-semibold">Release Date</span>
              {movie.release_date}
            </div>
            <div>
              <span className="block text-white font-semibold">Director</span>
              {director ? (
                <Link to={`/person/${director.id}`} className="text-amber-400 hover:underline">
                  {director.name}
                </Link>
              ) : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {trailer && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-cyan pl-3">Official Trailer</h2>
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate/30">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {/* Cast & Crew Section */}
      {topCast.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-cyan pl-3">Top Cast</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {topCast.map(actor => (
              <Link
                key={actor.id}
                to={`/person/${actor.id}`}
                className="min-w-[140px] bg-slate/20 rounded-xl overflow-hidden border border-slate/40 hover:border-amber-400 hover:scale-105 transition-all group"
              >
                <img
                  src={actor.profile_path ? `${IMAGE_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/300x450?text=No+Photo'}
                  alt={actor.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <h4 className="font-semibold text-white text-sm truncate group-hover:text-amber-400">{actor.name}</h4>
                  <p className="text-xs text-slate truncate mt-1">{actor.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ratings & Reviews Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h3 className="text-2xl font-bold text-white mb-6">Ratings & Reviews</h3>

        {/* Review Submission Form */}
        {user ? (
          <form onSubmit={handleSubmitReview} className="bg-dark/50 border border-gray-800 p-6 rounded-xl mb-8">
            <h4 className="text-lg font-semibold text-white mb-3">Leave a Review</h4>
            
            {/* Star Selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400 text-sm">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-xl ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Review Textarea */}
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think of the movie?"
              rows="3"
              className="w-full bg-darker border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan mb-4"
              required
            />

            <button
              type="submit"
              className="bg-cyan text-darker font-bold px-6 py-2 rounded-lg hover:bg-cyan/80 transition-colors"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <p className="text-gray-400 mb-8">Please log in to leave a review.</p>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-dark/30 border border-gray-800/60 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{rev.userName}</span>
                    <span className="text-yellow-400 text-sm">{"★".repeat(rev.rating)}</span>
                  </div>
                  {user && user.uid === rev.userId && (
                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="text-xs text-pink hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{rev.reviewText}</p>
              </div>
            ))
          )}
        </div>
      </div>
      

      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-cyan pl-3">Similar Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {similarMovies.map(similar => (
              <Link
                key={similar.id}
                to={`/movie/${similar.id}`}
                className="relative bg-slate/30 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-cyan/10 transition-all duration-300 border border-slate/40 group"
              >
                <img
                  src={similar.poster_path ? `${IMAGE_BASE_URL}${similar.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={similar.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate text-white group-hover:text-cyan">{similar.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-8">  
          <CommentsSection movieId={id} />
        </div>
     </div>
  );
}