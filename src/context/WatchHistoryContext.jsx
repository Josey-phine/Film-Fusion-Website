import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const WatchHistoryContext = createContext();

export function WatchHistoryProvider({ children }) {
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("filmfusion-history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const { user } = useAuth();

  // 1. Fetch history from Firestore when user logs in
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().history) {
            setHistory(userDoc.data().history);
          }
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      }
    };
    fetchHistory();
  }, [user]);

  // 2. Save to localStorage as a fallback/cache
  useEffect(() => {
    localStorage.setItem("filmfusion-history", JSON.stringify(history));
  }, [history]);

  const addToHistory = async (movie) => {
    // Prevent duplicates from cluttering the history
    if (history.some((item) => item.id === movie.id)) return;

    const updatedHistory = [movie, ...history];
    setHistory(updatedHistory);

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          history: arrayUnion(movie),
        });
      } catch (error) {
        console.error("Error adding to history in Firestore:", error);
      }
    }
  };

  const removeFromHistory = async (movie) => {
    // 1. Update local React state instantly
    const updatedHistory = history.filter((item) => item.id !== movie.id);
    setHistory(updatedHistory);

    // 2. Update Firebase
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          history: arrayRemove(movie),
        });
      } catch (error) {
        console.error("Error removing from history:", error);
      }
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          history: [],
        });
      } catch (error) {
        console.error("Error clearing history:", error);
      }
    }
  };

  return (
    <WatchHistoryContext.Provider value={{ history, addToHistory, removeFromHistory, clearHistory }}>
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory() {
  return useContext(WatchHistoryContext);
}