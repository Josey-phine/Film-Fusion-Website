import { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth} from './AuthContext'; 

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('filmfusion-favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const { user } = useAuth();

  // 1. Fetch favorites from Firestore when user logs in
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().favorites) {
            setFavorites(userDoc.data().favorites);
          }
        } catch (error) {
          console.error("Error fetching favorites from Firestore:", error);
        }
      }
    };

    fetchUserFavorites();
  }, [user]);

  // 2. Save favorites to localStorage and Firestore whenever they change
  useEffect(() => {
    localStorage.setItem('filmfusion-favorites', JSON.stringify(favorites));

    const saveUserFavorites = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          // Using merge: true to avoid overwriting other user fields like watchlist later
          await setDoc(userDocRef, { favorites }, { merge: true });
        } catch (error) {
          console.error("Error saving favorites to Firestore:", error);
        }
      }
    };

    saveUserFavorites();
  }, [favorites, user]);

  const toggleFavorite = (movie) => {
    setFavorites((prevFavorites) => {
      const isFavorited = prevFavorites.some((fav) => fav.id === movie.id);
      if (isFavorited) {
        return prevFavorites.filter((fav) => fav.id !== movie.id);
      } else {
        return [...prevFavorites, movie];
      }
    });
  };

  const isFavorite = (movieId) => {
    return favorites.some((fav) => fav.id === movieId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}