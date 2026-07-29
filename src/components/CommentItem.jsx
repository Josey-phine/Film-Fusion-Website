import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CommentItem({ comment, replies, onAddReply, onDelete }) {
  const { user } = useAuth(); // Changed from currentUser to user
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onAddReply(comment.id, replyText);
    setReplyText("");
    setShowReplyForm(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white mb-3">
      {/* Header & Delete Action */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          {comment.userPhoto ? (
            <img
              src={comment.userPhoto}
              alt={comment.userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
              {comment.userName?.[0] || "U"}
            </div>
          )}
          <span className="font-semibold text-sm">{comment.userName}</span>
        </div>

        {/* Delete button for main comment */}
        {user && user.uid === comment.userId && onDelete && ( // Changed from currentUser
          <button
            onClick={() => onDelete(comment.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Delete
          </button>
        )}
      </div>

      {/* Comment Body */}
      <p className="text-gray-300 text-sm mb-2">{comment.text}</p>

      {/* Reply Action Button */}
      {user && ( // Changed from currentUser
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-xs text-blue-400 hover:underline mb-2"
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>
      )}

      {/* Reply Input Form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-2 mb-3 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 bg-gray-700 text-sm text-white px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 rounded text-white font-medium"
          >
            Post
          </button>
        </form>
      )}

      {/* Nested Replies Rendering */}
      {replies && replies.length > 0 && (
        <div className="ml-6 pl-3 border-l-2 border-gray-700 space-y-3 mt-3">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-gray-700/50 p-2 rounded flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-xs text-blue-300">
                    {reply.userName}
                  </span>
                </div>
                <p className="text-gray-300 text-xs">{reply.text}</p>
              </div>

              {/* Delete button for nested reply */}
              {user && user.uid === reply.userId && onDelete && ( // Changed from currentUser
                <button
                  onClick={() => onDelete(reply.id)}
                  className="text-xs text-red-400 hover:text-red-300 ml-2 font-medium"
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