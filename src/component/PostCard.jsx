import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, File, Share2 } from 'lucide-react';
import { getAvatar, resolveImageUrl } from '../utils/avatarHelper';
import { getCookie, getUserProfile } from '../utils/auth';
import API_BASE_URL from '../utils/config';
import { toast } from 'react-toastify';

const PostCard = ({ post, onReact }) => {
  const { _id: postId, userId, content, attachments, createdAt, reactions, linkPreview, sharedPostId, reshareCount } = post;
  const userDetail = userId?.userDetailId;
  const displayName = userDetail?.isBusinessProfile ? userDetail?.businessName : userDetail?.fullName || 'User';
  const displayImage = userDetail?.isBusinessProfile ? (resolveImageUrl(userDetail?.businessLogo) || '/default-avatar.png') : (resolveImageUrl(userDetail?.profileImage) || getAvatar(userDetail?.gender, userDetail?.dateOfBirth));
  const fallbackAvatar = userDetail?.isBusinessProfile ? '/default-avatar.png' : getAvatar(userDetail?.gender, userDetail?.dateOfBirth);

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

  const handleReshareClick = async () => {
    const confirmReshare = window.confirm("Are you sure you want to reshare this post to your connections?");
    if (!confirmReshare) return;

    try {
      const token = getCookie('authToken');
      if (!token) {
        toast.error('You must be logged in to reshare');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/reshare`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Post reshared successfully! Pending admin approval.');
      } else {
        toast.error(data.message || 'Failed to reshare post');
      }
    } catch (err) {
      console.error('Error resharing post:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const renderAttachment = (att, index) => {
    const resolvedUrl = resolveImageUrl(att.url);
    if (att.type === 'image') {
      return (
        <div key={index} className="post-attachment-image">
          <img src={resolvedUrl} alt={att.name || 'attachment'} />
        </div>
      );
    }

    if (att.type === 'video') {
      return (
        <div key={index} className="post-attachment-video" style={{ width: '100%', maxWidth: '100%', margin: '12px 0', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
          <video src={resolvedUrl} controls style={{ width: '100%', maxHeight: '450px', display: 'block', outline: 'none' }} />
        </div>
      );
    }

    return (
      <a key={index} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="post-attachment-file">
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
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackAvatar;
            }}
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
        <div className="post-header-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

          <button
            className="post-share-btn"
            onClick={handleReshareClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              cursor: 'pointer',
              color: '#777E90',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <Share2 size={16} />
            <span>Reshare</span>
          </button>
        </div>
      </div>
      <div className="post-content">
        <p style={{ whiteSpace: 'pre-line' }}>{content}</p>
      </div>
      {linkPreview && linkPreview.url && (
        <div className="post-link-preview" style={{ display: 'flex', gap: '16px', border: '1px solid #E8EDF3', borderRadius: '8px', overflow: 'hidden', background: '#F8F9FB', marginBottom: '16px', marginTop: '8px' }}>
          {linkPreview.image && (
            <img src={resolveImageUrl(linkPreview.image)} alt="preview" style={{ width: '150px', height: '100px', objectFit: 'cover', flexShrink: 0 }} />
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

      {sharedPostId && (
        <div className="reshared-post-box" style={{
          border: '1px solid #E8EDF3',
          borderRadius: '8px',
          padding: '16px',
          background: '#F8F9FB',
          marginTop: '12px',
          textAlign: 'left'
        }}>
          <div className="reshared-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <img
              src={sharedPostId.userId?.userDetailId?.isBusinessProfile
                ? (resolveImageUrl(sharedPostId.userId?.userDetailId?.businessLogo) || '/default-avatar.png')
                : (resolveImageUrl(sharedPostId.userId?.userDetailId?.profileImage) || getAvatar(sharedPostId.userId?.userDetailId?.gender, sharedPostId.userId?.userDetailId?.dateOfBirth))
              }
              alt={sharedPostId.userId?.userDetailId?.fullName || 'User'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = sharedPostId.userId?.userDetailId?.isBusinessProfile
                  ? '/default-avatar.png'
                  : getAvatar(sharedPostId.userId?.userDetailId?.gender, sharedPostId.userId?.userDetailId?.dateOfBirth);
              }}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#09122E' }}>
                {sharedPostId.userId?.userDetailId?.isBusinessProfile
                  ? sharedPostId.userId?.userDetailId?.businessName
                  : sharedPostId.userId?.userDetailId?.fullName || 'User'
                }
              </h5>
              <span style={{ fontSize: '11px', color: '#777E90' }}>{formatDate(sharedPostId.createdAt)}</span>
            </div>
          </div>

          <div className="reshared-content" style={{ fontSize: '13px', color: '#353945', marginBottom: '12px' }}>
            <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{sharedPostId.content}</p>
          </div>

          {sharedPostId.attachments && sharedPostId.attachments.length > 0 && (
            <div className="post-attachments">
              {sharedPostId.attachments.map((att, index) => renderAttachment(att, index))}
            </div>
          )}

          {sharedPostId.linkPreview && sharedPostId.linkPreview.url && (
            <div className="post-link-preview" style={{ display: 'flex', gap: '16px', border: '1px solid #E8EDF3', borderRadius: '8px', overflow: 'hidden', background: '#ffffff', marginBottom: '0px', marginTop: '8px' }}>
              {sharedPostId.linkPreview.image && (
                <img src={resolveImageUrl(sharedPostId.linkPreview.image)} alt="preview" style={{ width: '120px', height: '80px', objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                <h5 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sharedPostId.linkPreview.title || 'External Link'}</h5>
                {sharedPostId.linkPreview.description && (
                  <p style={{ fontSize: '11px', color: '#777E90', margin: '0 0 4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sharedPostId.linkPreview.description}</p>
                )}
                <a href={sharedPostId.linkPreview.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: '#EA650A', fontWeight: '600', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sharedPostId.linkPreview.url}</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reactions & Reshares count display */}
      {(totalReactionsCount > 0 || (reshareCount && reshareCount > 0)) && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '14px' }}>
          {totalReactionsCount > 0 && (
            <div className="post-reactions-display" style={{ marginTop: 0 }}>
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

          {reshareCount && reshareCount > 0 && (
            <div className="post-reactions-display" style={{ marginTop: 0, cursor: 'default' }}>
              <Share2 size={14} color="#777E90" />
              <span className="reaction-total-count" style={{ marginLeft: '4px' }}>
                {reshareCount} {reshareCount === 1 ? 'Reshare' : 'Reshares'}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PostCard;
