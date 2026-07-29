import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const ReviewContext = createContext();

export const useReviews = () => useContext(ReviewContext);

export const ReviewProvider = ({ children }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch reviews for a specific movie
  const fetchMovieReviews = async (movieId) => {
    try {
      setLoading(true);
      const q = query(collection(db, "reviews"), where("movieId", "==", String(movieId)));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Add or update a review
  const addReview = async (movieId, rating, reviewText) => {
    if (!user) return;
    try {
      const newReview = {
        movieId: String(movieId),
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        rating: Number(rating),
        reviewText,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "reviews"), newReview);
      setReviews(prev => [{ id: docRef.id, ...newReview, createdAt: new Date() }, ...prev]);
    } catch (error) {
      console.error("Error adding review: ", error);
    }
  };

  // Delete a review
  const deleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review: ", error);
    }
  };

  return (
    <ReviewContext.Provider value={{ reviews, fetchMovieReviews, addReview, deleteReview, loading }}>
      {children}
    </ReviewContext.Provider>
  );
};