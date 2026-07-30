import { API_KEY, BASE_URL } from "./tmdb";

// Helper to fetch movies by genre ID
export async function getMoviesByGenres(genreIds) {
  if (!genreIds || genreIds.length === 0) return [];

  try {
    // Take up to 2 top genre IDs to query TMDB
    const selectedGenres = genreIds.slice(0, 2).join(",");
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenres}&sort_by=popularity.desc`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    return [];
  }
}

// Function to calculate top genres from user's favorites & history
export function getTopUserGenres(favorites = [], history = []) {
  const genreCounts = {};

  // Combine user's movies from both lists
  const allMovies = [...favorites, ...history];

  allMovies.forEach((movie) => {
    const genres = movie.genre_ids || movie.genres?.map((g) => g.id) || [];

    genres.forEach((genreId) => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
    });
  });

  // Sort genres by frequency (highest first)
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => Number(entry[0]));

  return sortedGenres;
}