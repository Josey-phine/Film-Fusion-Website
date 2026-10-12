import { createContext, useContext, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const ReviewContext = createContext();

export const useReviews = () => useContext(ReviewContext);

export const ReviewProvider = ({ children }) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch reviews for a specific movie.
  const fetchMovieReviews = async (movieId) => {
    try {
      setLoading(true);

      const reviewsQuery = query(
        collection(db, "reviews"),
        where("movieId", "==", String(movieId))
      );

      const querySnapshot = await getDocs(reviewsQuery);

      const fetchedReviews = querySnapshot.docs.map((reviewDoc) => ({
        id: reviewDoc.id,
        ...reviewDoc.data(),
      }));

      fetchedReviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add a review or update the user's existing review for this movie.
  const addReview = async (movieId, rating, reviewText) => {
    if (!user) {
      throw new Error("Please sign in to write a review.");
    }

    const normalizedMovieId = String(movieId);
    const normalizedText = reviewText.trim();
    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw new Error("Rating must be between 1 and 5.");
    }

    if (!normalizedText) {
      throw new Error("Please enter your review.");
    }

    try {
      const existingReviewQuery = query(
        collection(db, "reviews"),
        where("movieId", "==", normalizedMovieId),
        where("userId", "==", user.uid)
      );

      const existingReviews = await getDocs(existingReviewQuery);

      const reviewData = {
        movieId: normalizedMovieId,
        userId: user.uid,
        userName:
          user.displayName || user.email?.split("@")[0] || "Anonymous",
        rating: numericRating,
        reviewText: normalizedText,
        updatedAt: serverTimestamp(),
      };

      if (!existingReviews.empty) {
        // Update the existing review rather than creating another one.
        const existingReviewDoc = existingReviews.docs[0];

        await updateDoc(existingReviewDoc.ref, reviewData);

        setReviews((previous) =>
          previous.map((review) =>
            review.id === existingReviewDoc.id
              ? {
                  ...review,
                  ...reviewData,
                  updatedAt: new Date(),
                }
              : review
          )
        );

        return {
          success: true,
          updated: true,
        };
      }

      // No existing review: create one.
      const newReviewData = {
        ...reviewData,
        createdAt: serverTimestamp(),
      };

      const reviewRef = await addDoc(
        collection(db, "reviews"),
        newReviewData
      );

      setReviews((previous) => [
        {
          id: reviewRef.id,
          ...newReviewData,
          createdAt: new Date(),
        },
        ...previous,
      ]);

      return {
        success: true,
        updated: false,
      };
    } catch (error) {
      console.error("Error saving review:", error);
      throw error;
    }
  };

  // Delete a review only if it belongs to the signed-in user.
  const deleteReview = async (reviewId) => {
    if (!user) {
      throw new Error("Please sign in to delete a review.");
    }

    const reviewToDelete = reviews.find(
      (review) => review.id === reviewId
    );

    if (!reviewToDelete) {
      throw new Error("Review not found. Refresh the page and try again.");
    }

    if (reviewToDelete.userId !== user.uid) {
      throw new Error("You can only delete your own reviews.");
    }

    try {
      await deleteDoc(doc(db, "reviews", reviewId));

      setReviews((previous) =>
        previous.filter((review) => review.id !== reviewId)
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        fetchMovieReviews,
        addReview,
        deleteReview,
        loading,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};