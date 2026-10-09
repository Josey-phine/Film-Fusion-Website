import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null);

  const { user } = useAuth();

  const storageKey = user
    ? `filmfusion-watchlist-${user.uid}`
    : "filmfusion-watchlist-guest";

  useEffect(() => {
    let cancelled = false;

    async function loadWatchlist() {
      try {
        if (!user) {
          const saved = localStorage.getItem(storageKey);
          const guestWatchlist = saved ? JSON.parse(saved) : [];

          if (!cancelled) {
            setWatchlist(guestWatchlist);
            setLoadedFor(storageKey);
          }

          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        let loadedWatchlist;

        if (userDoc.exists()) {
          loadedWatchlist = userDoc.data().watchlist || [];
        } else {
          const saved = localStorage.getItem(storageKey);
          loadedWatchlist = saved ? JSON.parse(saved) : [];
        }

        if (!cancelled) {
          setWatchlist(loadedWatchlist);

          localStorage.setItem(
            storageKey,
            JSON.stringify(loadedWatchlist)
          );

          setLoadedFor(storageKey);
        }
      } catch (error) {
        console.error("Error loading watchlist:", error);

        if (!cancelled) {
          const saved = localStorage.getItem(storageKey);
          const cachedWatchlist = saved ? JSON.parse(saved) : [];

          setWatchlist(cachedWatchlist);
          setLoadedFor(storageKey);
        }
      }
    }

    loadWatchlist();

    return () => {
      cancelled = true;
    };
  }, [user, storageKey]);

  useEffect(() => {
    if (loadedFor !== storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(watchlist));

    if (!user) return;

    async function saveWatchlist() {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { watchlist },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving watchlist:", error);
      }
    }

    saveWatchlist();
  }, [watchlist, user, storageKey, loadedFor]);

  function addToWatchlist(movie) {
    setWatchlist((previous) => {
      const alreadyExists = previous.some(
        (item) => item.id === movie.id
      );

      if (alreadyExists) return previous;

      return [...previous, movie];
    });
  }

  function removeFromWatchlist(movie) {
    setWatchlist((previous) =>
      previous.filter((item) => item.id !== movie.id)
    );
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}