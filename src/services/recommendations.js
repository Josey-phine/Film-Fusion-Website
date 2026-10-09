import { API_KEY, BASE_URL } from "./tmdb";

export async function getMoviesByGenres(genreIds) {
  if (!genreIds || genreIds.length === 0) return [];

  try {
    const selectedGenres = genreIds.slice(0, 2).join(",");

    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${selectedGenres}&sort_by=popularity.desc&page=1`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    return [];
  }
}

export function getTopUserGenres(favorites = [], history = []) {
  const genreCounts = {};
  const allMovies = [...favorites, ...history];

  allMovies.forEach((movie) => {
    const genres =
      movie.genre_ids || movie.genres?.map((genre) => genre.id) || [];

    genres.forEach((genreId) => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => Number(entry[0]));

  return sortedGenres;
}