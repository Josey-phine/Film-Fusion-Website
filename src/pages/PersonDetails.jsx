import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPersonDetails, IMAGE_BASE_URL } from '../services/tmdb';

export default function PersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetails = async () => {
      setLoading(true);
      const data = await fetchPersonDetails(id);
      setPerson(data);
      setLoading(false);
      window.scrollTo(0, 0); // Scroll to top on load
    };
    getDetails();
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-xl text-amber-400 animate-pulse">Loading Profile...</div>;
  if (!person || person.success === false) return <div className="text-center mt-10 text-xl text-pink">Person not found.</div>;

  // Sort movies by release date (newest first) or popularity
  const knownFor = person.movie_credits?.cast?.sort((a, b) => b.popularity - a.popularity).slice(0, 15) || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 text-slate hover:text-amber-400 transition-colors font-semibold flex items-center gap-2"
      >
        <span>←</span> Back
      </button>

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12 bg-slate/10 p-6 rounded-2xl border border-slate/30">
        <img 
          src={person.profile_path ? `${IMAGE_BASE_URL}${person.profile_path}` : 'https://via.placeholder.com/400x600?text=No+Photo'} 
          alt={person.name}
          className="w-full md:w-80 rounded-xl shadow-lg object-cover"
        />
        
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{person.name}</h1>
          <h2 className="text-xl text-cyan mb-6 font-medium">{person.known_for_department}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate mb-6 bg-navy/30 p-4 rounded-lg border border-slate/40">
            <div>
              <span className="block text-white font-semibold">Born</span>
              {person.birthday ? person.birthday : 'Unknown'}
            </div>
            <div>
              <span className="block text-white font-semibold">Place of Birth</span>
              {person.place_of_birth ? person.place_of_birth : 'Unknown'}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2 border-l-4 border-amber-400 pl-3">Biography</h3>
            <div className="text-slate leading-relaxed max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {person.biography ? (
                <p className="whitespace-pre-line">{person.biography}</p>
              ) : (
                <p className="italic">We do not have a biography for {person.name}.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Known For (Movies) */}
      {knownFor.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan pl-3">Known For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {knownFor.map(movie => (
              <Link 
                key={movie.id} 
                to={`/movie/${movie.id}`}
                className="relative bg-slate/30 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-amber-400/20 transition-all duration-300 border border-slate/40 flex flex-col group"
              >
                <img 
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'} 
                  alt={movie.title}
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="font-semibold text-sm text-white group-hover:text-amber-400 mb-1">{movie.title}</h3>
                  <p className="text-xs text-slate truncate">as {movie.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}