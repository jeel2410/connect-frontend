import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, File } from 'lucide-react';
import { getAvatar } from '../utils/avatarHelper';
import { getCookie, getUserProfile } from '../utils/auth';
import API_BASE_URL from '../utils/config';
import { toast } from 'react-toastify';

const PostCard = ({ post, onReact }) => {
  const { _id: postId, userId, content, attachments, createdAt, reactions, linkPreview } = post;
  const userDetail = userId?.userDetailId;
  const displayName = userDetail?.isBusinessProfile ? userDetail?.businessName : userDetail?.fullName || 'User';
  const displayImage = userDetail?.isBusinessProfile ? (userDetail?.businessLogo || '/default-avatar.png') : (userDetail?.profileImage || getAvatar(userDetail?.gender, userDetail?.dateOfBirth));

  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const likeWrapperRef = useRef(null);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (userId?._id) {
      navigate('/userprofile', { state: { userId: userId._id } });
    }
  };

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
    .map((r) => {
      const detail = r.userId?.userDetailId;
      if (detail?.isBusinessProfile) {
        return detail.businessName || 'Someone';
      }
      return detail?.fullName || 'Someone';
    })
    .slice(0, 10)
    .join(', ') + (totalReactionsCount > 10 ? ` and ${totalReactionsCount - 10} others` : '');

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-header-left">
          <img 
            src={displayImage} 
            alt={displayName} 
            className="post-user-avatar" 
            onClick={handleProfileClick}
            style={{ objectFit: userDetail?.isBusinessProfile ? 'contain' : 'cover', backgroundColor: userDetail?.isBusinessProfile ? '#fff' : 'transparent' }}
          />
          <div className="post-user-info">
            <h4 className="post-user-name" onClick={handleProfileClick}>
              {displayName}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="post-date">{formatDate(createdAt)}</span>
              {post.connectionGroupId && (
                <span className="group-shared-badge" style={{ background: '#E6F4EA', border: '1px solid #CEEAD6', color: '#137333', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' }}>
                  Shared with {post.connectionGroupId.name || post.connectionGroupId}
                </span>
              )}
              {post.isApproved === false && (
                <span className="pending-badge" style={{ background: '#FFF3CD', border: '1px solid #FFEBAA', color: '#856404', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' }}>
                  Pending Admin Approval
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="post-header-right">
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
      <div className="post-content">
        <p style={{ whiteSpace: 'pre-line' }}>{content}</p>
      </div>
      {linkPreview && linkPreview.url && (
        <div className="post-link-preview" style={{ display: 'flex', gap: '16px', border: '1px solid #E8EDF3', borderRadius: '8px', overflow: 'hidden', background: '#F8F9FB', marginBottom: '16px', marginTop: '8px' }}>
          {linkPreview.image && (
            <img src={linkPreview.image} alt="preview" style={{ width: '150px', height: '100px', objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <h5 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 6px 0', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkPreview.title || 'External Link'}</h5>
            {linkPreview.description && (
              <p style={{ fontSize: '12px', color: '#777E90', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{linkPreview.description}</p>
            )}
            <a href={linkPreview.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#EA650A', fontWeight: '600', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkPreview.url}</a>
          </div>
        </div>
      )}
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

    </div>
  );
};

export default PostCard;
