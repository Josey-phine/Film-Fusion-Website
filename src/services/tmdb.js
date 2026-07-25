const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const fetchTrendingMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

export const fetchSearchMovies = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

export const fetchMoviesByCategory = async (category) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching ${category} movies:`, error);
    return [];
  }
};

export const fetchGenres = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

export const fetchMoviesByGenre = async (genreId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&page=1`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreId}:`, error);
    return [];
  }
};

export const fetchMovieWithDetails = async (id) => {
  try {
    // append_to_response combines multiple endpoints into one call
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits,similar`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching rich movie details:", error);
    return null;
  }
};

export const fetchPersonDetails = async (personId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=en-US&append_to_response=movie_credits`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching person details:", error);
    return null;
  }
};