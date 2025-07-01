"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import {
  Check,
  CheckCheck,
  Download,
  Edit3,
  Trash2,
  Reply,
  Heart,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const MessageItem = memo(
  ({
    message,
    currentUser,
    showAvatar,
    showSenderName,
    onLike,
    onReply,
    onEdit,
    onDelete,
  }) => {
    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const isOwn = message.sender._id === currentUser.id;
    const isLiked = message.likes?.includes(currentUser.id);
    const isOptimistic = message.isOptimistic;
    const status = message.status;

    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const getMessageStatus = () => {
      if (!isOwn) return null;

      if (isOptimistic) {
        if (status === "sending") {
          return <Clock size={12} className="text-gray-400" />;
        } else if (status === "failed") {
          return <AlertCircle size={12} className="text-red-500" />;
        }
      }

      const isRead = message.readBy && message.readBy.length > 1;
      const isDelivered = message.deliveredTo && message.deliveredTo.length > 0;

      if (isRead) {
        return <CheckCheck size={12} className="text-blue-500" />;
      } else if (isDelivered) {
        return <CheckCheck size={12} className="text-gray-400" />;
      } else {
        return <Check size={12} className="text-gray-400" />;
      }
    };

    const handleDownload = (fileUrl, fileName) => {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleEdit = () => {
      if (editContent.trim() && editContent !== message.content) {
        onEdit(message._id, editContent.trim());
      }
      setIsEditing(false);
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleEdit();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setEditContent(message.content);
      }
    };

    const handleRetry = () => {
      // Implement retry logic here
      console.log("Retrying message:", message._id);
    };

    // Handle double-tap for like (Instagram-style)
    const handleDoubleClick = () => {
      if (!isOptimistic) {
        onLike(message._id);
      }
    };

    return (
      <motion.div
        className={`message ${isOwn ? "sent" : "received"} ${
          isOptimistic ? "optimistic" : ""
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onDoubleClick={handleDoubleClick}
      >
        {!isOwn && showAvatar && (
          <img
            src={
              message.sender.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                message.sender.name || "User"
              )}&background=8b5cf6&color=fff&size=56`
            }
            alt={message.sender.name}
            className="message-avatar"
          />
        )}

        <div className="message-content">
          {!isOwn && showSenderName && (
            <div className="sender-name">{message.sender.name}</div>
          )}

          {message.replyTo && (
            <div className="reply-preview">
              <div className="reply-line"></div>
              <div className="reply-content">
                <span className="reply-sender">
                  {message.replyTo.sender?.name}
                </span>
                <p className="reply-text">{message.replyTo.content}</p>
              </div>
            </div>
          )}

          <div className="message-bubble-container">
            <div
              className={`message-bubble ${
                status === "failed" ? "failed" : ""
              }`}
            >
              {message.messageType === "image" ? (
                <div className="message-image-container">
                  {isOptimistic && status === "sending" ? (
                    <div className="image-placeholder">
                      <div className="loading-spinner">
                        <RefreshCw size={20} className="animate-spin" />
                      </div>
                      <span>Uploading image...</span>
                    </div>
                  ) : (
                    <>
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={message.fileUrl || "/placeholder.svg"}
                          alt={message.fileName || "Shared image"}
                          className="message-image"
                          loading="lazy"
                          onDoubleClick={handleDoubleClick}
                        />
                      </a>
                      {message.fileName && (
                        <div className="image-caption">{message.fileName}</div>
                      )}
                    </>
                  )}
                </div>
              ) : message.messageType === "file" ? (
                <div className="message-file">
                  <div className="file-info">
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <span className="file-name">
                        {message.fileName || message.content}
                      </span>
                      <span className="file-size">
                        {isOptimistic && status === "sending"
                          ? "Uploading..."
                          : "Click to download"}
                      </span>
                    </div>
                  </div>
                  {!isOptimistic && (
                    <button
                      className="download-btn"
                      onClick={() =>
                        handleDownload(message.fileUrl, message.fileName)
                      }
                      aria-label="Download file"
                    >
                      <Download size={14} />
                    </button>
                  )}
                </div>
              ) : isEditing ? (
                <div className="edit-input-container">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleEdit}
                    className="edit-input"
                    autoFocus
                    rows={1}
                  />
                </div>
              ) : (
                <p className="message-text">{message.content}</p>
              )}

              {isLiked && (
                <motion.span
                  className="heart-overlay"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  ❤️
                </motion.span>
              )}

              <div className="message-meta">
                <span className="message-time">
                  {formatTime(message.createdAt)}
                </span>
                {message.isEdited && (
                  <span className="edited-indicator">Edited</span>
                )}
                {status === "failed" && (
                  <button
                    className="retry-btn"
                    onClick={handleRetry}
                    title="Retry sending"
                  >
                    <RefreshCw size={10} />
                  </button>
                )}
                {getMessageStatus()}
              </div>
            </div>

            {/* Message Actions */}
            {showActions && !isOptimistic && (
              <motion.div
                className={`message-actions ${isOwn ? "own" : "other"}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <button
                  className="action-btn"
                  onClick={() => onLike(message._id)}
                  title="Like"
                >
                  <Heart size={14} className={isLiked ? "text-red-500" : ""} />
                </button>

                <button
                  className="action-btn"
                  onClick={() => onReply(message)}
                  title="Reply"
                >
                  <Reply size={14} />
                </button>

                {isOwn && message.messageType === "text" && (
                  <button
                    className="action-btn"
                    onClick={() => setIsEditing(true)}
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                )}

                {isOwn && (
                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(message._id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default MessageItem;
