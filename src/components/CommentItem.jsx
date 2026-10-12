import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CommentItem({
  comment,
  replies,
  onAddReply,
  onDelete,
}) {
  const { user } = useAuth();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    const trimmedReply = replyText.trim();

    if (!trimmedReply || replyLoading) return;

    setReplyLoading(true);

    try {
      const saved = await onAddReply(comment.id, trimmedReply);

      if (saved) {
        setReplyText("");
        setShowReplyForm(false);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white mb-3">
      {/* Comment Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          {comment.userPhoto ? (
            <img
              src={comment.userPhoto}
              alt={comment.userName || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
              {comment.userName?.[0] || "U"}
            </div>
          )}

          <span className="font-semibold text-sm">
            {comment.userName}
          </span>
        </div>

        {/* Delete Own Comment */}
        {user && user.uid === comment.userId && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Delete
          </button>
        )}
      </div>

      {/* Comment Text */}
      <p className="text-gray-300 text-sm mb-2 whitespace-pre-wrap break-words">
        {comment.text}
      </p>

      {/* Reply Button */}
      {user && (
        <button
          type="button"
          onClick={() => setShowReplyForm((previous) => !previous)}
          className="text-xs text-blue-400 hover:underline mb-2"
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <form
          onSubmit={handleReplySubmit}
          className="mt-2 mb-3 flex gap-2"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 min-w-0 bg-gray-700 text-sm text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={replyLoading}
            required
          />

          <button
            type="submit"
            disabled={replyLoading || !replyText.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs px-3 py-2 rounded text-white font-medium"
          >
            {replyLoading ? "Posting..." : "Post"}
          </button>
        </form>
      )}

      {/* Saved Replies */}
      {replies && replies.length > 0 && (
        <div className="ml-3 sm:ml-6 pl-3 border-l-2 border-gray-700 space-y-3 mt-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-gray-700/50 p-2 rounded flex justify-between items-start gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-xs text-blue-300">
                    {reply.userName}
                  </span>
                </div>

                <p className="text-gray-300 text-xs whitespace-pre-wrap break-words">
                  {reply.text}
                </p>
              </div>

              {/* Delete Own Reply */}
              {user && user.uid === reply.userId && onDelete && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(reply.id, comment.id, "reply")
                  }
                  className="text-xs text-red-400 hover:text-red-300 shrink-0 font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}