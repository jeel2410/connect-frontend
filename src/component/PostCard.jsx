import React, { useState, useRef, useEffect } from 'react';
import { FileText, Image as ImageIcon, File } from 'lucide-react';
import { getAvatar } from '../utils/avatarHelper';
import { getCookie, getUserProfile } from '../utils/auth';
import API_BASE_URL from '../utils/config';
import { toast } from 'react-toastify';

const PostCard = ({ post, onReact }) => {
  const { _id: postId, userId, content, attachments, createdAt, reactions } = post;
  const userDetail = userId?.userDetailId;
  const displayName = userDetail?.fullName || 'User';
  const displayImage = userDetail?.profileImage || getAvatar(userDetail?.gender, userDetail?.dateOfBirth);

  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const likeWrapperRef = useRef(null);

  const userProfile = getUserProfile();
  const currentUserId = userProfile?.originalid || userProfile?._id || userProfile?.id;

  const EMOJIS = ['👍', '❤️', '😃', '🙏', '👏', '👌', '😮', '😢'];

  const REACTION_DETAILS = {
    '👍': { label: 'Like', color: '#1877F2' },
    '❤️': { label: 'Love', color: '#E0245E' },
    '😃': { label: 'Haha', color: '#F7B125' },
    '🙏': { label: 'Thankful', color: '#F7B125' },
    '👏': { label: 'Clap', color: '#EA650A' },
    '👌': { label: 'OK', color: '#EA650A' },
    '😮': { label: 'Wow', color: '#F7B125' },
    '😢': { label: 'Sad', color: '#F7B125' }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (likeWrapperRef.current && !likeWrapperRef.current.contains(e.target)) {
        setShowEmojiBar(false);
      }
    };
    if (showEmojiBar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiBar]);

  const userReaction = (reactions || []).find(
    (r) => r.userId?._id === currentUserId || r.userId === currentUserId
  );

  const handleReactionClick = async (emoji) => {
    setShowEmojiBar(false);
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast.error('You must be logged in to react');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction: emoji }),
      });

      const data = await response.json();
      if (data.success) {
        if (onReact) {
          onReact(postId, data.data);
        }
      } else {
        toast.error(data.message || 'Failed to update reaction');
      }
    } catch (err) {
      console.error('Error reacting to post:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const renderAttachment = (att, index) => {
    if (att.type === 'image') {
      return (
        <div key={index} className="post-attachment-image">
          <img src={att.url} alt={att.name || 'attachment'} />
        </div>
      );
    }
    
    return (
      <a key={index} href={att.url} target="_blank" rel="noopener noreferrer" className="post-attachment-file">
        {att.type === 'pdf' ? <FileText size={20} /> : <File size={20} />}
        <span>{att.name || (att.type === 'pdf' ? 'PDF Document' : 'Document')}</span>
      </a>
    );
  };

  // Group reactions by emoji type
  const reactionGroups = (reactions || []).reduce((acc, curr) => {
    if (!curr.reaction) return acc;
    if (!acc[curr.reaction]) {
      acc[curr.reaction] = [];
    }
    acc[curr.reaction].push(curr);
    return acc;
  }, {});

  const uniqueEmojisUsed = Object.keys(reactionGroups);
  const totalReactionsCount = (reactions || []).length;

  const reactionsTooltipText = (reactions || [])
    .map((r) => r.userId?.userDetailId?.fullName || 'Someone')
    .slice(0, 10)
    .join(', ') + (totalReactionsCount > 10 ? ` and ${totalReactionsCount - 10} others` : '');

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={displayImage} alt={displayName} className="post-user-avatar" />
        <div className="post-user-info">
          <h4 className="post-user-name">{displayName}</h4>
          <span className="post-date">{formatDate(createdAt)}</span>
        </div>
      </div>
      <div className="post-content">
        <p>{content}</p>
      </div>
      {attachments && attachments.length > 0 && (
        <div className="post-attachments">
          {attachments.map((att, index) => renderAttachment(att, index))}
        </div>
      )}

      {/* Reactions count display */}
      {totalReactionsCount > 0 && (
        <div className="post-reactions-display">
          <div className="reaction-emoji-stack">
            {uniqueEmojisUsed.slice(0, 3).map((emoji) => (
              <span key={emoji} className="stack-emoji">
                {emoji}
              </span>
            ))}
          </div>
          <span className="reaction-total-count">
            {totalReactionsCount}
          </span>
          {reactionsTooltipText && (
            <div className="reactions-tooltip">
              {reactionsTooltipText}
            </div>
          )}
        </div>
      )}

      {/* Action bar with Like button */}
      <div className="post-actions-bar">
        <div className="post-like-wrapper" ref={likeWrapperRef}>
          {showEmojiBar && (
            <div className="emoji-picker-popup">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="emoji-btn"
                  onClick={() => handleReactionClick(emoji)}
                  title={REACTION_DETAILS[emoji]?.label}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <button
            className={`post-like-btn ${userReaction ? 'reacted' : ''}`}
            style={userReaction ? { color: REACTION_DETAILS[userReaction.reaction]?.color } : {}}
            onClick={() => setShowEmojiBar((prev) => !prev)}
          >
            <span className="like-btn-emoji">
              {userReaction ? userReaction.reaction : '👍'}
            </span>
            <span className="like-btn-label">Like</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
