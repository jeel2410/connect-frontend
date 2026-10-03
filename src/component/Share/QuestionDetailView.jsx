import React, { useState } from 'react';
import { Eye, Sparkles, Info, ThumbsUp, ThumbsDown, MessageSquare, Share2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import API_BASE_URL from '../../utils/config';
import { getCookie } from '../../utils/auth';
import { toast } from 'react-toastify';

const isObjectIdStr = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str.trim());
const cleanStr = (val, fallback = '') => (!val || typeof val !== 'string' || isObjectIdStr(val)) ? fallback : val.trim();

const QuestionDetailView = ({
  selectedQuestionDetail,
  onLikePost,
  aiHelpful,
  setAiHelpful,
  currentUserId,
  resolveImageUrl,
  getAvatar,
  formatTimeAgo,
  onCommentAdded
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // States for comment reply & expand
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [expandedRepliesMap, setExpandedRepliesMap] = useState({});
  const [loadingCommentAction, setLoadingCommentAction] = useState({});

  if (!selectedQuestionDetail) return null;

  const author = selectedQuestionDetail.userId || {};
  const authorDetail = author.userDetailId || {};
  const authorRawName = authorDetail.isBusinessProfile
    ? (authorDetail.businessName || 'Business User')
    : (authorDetail.fullName || 'User');
  const authorName = cleanStr(authorRawName, 'User');
  const authorAvatar = authorDetail.isBusinessProfile
    ? resolveImageUrl(authorDetail.businessLogo)
    : resolveImageUrl(authorDetail.profileImage);
  const defaultAvatar = getAvatar(authorDetail.gender, authorDetail.dateOfBirth);

  const isLikedDetail = selectedQuestionDetail.reactions?.some(r => {
    const rId = typeof r.userId === 'object' ? r.userId?._id : r.userId;
    return String(rId) === String(currentUserId);
  });
  const likesCount = selectedQuestionDetail.reactions ? selectedQuestionDetail.reactions.length : (selectedQuestionDetail.likesCount || 0);
  const commentsList = selectedQuestionDetail.comments || [];
  const answersCount = commentsList.length || selectedQuestionDetail.commentsCount || 0;
  const viewsCount = selectedQuestionDetail.views || selectedQuestionDetail.viewsCount || 0;
  const hasAiDetail = selectedQuestionDetail.targetSegments?.getAiResponses !== false && Boolean(selectedQuestionDetail.aiAnswer?.content);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error('Please enter an answer before submitting');
      return;
    }
    try {
      setIsPostingComment(true);
      const token = getCookie('authToken');
      if (!token) {
        toast.error('Please log in to submit an answer');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/posts/${selectedQuestionDetail._id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newCommentText })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Answer added successfully!');
        setNewCommentText('');
        setShowAddForm(false);
        const updatedComments = data.data || [];
        if (onCommentAdded) {
          onCommentAdded(selectedQuestionDetail._id, updatedComments);
        }
      } else {
        toast.error(data.message || 'Failed to submit answer');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      toast.error('Failed to submit answer');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast.error('Please log in to like an answer');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/posts/${selectedQuestionDetail._id}/comment/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (onCommentAdded) {
          onCommentAdded(selectedQuestionDetail._id, data.data || []);
        }
      } else {
        toast.error(data.message || 'Failed to update like');
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    const replyText = replyTextMap[commentId] || '';
    if (!replyText.trim()) {
      toast.error('Please enter a reply text');
      return;
    }
    try {
      setLoadingCommentAction(prev => ({ ...prev, [commentId]: true }));
      const token = getCookie('authToken');
      if (!token) {
        toast.error('Please log in to reply');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/posts/${selectedQuestionDetail._id}/comment/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: replyText })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Reply posted successfully!');
        setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
        setActiveReplyId(null);
        setExpandedRepliesMap(prev => ({ ...prev, [commentId]: true }));
        if (onCommentAdded) {
          onCommentAdded(selectedQuestionDetail._id, data.data || []);
        }
      } else {
        toast.error(data.message || 'Failed to post reply');
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error('Failed to post reply');
    } finally {
      setLoadingCommentAction(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleRepliesExpand = (commentId) => {
    setExpandedRepliesMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleRateAi = async (feedbackType) => {
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast.error('Please log in to give feedback');
        return;
      }
      setAiHelpful(prev => (prev === feedbackType ? null : feedbackType));
      const response = await fetch(`${API_BASE_URL}/api/posts/${selectedQuestionDetail._id}/ai-helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback: feedbackType })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(feedbackType === 'up' ? 'Feedback saved: Helpful 👍' : 'Feedback saved: Unhelpful 👎');
      }
    } catch (err) {
      console.error('Error rating AI answer:', err);
    }
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '28px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#09122E', margin: 0, flex: 1, lineHeight: '1.3' }}>
          {selectedQuestionDetail.content || selectedQuestionDetail.title || 'Untitled Question'}
        </h1>
        <div style={{
          background: hasAiDetail ? '#EBF3FF' : '#FFE8EC',
          color: hasAiDetail ? '#0066FF' : '#FF3B30',
          fontSize: '12px',
          fontWeight: '600',
          padding: '6px 14px',
          borderRadius: '20px',
          flexShrink: 0,
          marginLeft: '12px'
        }}>
          {hasAiDetail ? '✨ AI Answered' : 'Needs Answers'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#777E90', marginBottom: '16px' }}>
        <img
          src={authorAvatar || defaultAvatar}
          alt={authorName}
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = defaultAvatar; }}
        />
        <span><strong style={{ color: '#09122E' }}>{authorName}</strong></span>
        <span>•</span>
        <span>{formatTimeAgo(selectedQuestionDetail.createdAt)}</span>
        <span>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Eye size={14} color="#777E90" /> {viewsCount} views
        </span>
      </div>

      <p style={{ fontSize: '15px', color: '#353945', lineHeight: '1.6', marginBottom: '16px' }}>
        {selectedQuestionDetail.content || selectedQuestionDetail.title || 'Untitled Question'}
      </p>

      {(() => {
        const interests = selectedQuestionDetail.targetSegments?.interests || [];
        const industries = selectedQuestionDetail.targetSegments?.industries || [];
        const city = selectedQuestionDetail.targetSegments?.cityLocation || selectedQuestionDetail.authorCity?.name || '';
        const tags = [...interests, ...industries, city].filter(Boolean);
        if (tags.length === 0) return null;
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {tags.map((tag, idx) => (
              <span key={idx} style={{
                background: idx === 0 ? '#FFF0E6' : '#FF4D00',
                color: idx === 0 ? '#FF4D00' : '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                {tag}
              </span>
            ))}
          </div>
        );
      })()}

      <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid #E8EDF3', paddingTop: '16px', fontSize: '14px', color: '#545A69' }}>
        <button
          type="button"
          onClick={(e) => onLikePost(selectedQuestionDetail._id, e)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isLikedDetail ? '#0066FF' : '#545A69',
            fontWeight: '600'
          }}
        >
          <ThumbsUp size={18} color={isLikedDetail ? '#0066FF' : '#545A69'} /> {likesCount}
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
          <MessageSquare size={18} color="#545A69" /> {answersCount}
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
          <Share2 size={18} color="#545A69" /> Share
        </button>
      </div>

      {/* AI Answer Box */}
      {selectedQuestionDetail.targetSegments?.getAiResponses !== false && selectedQuestionDetail.aiAnswer?.content && (
        <div style={{
          background: '#F4F8FF',
          border: '1px solid #D6E4FF',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '28px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#0066FF" />
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#0066FF' }}>AI Answer</span>
              <Info size={16} color="#777E90" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#545A69' }}>
              <span>Was this helpful?</span>
              <button
                type="button"
                onClick={() => handleRateAi('up')}
                style={{ background: aiHelpful === 'up' ? '#D6E4FF' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}
              >
                <ThumbsUp size={16} color={aiHelpful === 'up' ? '#0066FF' : '#545A69'} />
              </button>
              <button
                type="button"
                onClick={() => handleRateAi('down')}
                style={{ background: aiHelpful === 'down' ? '#D6E4FF' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}
              >
                <ThumbsDown size={16} color={aiHelpful === 'down' ? '#0066FF' : '#545A69'} />
              </button>
            </div>
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#545A69' }}>
            Based on community knowledge and trusted sources
          </p>

          <div style={{ fontSize: '14px', color: '#09122E', lineHeight: '1.6', marginBottom: '16px' }}>
            {(() => {
              const aiText = selectedQuestionDetail.aiAnswer.content;
              const lines = aiText.split('\n').filter(l => l.trim().length > 0);
              const intro = lines[0] && !lines[0].match(/^\d+\./) ? lines[0] : '';
              const listItems = lines.filter(l => l.match(/^\d+\./));

              return (
                <>
                  {intro && <p style={{ marginTop: 0 }}>{intro}</p>}
                  {listItems.length > 0 ? (
                    <ol style={{ paddingLeft: '20px', margin: '12px 0 0 0' }}>
                      {listItems.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '10px' }}>
                          {item.replace(/^\d+\.\s*/, '')}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p style={{ marginTop: 0, whiteSpace: 'pre-line' }}>{aiText}</p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Dynamic Community Answers Section */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#09122E', margin: 0 }}>
            Community Answers ({answersCount})
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                background: '#FF4D00',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{showAddForm ? 'Cancel' : '+ Add Your Answer'}</span>
            </button>
          </div>
        </div>

        {/* Inline Answer Submission Form */}
        {showAddForm && (
          <form onSubmit={handleCommentSubmit} style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E8EDF3', marginBottom: '24px' }}>
            <textarea
              rows={4}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write your answer or recommendations here..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #DDE2EE',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ background: 'transparent', border: 'none', color: '#545A69', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPostingComment}
                style={{
                  background: '#FF4D00',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isPostingComment ? 'not-allowed' : 'pointer',
                  opacity: isPostingComment ? 0.7 : 1
                }}
              >
                {isPostingComment ? 'Submitting...' : 'Post Answer'}
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Community Answer Items */}
        {commentsList.length === 0 ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            color: '#777E90',
            border: '1px dashed #E8EDF3',
            borderRadius: '12px',
            fontSize: '14px'
          }}>
            No community answers yet. Be the first to share an answer!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {commentsList.map((comment, idx) => {
              const commentUser = comment.userId || {};
              const commentUserDetail = commentUser.userDetailId || {};
              const cRawName = commentUserDetail.isBusinessProfile
                ? (commentUserDetail.businessName || 'Business User')
                : (commentUserDetail.fullName || 'Community Member');
              const cName = cleanStr(cRawName, 'Community Member');
              const cAvatar = commentUserDetail.isBusinessProfile
                ? resolveImageUrl(commentUserDetail.businessLogo)
                : resolveImageUrl(commentUserDetail.profileImage);
              const cDefaultAvatar = getAvatar(commentUserDetail.gender, commentUserDetail.dateOfBirth);

              const cleanPosition = cleanStr(commentUserDetail.position);
              const cleanCompany = cleanStr(commentUserDetail.company);
              const cleanIndustry = cleanStr(commentUserDetail.industry);
              const cSubtitle = cleanPosition || cleanCompany || cleanIndustry || 'Community Member';

              const userBadge = commentUserDetail.isBusinessProfile
                ? 'Business Owner'
                : (cleanPosition ? '🏆 Top Contributor' : 'Verified Member');

              const isCommentLiked = Array.isArray(comment.likes) && comment.likes.some(id => {
                const idStr = typeof id === 'object' ? id._id : id;
                return String(idStr) === String(currentUserId);
              });
              const commentLikesCount = Array.isArray(comment.likes) ? comment.likes.length : (comment.likesCount || 0);
              const repliesList = comment.replies || [];
              const repliesCount = repliesList.length;
              const isReplying = activeReplyId === (comment._id || idx);
              const isExpanded = expandedRepliesMap[comment._id || idx];

              return (
                <div key={comment._id || idx} style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8EDF3',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left'
                }}>
                  {/* Answer Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={cAvatar || cDefaultAvatar}
                        alt={cName}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = cDefaultAvatar; }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: '#09122E' }}>
                            {cName}
                          </span>
                          <span style={{
                            background: '#FFF0E6',
                            color: '#FF4D00',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {userBadge}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#777E90', marginTop: '2px' }}>
                          {cSubtitle}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#777E90' }}>
                      {formatTimeAgo(comment.createdAt)}
                    </div>
                  </div>

                  {/* Answer Text */}
                  <div style={{ fontSize: '14px', color: '#353945', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '16px' }}>
                    {comment.text || comment.content}
                  </div>

                  {/* Answer Footer Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F4FA', paddingTop: '12px', fontSize: '13px', color: '#545A69' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleLikeComment(comment._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: isCommentLiked ? '#0066FF' : '#545A69',
                          fontWeight: '600'
                        }}
                      >
                        <ThumbsUp size={16} color={isCommentLiked ? '#0066FF' : '#545A69'} /> {commentLikesCount}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveReplyId(isReplying ? null : (comment._id || idx))}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#545A69',
                          fontWeight: '600'
                        }}
                      >
                        <MessageSquare size={16} color="#545A69" /> Reply
                      </button>

                    </div>

                    {repliesCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleRepliesExpand(comment._id || idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#0066FF',
                          fontWeight: '700',
                          fontSize: '13px'
                        }}
                      >
                        <span>{isExpanded ? 'Hide replies' : `View ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}`}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>

                  {/* Inline Reply Input Box */}
                  {isReplying && (
                    <form
                      onSubmit={(e) => handleReplySubmit(comment._id, e)}
                      style={{ marginTop: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E8EDF3' }}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={replyTextMap[comment._id] || ''}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [comment._id]: e.target.value })}
                          placeholder="Write a reply..."
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #DDE2EE',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          disabled={loadingCommentAction[comment._id]}
                          style={{
                            background: '#FF4D00',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Send size={14} /> Send
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies Drawer */}
                  {isExpanded && repliesCount > 0 && (
                    <div style={{
                      marginTop: '16px',
                      paddingLeft: '20px',
                      borderLeft: '2px solid #E8EDF3',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      {repliesList.map((reply, rIdx) => {
                        const rUser = reply.userId || {};
                        const rUserDetail = rUser.userDetailId || {};
                        const rName = rUserDetail.isBusinessProfile
                          ? (rUserDetail.businessName || 'Business User')
                          : (rUserDetail.fullName || 'Community Member');
                        const rAvatar = rUserDetail.isBusinessProfile
                          ? resolveImageUrl(rUserDetail.businessLogo)
                          : resolveImageUrl(rUserDetail.profileImage);
                        const rDefaultAvatar = getAvatar(rUserDetail.gender, rUserDetail.dateOfBirth);

                        return (
                          <div key={reply._id || rIdx} style={{
                            background: '#F8FAFC',
                            borderRadius: '10px',
                            padding: '12px 16px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img
                                  src={rAvatar || rDefaultAvatar}
                                  alt={rName}
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                  onError={(e) => { e.target.src = rDefaultAvatar; }}
                                />
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#09122E' }}>
                                  {rName}
                                </span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#777E90' }}>
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#353945', lineHeight: '1.5' }}>
                              {reply.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailView;
