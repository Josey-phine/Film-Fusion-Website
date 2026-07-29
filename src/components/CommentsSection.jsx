import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import CommentItem from "./CommentItem";

const CommentsSection = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Real-time listener for comments with client-side sorting for instant updates
  useEffect(() => {
    if (!movieId) return;

    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("movieId", "==", movieId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort safely in JavaScript to prevent delays while serverTimestamp resolves
        fetchedComments.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
          return timeB - timeA; // Newest first
        });

        setComments(fetchedComments);
      },
      (error) => {
        console.error("Error loading comments: ", error);
      }
    );

    return () => unsubscribe();
  }, [movieId]);

  // Submit a new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    if (!user) {
      alert("Please log in to post a comment.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "comments"), {
        movieId: movieId,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        userPhoto: user.photoURL || "",
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });

      setNewComment(""); // Clear input on success
    } catch (error) {
      console.error("Failed to post comment: ", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
      console.error("Error deleting comment: ", error);
      alert("Failed to delete comment.");
    }
  };

  // Handler for adding replies
  const handleAddReply = (parentId, replyText) => {
    console.log("Add reply to:", parentId, replyText);
  };

  return (
    <div className="mt-8 bg-gray-900 text-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        Comments ({comments.length})
      </h3>

      {/* Input Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6 flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-cyan-500 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="self-end px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-gray-400 italic mb-6">
          Please log in to leave a comment.
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comment.replies || []}
              onAddReply={handleAddReply}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;