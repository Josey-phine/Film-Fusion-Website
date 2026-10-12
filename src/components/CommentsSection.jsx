import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import CommentItem from "./CommentItem";

const CommentsSection = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Listen for comments in real time.
  useEffect(() => {
    if (!movieId) {
      setComments([]);
      return;
    }

    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, where("movieId", "==", movieId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments = snapshot.docs.map((commentDoc) => ({
          id: commentDoc.id,
          ...commentDoc.data(),
          replies: [],
        }));

        fetchedComments.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() ?? 0;
          const timeB = b.createdAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        setComments(fetchedComments);
      },
      (error) => {
        console.error("Error loading comments:", error);
      }
    );

    return () => unsubscribe();
  }, [movieId]);

  // Listen for replies to each comment in real time.
  useEffect(() => {
    if (!comments.length) return;

    const unsubscribers = comments.map((comment) => {
      const repliesRef = collection(
        db,
        "comments",
        comment.id,
        "replies"
      );

      const unsubscribe = onSnapshot(
        repliesRef,
        (snapshot) => {
          const fetchedReplies = snapshot.docs.map((replyDoc) => ({
            id: replyDoc.id,
            ...replyDoc.data(),
          }));

          fetchedReplies.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() ?? 0;
            const timeB = b.createdAt?.toMillis?.() ?? 0;
            return timeA - timeB;
          });

          setComments((previousComments) =>
            previousComments.map((item) =>
              item.id === comment.id
                ? { ...item, replies: fetchedReplies }
                : item
            )
          );
        },
        (error) => {
          console.error(
            `Error loading replies for comment ${comment.id}:`,
            error
          );
        }
      );

      return unsubscribe;
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [comments.map((comment) => comment.id).join(",")]);

  // Submit a new comment.
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim() || loading) return;

    if (!user) {
      alert("Please log in to post a comment.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "comments"), {
        movieId,
        userId: user.uid,
        userName:
          user.displayName ||
          user.email?.split("@")[0] ||
          "Anonymous",
        userPhoto: user.photoURL || "",
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });

      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save a reply under its parent comment.
  const handleAddReply = async (parentId, replyText) => {
    if (!user) {
      alert("Please log in to reply.");
      return false;
    }

    const trimmedReply = replyText.trim();

    if (!trimmedReply) return false;

    try {
      await addDoc(
        collection(db, "comments", parentId, "replies"),
        {
          userId: user.uid,
          userName:
            user.displayName ||
            user.email?.split("@")[0] ||
            "Anonymous",
          userPhoto: user.photoURL || "",
          text: trimmedReply,
          createdAt: serverTimestamp(),
        }
      );

      return true;
    } catch (error) {
      console.error("Failed to post reply:", error);
      alert("Failed to post reply. Please try again.");
      return false;
    }
  };

  // Delete a comment or a reply.
  const handleDeleteComment = async (
    itemId,
    parentId = null,
    itemType = "comment"
  ) => {
    const message =
      itemType === "reply"
        ? "Are you sure you want to delete this reply?"
        : "Are you sure you want to delete this comment?";

    if (!window.confirm(message)) return;

    try {
      if (itemType === "reply") {
        if (!parentId) {
          throw new Error("The parent comment could not be identified.");
        }

        await deleteDoc(
          doc(db, "comments", parentId, "replies", itemId)
        );

        return;
      }

      // Remove replies before deleting their parent comment.
      const repliesRef = collection(
        db,
        "comments",
        itemId,
        "replies"
      );

      const repliesSnapshot = await getDocs(repliesRef);

      // Firestore batches support up to 500 operations.
      if (repliesSnapshot.size > 499) {
        throw new Error(
          "This comment has too many replies to delete at once."
        );
      }

      const batch = writeBatch(db);

      repliesSnapshot.docs.forEach((replyDoc) => {
        batch.delete(replyDoc.ref);
      });

      batch.delete(doc(db, "comments", itemId));

      await batch.commit();
    } catch (error) {
      console.error("Error deleting comment or reply:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  return (
    <div className="mt-8 bg-gray-900 text-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      {user ? (
        <form
          onSubmit={handleSubmitComment}
          className="mb-6 flex flex-col gap-3"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-cyan-500 resize-none"
            required
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