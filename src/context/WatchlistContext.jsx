import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem("filmfusion-watchlist");
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });

  const { user } = useAuth();

  // 1. Fetch watchlist from Firestore when user logs in
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().watchlist) {
            setWatchlist(userDoc.data().watchlist);
          }
        } catch (error) {
          console.error("Error fetching watchlist:", error);
        }
      }
    };
    fetchWatchlist();
  }, [user]);

  // 2. Save to localStorage as a fallback/cache
  useEffect(() => {
    localStorage.setItem("filmfusion-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = async (movie) => {
    // Prevent duplicates
    if (watchlist.some((item) => item.id === movie.id)) return;

    const updatedWatchlist = [...watchlist, movie];
    setWatchlist(updatedWatchlist);

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          watchlist: arrayUnion(movie),
        });
      } catch (error) {
        console.error("Error adding to watchlist in Firestore:", error);
      }
    }
  };

  const removeFromWatchlist = async (movie) => {
    const updatedWatchlist = watchlist.filter((item) => item.id !== movie.id);
    setWatchlist(updatedWatchlist);

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          watchlist: arrayRemove(movie),
        });
      } catch (error) {
        console.error("Error removing from watchlist in Firestore:", error);
      }
    }
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}