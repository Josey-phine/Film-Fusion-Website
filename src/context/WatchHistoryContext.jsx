import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const WatchHistoryContext = createContext();

export function WatchHistoryProvider({ children }) {
const [history, setHistory] = useState([]);
const [loadedFor, setLoadedFor] = useState(null);

const { user } = useAuth();

const storageKey = user
? `filmfusion-history-${user.uid}`
: "filmfusion-history-guest";

useEffect(() => {
let cancelled = false;


async function loadHistory() {
  try {
    if (!user) {
      const saved = localStorage.getItem(storageKey);
      const guestHistory = saved ? JSON.parse(saved) : [];

      if (!cancelled) {
        setHistory(guestHistory);
        setLoadedFor(storageKey);
      }

      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    let loadedHistory;

    if (userDoc.exists()) {
      loadedHistory = userDoc.data().history || [];
    } else {
      const saved = localStorage.getItem(storageKey);
      loadedHistory = saved ? JSON.parse(saved) : [];
    }

    if (!cancelled) {
      setHistory(loadedHistory);

      localStorage.setItem(
        storageKey,
        JSON.stringify(loadedHistory)
      );

      setLoadedFor(storageKey);
    }
  } catch (error) {
    console.error("Error loading watch history:", error);

    if (!cancelled) {
      const saved = localStorage.getItem(storageKey);
      const cachedHistory = saved ? JSON.parse(saved) : [];

      setHistory(cachedHistory);
      setLoadedFor(storageKey);
    }
  }
}

loadHistory();

return () => {
  cancelled = true;
};


}, [user, storageKey]);

useEffect(() => {
if (loadedFor !== storageKey) return;


localStorage.setItem(storageKey, JSON.stringify(history));

if (!user) return;

async function saveHistory() {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      { history },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving watch history:", error);
  }
}

saveHistory();


}, [history, user, storageKey, loadedFor]);

function addToHistory(movie) {
setHistory((previous) => {
const existingIndex = previous.findIndex(
(item) => item.id === movie.id
);


  if (existingIndex === 0) {
    return previous;
  }

  const updatedHistory = previous.filter(
    (item) => item.id !== movie.id
  );

  return [movie, ...updatedHistory];
});


}

function removeFromHistory(movie) {
setHistory((previous) =>
previous.filter((item) => item.id !== movie.id)
);
}

function clearHistory() {
setHistory([]);
}

return (
<WatchHistoryContext.Provider
value={{
history,
addToHistory,
removeFromHistory,
clearHistory,
}}
>
{children}
</WatchHistoryContext.Provider>
);
}

export function useWatchHistory() {
return useContext(WatchHistoryContext);
}
