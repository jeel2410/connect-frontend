import React from 'react';
import { Sparkles, ThumbsUp, MessageSquare, Eye } from 'lucide-react';

const isObjectIdStr = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str.trim());
const cleanStr = (val, fallback = '') => (!val || typeof val !== 'string' || isObjectIdStr(val)) ? fallback : val.trim();

const QuestionFeedCard = ({
  post,
  idx,
  onQuestionClick,
  onLikePost,
  currentUserId,
  resolveImageUrl,
  getAvatar,
  formatTimeAgo
}) => {
  const author = post.userId || {};
  const authorDetail = author.userDetailId || {};
  const authorRawName = authorDetail.isBusinessProfile
    ? (authorDetail.businessName || 'Business User')
    : (authorDetail.fullName || 'User');
  const authorName = cleanStr(authorRawName, 'User');
  const authorAvatar = authorDetail.isBusinessProfile
    ? resolveImageUrl(authorDetail.businessLogo)
    : resolveImageUrl(authorDetail.profileImage);
  const defaultAvatar = getAvatar(authorDetail.gender, authorDetail.dateOfBirth);

  const title = post.content || post.title || 'Untitled Question';
  const isLiked = post.reactions?.some(r => {
    const rId = typeof r.userId === 'object' ? r.userId?._id : r.userId;
    return String(rId) === String(currentUserId);
  });
  const likesCount = post.reactions ? post.reactions.length : (post.likesCount || 0);
  const answersCount = post.commentsCount || (post.comments ? post.comments.length : 0);
  const viewsCount = post.views || post.viewsCount || 0;
  const hasAi = post.targetSegments?.getAiResponses !== false && Boolean(post.aiAnswer?.content);
  const categoryTag = post.targetSegments?.interests?.[0] || post.targetSegments?.industries?.[0] || '';

  return (
    <div
      key={post._id || idx}
      onClick={() => onQuestionClick(post)}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E8EDF3',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0066FF')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E8EDF3')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={authorAvatar || defaultAvatar}
            alt={authorName}
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = defaultAvatar; }}
          />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#09122E' }}>{authorName}</div>
            <div style={{ fontSize: '12px', color: '#777E90' }}>{formatTimeAgo(post.createdAt)}</div>
          </div>
        </div>

        {hasAi ? (
          <div style={{
            background: '#EBF3FF',
            color: '#0066FF',
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 14px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} color="#0066FF" />
            <span>AI Answered</span>
          </div>
        ) : (
          <div style={{
            background: '#FFF0F0',
            color: '#FF3B30',
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 14px',
            borderRadius: '20px'
          }}>
            Needs Answers
          </div>
        )}
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#09122E', margin: '0 0 10px 0', lineHeight: '1.4' }}>
        {title}
      </h3>

      {post.content && post.title && (
        <p style={{ fontSize: '14px', color: '#545A69', margin: '0 0 14px 0', lineHeight: '1.5' }}>
          {post.content}
        </p>
      )}

      {categoryTag && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{
            background: '#FFF0E6',
            color: '#FF4D00',
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            {categoryTag}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', color: '#777E90' }}>
        <div
          onClick={(e) => onLikePost(post._id, e)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: isLiked ? '#0066FF' : '#777E90' }}
        >
          <ThumbsUp size={16} color={isLiked ? '#0066FF' : '#777E90'} />
          <span style={{ fontWeight: isLiked ? '700' : '500' }}>{likesCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={16} color="#777E90" />
          <span>{answersCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={16} color="#777E90" />
          <span>{viewsCount}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionFeedCard;
