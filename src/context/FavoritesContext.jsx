import { createContext, useState, useEffect, useContext } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null);

  const { user } = useAuth();

  const storageKey = user
    ? `filmfusion-favorites-${user.uid}`
    : "filmfusion-favorites-guest";

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        if (!user) {
          const saved = localStorage.getItem(storageKey);
          const guestFavorites = saved ? JSON.parse(saved) : [];

          if (!cancelled) {
            setFavorites(guestFavorites);
            setLoadedFor(storageKey);
          }

          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        let loadedFavorites;

        if (userDoc.exists()) {
          loadedFavorites = userDoc.data().favorites || [];
        } else {
          const saved = localStorage.getItem(storageKey);
          loadedFavorites = saved ? JSON.parse(saved) : [];
        }

        if (!cancelled) {
          setFavorites(loadedFavorites);

          localStorage.setItem(
            storageKey,
            JSON.stringify(loadedFavorites)
          );

          setLoadedFor(storageKey);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);

        if (!cancelled) {
          const saved = localStorage.getItem(storageKey);
          const cachedFavorites = saved ? JSON.parse(saved) : [];

          setFavorites(cachedFavorites);
          setLoadedFor(storageKey);
        }
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [user, storageKey]);

  useEffect(() => {
    // Never save data until it has loaded for the current account.
    if (loadedFor !== storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(favorites));

    if (!user) return;

    async function saveFavorites() {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { favorites },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving favorites:", error);
      }
    }

    saveFavorites();
  }, [favorites, user, storageKey, loadedFor]);

  function toggleFavorite(movie) {
    setFavorites((previous) => {
      const alreadyFavorite = previous.some(
        (favorite) => favorite.id === movie.id
      );

      if (alreadyFavorite) {
        return previous.filter(
          (favorite) => favorite.id !== movie.id
        );
      }

      return [...previous, movie];
    });
  }

  function isFavorite(movieId) {
    return favorites.some((movie) => movie.id === movieId);
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}