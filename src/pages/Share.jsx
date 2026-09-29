import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header';
import Footer from '../component/Footer';
import CreatePost from '../component/CreatePost';
import PostCard from '../component/PostCard';
import API_BASE_URL from '../utils/config';
import { getCookie, setCookie, getUserProfile } from '../utils/auth';
import { getAvatar, resolveImageUrl } from '../utils/avatarHelper';
import {
  X, Settings, TrendingUp, Trophy, ChevronRight, Check, Plus, ArrowLeft,
  Search, Filter, Sparkles, Info, ThumbsUp, ThumbsDown, MessageSquare, Share2,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/style.css';

const getTopicIcon = (topicName) => {
  const name = (topicName || '').toLowerCase();
  if (name.includes('tech') || name.includes('software') || name.includes('code')) return '💻';
  if (name.includes('busin') || name.includes('market') || name.includes('trade')) return '📊';
  if (name.includes('job') || name.includes('career') || name.includes('work')) return '💼';
  if (name.includes('edu') || name.includes('school') || name.includes('learn')) return '🎓';
  if (name.includes('finan') || name.includes('money') || name.includes('invest')) return '₹';
  if (name.includes('home') || name.includes('liv') || name.includes('realty')) return '🏡';
  if (name.includes('health') || name.includes('well') || name.includes('fit')) return '❤️';
  if (name.includes('food') || name.includes('bev') || name.includes('dine') || name.includes('restaur')) return '🍳';
  if (name.includes('trav') || name.includes('tour') || name.includes('flight')) return '✈️';
  if (name.includes('sport') || name.includes('game') || name.includes('gym')) return '🏋️';
  return '📌';
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const Share = () => {
  const navigate = useNavigate();
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [topSharers, setTopSharers] = useState([]);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);

  // Filter & Search states matching 343734.png
  const [activeFilterTab, setActiveFilterTab] = useState('All Questions');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Answer & Detail states matching 343735.png
  const [aiHelpful, setAiHelpful] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState('');

  // Dynamic Interest Block States
  const [userInterests, setUserInterests] = useState([]);
  const [allAvailableInterests, setAllAvailableInterests] = useState([]);
  const [isManageInterestsOpen, setIsManageInterestsOpen] = useState(false);
  const [editingInterests, setEditingInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);

  // Active question detail and follow state
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState(null);
  const [followedUsers, setFollowedUsers] = useState({});

  const handleUserClick = (userId) => {
    if (!userId) return;
    const currentUser = getUserProfile();
    const currentUserId = currentUser?._id || currentUser?.id;
    const targetId = typeof userId === 'object' ? userId._id : userId;
    if (currentUserId && (currentUserId === targetId)) {
      navigate('/profile');
    } else {
      navigate('/userprofile', { state: { userId: targetId } });
    }
  };

  const handleConnectUser = async (targetUserId) => {
    if (!targetUserId) return;
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast.error('Please log in to send connection requests');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/connection/connectionrequest/${targetUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || 'Connection request sent!');
        setFollowedUsers(prev => ({ ...prev, [targetUserId]: true }));
      } else {
        toast.info(data.message || 'Connection request sent or active');
        setFollowedUsers(prev => ({ ...prev, [targetUserId]: true }));
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      toast.error('Failed to send connection request');
    }
  };

  const toggleInterestPill = async (topicName) => {
    let updated;
    if (userInterests.some(i => i.toLowerCase() === topicName.toLowerCase())) {
      updated = userInterests.filter(i => i.toLowerCase() !== topicName.toLowerCase());
    } else {
      updated = [...userInterests, topicName];
    }
    setUserInterests(updated);

    try {
      const token = getCookie('authToken');
      if (!token) return;
      const formData = new FormData();
      formData.append('interests', updated.join(','));
      await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
    } catch (err) {
      console.error('Error updating interest:', err);
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestionDetail(question);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchPosts = useCallback(async (pageNum = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const token = getCookie('authToken');
      const limit = 10;
      const response = await fetch(`${API_BASE_URL}/api/posts?sortBy=${sortBy}&page=${pageNum}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const newPosts = Array.isArray(data.data) ? data.data : [];
        if (isInitial) {
          setPosts(newPosts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }

        if (data.pagination) {
          setHasMore(data.pagination.hasMore);
          setTotalPosts(data.pagination.totalPosts);
        } else {
          setHasMore(newPosts.length === limit);
          if (isInitial) setTotalPosts(newPosts.length);
        }
        setPage(pageNum);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sortBy]);

  const fetchTopSharers = async () => {
    try {
      const token = getCookie('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts/top-sharers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setTopSharers(data.data);
      }
    } catch (err) {
      console.error('Error fetching top sharers:', err);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [sortBy, fetchPosts]);

  useEffect(() => {
    fetchTopSharers();
  }, []);

  useEffect(() => {
    const fetchUserProfileAndInterests = async () => {
      try {
        const token = getCookie('authToken');
        if (!token) return;

        // 1. Fetch user profile
        const profRes = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          const profile = profData?.data?.profile || profData?.profile || {};
          if (Array.isArray(profile.interests)) {
            setUserInterests(profile.interests);
          }
        }

        // 2. Fetch master interests list from API
        const listRes = await fetch(`${API_BASE_URL}/api/list/interest`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          const interestsArr = listData?.data?.interests || listData?.interests || [];
          if (Array.isArray(interestsArr)) {
            const names = interestsArr.map(i => (typeof i === 'string' ? i : i.name)).filter(Boolean);
            setAllAvailableInterests(names);
          }
        }
      } catch (err) {
        console.error('Error loading interests from API:', err);
      }
    };

    fetchUserProfileAndInterests();
  }, []);

  const handleSaveInterests = async () => {
    try {
      setSavingInterests(true);
      const token = getCookie('authToken');
      if (!token) return;

      const formData = new FormData();
      formData.append('interests', editingInterests.join(','));

      await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setUserInterests(editingInterests);
      setIsManageInterestsOpen(false);
      fetchPosts(1, true);
    } catch (err) {
      console.error('Error saving interests:', err);
      setUserInterests(editingInterests);
      setIsManageInterestsOpen(false);
    } finally {
      setSavingInterests(false);
    }
  };

  // Dynamic calculation of trending questions from live posts
  const dynamicTrendingQuestions = [...posts].sort((a, b) => {
    const scoreA = (a.reactions?.length || 0) + (a.commentsCount || 0) + (a.reshareCount || 0);
    const scoreB = (b.reactions?.length || 0) + (b.commentsCount || 0) + (b.reshareCount || 0);
    return scoreB - scoreA;
  }).slice(0, 5);

  // Dynamic calculation of related questions for single question detail view
  const dynamicRelatedQuestions = posts.filter(p => p._id !== selectedQuestionDetail?._id).slice(0, 5);

  // Filter posts based on tab and search query
  const filteredPosts = posts.filter(post => {
    const userProfile = getUserProfile();
    const currentUserId = userProfile?.originalid || userProfile?._id || userProfile?.id;

    if (activeFilterTab === 'My Questions') {
      const authorId = post.userId?._id || post.userId;
      if (String(authorId) !== String(currentUserId)) return false;
    } else if (activeFilterTab === 'Unanswered') {
      const answersCount = post.commentsCount || (post.comments ? post.comments.length : 0);
      if (answersCount > 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contentText = (post.content || '').toLowerCase();
      const titleText = (post.title || '').toLowerCase();
      return contentText.includes(q) || titleText.includes(q);
    }

    return true;
  });


  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <div className="share-page-wrapper" style={{ width: '100%' }}>
          <div className="share-page-container" style={{ padding: '20px 0' }}>
            <div className="share-two-column-layout" style={{ display: 'flex', gap: '30px', width: '100%', alignItems: 'flex-start' }}>
              
              {/* Left Column: Feed / Question Detail */}
              <div className="share-left-column" style={{ flex: isCreateExpanded ? '1' : '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Back to Questions Link (343735.png) */}
                {selectedQuestionDetail && (
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionDetail(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#0066FF',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: '0 0 10px 0',
                      width: 'fit-content'
                    }}
                  >
                    <ArrowLeft size={16} color="#0066FF" />
                    <span>Back to Questions</span>
                  </button>
                )}

                {/* Expanded Ask Question Form Card (343713.jpg) */}
                {isCreateExpanded && (
                  <CreatePost
                    onPostCreated={(newPost) => {
                      setPosts([newPost, ...posts]);
                      fetchTopSharers();
                      setIsCreateExpanded(false);
                    }}
                    isExpanded={isCreateExpanded}
                    setIsExpanded={setIsCreateExpanded}
                  />
                )}

                {/* Main Feed Header & List (343734.png) */}
                {!isCreateExpanded && !selectedQuestionDetail && (
                  <div>
                    {/* Header Title Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', textAlign: 'left' }}>
                      <div>
                        <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#09122E', margin: '0 0 6px 0' }}>Questions</h1>
                        <p style={{ fontSize: '15px', color: '#777E90', margin: 0 }}>Get real answers from AI and the Connect.in community.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreateExpanded(true)}
                        style={{
                          background: '#EA650A',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '12px 24px',
                          fontSize: '15px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(234, 101, 10, 0.25)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Plus size={20} color="#ffffff" />
                        <span>Ask a Question</span>
                      </button>
                    </div>

                    {/* Filter Tabs & Sort Dropdown */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['All Questions', 'My Questions', 'From Connections', 'Unanswered'].map((tabName) => {
                          const isActive = activeFilterTab === tabName;
                          return (
                            <button
                              key={tabName}
                              type="button"
                              onClick={() => setActiveFilterTab(tabName)}
                              style={{
                                background: isActive ? '#EA650A' : '#FFFFFF',
                                color: isActive ? '#FFFFFF' : '#09122E',
                                border: isActive ? 'none' : '1px solid #DDE2EE',
                                borderRadius: '24px',
                                padding: '8px 20px',
                                fontSize: '14px',
                                fontWeight: isActive ? '700' : '600',
                                cursor: 'pointer',
                                boxShadow: isActive ? '0 2px 8px rgba(234, 101, 10, 0.2)' : 'none',
                                transition: 'all 0.2s'
                              }}
                            >
                              {tabName}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #DDE2EE',
                            borderRadius: '10px',
                            fontSize: '14px',
                            color: '#09122E',
                            background: '#FFFFFF',
                            outline: 'none',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          <option value="latest">Latest</option>
                          <option value="popularity">Popularity</option>
                        </select>
                      </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color="#777E90" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          placeholder="Search questions, topics or keywords..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px 12px 46px',
                            borderRadius: '10px',
                            border: '1px solid #E8EDF3',
                            background: '#F8F9FB',
                            fontSize: '14px',
                            color: '#09122E',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        style={{
                          border: '1.5px solid #EA650A',
                          background: '#FFFFFF',
                          color: '#EA650A',
                          borderRadius: '10px',
                          padding: '0 20px',
                          fontSize: '14px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Filter size={16} color="#EA650A" />
                        <span>Filter</span>
                      </button>
                    </div>

                    {/* Feed Questions List */}
                    {loading ? (
                      <div className="posts-loading">
                        <div className="spinner"></div>
                        <span>Loading questions...</span>
                      </div>
                    ) : error ? (
                      <div className="posts-error">{error}</div>
                    ) : filteredPosts.length === 0 ? (
                      <div className="no-posts" style={{ background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #E8EDF3' }}>
                        <p style={{ color: '#777E90', fontSize: '15px' }}>No questions found matching your criteria.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredPosts.map((post, idx) => {
                          const author = post.userId || {};
                          const authorDetail = author.userDetailId || {};
                          const authorName = authorDetail.isBusinessProfile
                            ? (authorDetail.businessName || 'Business User')
                            : (authorDetail.fullName || 'User');
                          const authorAvatar = authorDetail.isBusinessProfile
                            ? resolveImageUrl(authorDetail.businessLogo)
                            : resolveImageUrl(authorDetail.profileImage);
                          const defaultAvatar = getAvatar(authorDetail.gender, authorDetail.dateOfBirth);

                          const title = post.content || post.title || 'Untitled Question';
                          const likesCount = post.reactions?.length || post.likesCount || (idx + 1) * 3;
                          const answersCount = post.commentsCount || (post.comments ? post.comments.length : 0);
                          const viewsCount = post.views || post.viewsCount || (idx + 1) * 110;
                          const hasAi = post.targetSegments?.getAiResponses !== false;
                          const categoryTag = post.targetSegments?.interests?.[0] || 'Food & Beverage';

                          return (
                            <div
                              key={post._id || idx}
                              onClick={() => handleQuestionClick(post)}
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
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
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
                                    background: '#FFE8EC',
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

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                <span style={{
                                  background: '#FFF0E6',
                                  color: '#EA650A',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  padding: '4px 12px',
                                  borderRadius: '12px'
                                }}>
                                  {categoryTag}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', color: '#777E90' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <ThumbsUp size={16} color="#777E90" />
                                  <span>{likesCount}</span>
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
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Single Question Detail View (343735.png) */}
                {!isCreateExpanded && selectedQuestionDetail && (
                  <div style={{ textAlign: 'left' }}>
                    {/* Question Header Card */}
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#09122E', margin: 0, flex: 1, lineHeight: '1.3' }}>
                          {selectedQuestionDetail.content || selectedQuestionDetail.title || 'Untitled Question'}
                        </h1>
                        <div style={{
                          background: selectedQuestionDetail.targetSegments?.getAiResponses !== false ? '#EBF3FF' : '#FFE8EC',
                          color: selectedQuestionDetail.targetSegments?.getAiResponses !== false ? '#0066FF' : '#FF3B30',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          flexShrink: 0,
                          marginLeft: '12px'
                        }}>
                          {selectedQuestionDetail.targetSegments?.getAiResponses !== false ? '✨ AI Answered' : 'Needs Answers'}
                        </div>
                      </div>

                      {(() => {
                        const author = selectedQuestionDetail.userId || {};
                        const authorDetail = author.userDetailId || {};
                        const authorName = authorDetail.isBusinessProfile
                          ? (authorDetail.businessName || 'Business User')
                          : (authorDetail.fullName || 'User');
                        const authorAvatar = authorDetail.isBusinessProfile
                          ? resolveImageUrl(authorDetail.businessLogo)
                          : resolveImageUrl(authorDetail.profileImage);
                        const defaultAvatar = getAvatar(authorDetail.gender, authorDetail.dateOfBirth);
                        const likesCount = selectedQuestionDetail.reactions?.length || selectedQuestionDetail.likesCount || 12;
                        const answersCount = selectedQuestionDetail.commentsCount || (selectedQuestionDetail.comments ? selectedQuestionDetail.comments.length : 8);
                        const viewsCount = selectedQuestionDetail.views || selectedQuestionDetail.viewsCount || 320;

                        return (
                          <>
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
                              I'm planning to start a restaurant in Chennai. Would love advice on licenses, location, costs and any local insights from people with experience.
                            </p>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                              {['Food & Beverage', 'Chennai', 'Business Setup', 'Licenses', 'Entrepreneurship'].map(tag => (
                                <span key={tag} style={{
                                  background: tag === 'Food & Beverage' ? '#FFF0E6' : '#F0F4FA',
                                  color: tag === 'Food & Beverage' ? '#EA650A' : '#545A69',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  padding: '4px 12px',
                                  borderRadius: '12px'
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid #E8EDF3', paddingTop: '16px', fontSize: '14px', color: '#545A69' }}>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
                                <ThumbsUp size={18} color="#545A69" /> {likesCount}
                              </button>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
                                <MessageSquare size={18} color="#545A69" /> {answersCount}
                              </button>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
                                <Share2 size={18} color="#545A69" /> Share
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* AI Answer Box (343735.png) */}
                    <div style={{
                      background: '#F4F8FF',
                      border: '1px solid #D6E4FF',
                      borderRadius: '16px',
                      padding: '24px',
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
                            onClick={() => setAiHelpful('up')}
                            style={{ background: aiHelpful === 'up' ? '#D6E4FF' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}
                          >
                            <ThumbsUp size={16} color={aiHelpful === 'up' ? '#0066FF' : '#545A69'} />
                          </button>
                          <button
                            onClick={() => setAiHelpful('down')}
                            style={{ background: aiHelpful === 'down' ? '#D6E4FF' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}
                          >
                            <ThumbsDown size={16} color={aiHelpful === 'down' ? '#0066FF' : '#545A69'} />
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#545A69' }}>
                        Based on community knowledge and trusted sources
                      </p>

                      <div style={{ fontSize: '14px', color: '#09122E', lineHeight: '1.6' }}>
                        <p style={{ marginTop: 0 }}>To start a restaurant in Chennai, consider the following key aspects:</p>
                        <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <li><strong>Licenses & Approvals:</strong> FSSAI license, trade license from Greater Chennai Corporation, fire safety NOC, Shops & Establishments registration, GST registration.</li>
                          <li><strong>Location:</strong> Choose a high-footfall area (e.g., OMR, Anna Nagar, T. Nagar, Velachery) based on your target audience and budget.</li>
                          <li><strong>Investment:</strong> Typical setup cost ranges from ₹15–50 lakhs depending on size, location and cuisine.</li>
                          <li><strong>Staffing:</strong> Hire experienced kitchen staff and ensure proper training in food safety and hygiene.</li>
                          <li><strong>Local Preferences:</strong> Chennai customers value quality, consistency and good service. South Indian cuisine and fusion concepts perform well.</li>
                        </ol>
                        <p style={{ marginBottom: 0 }}>For detailed checklists and cost estimates, you can refer to government portals and talk to existing restaurant owners in Chennai.</p>
                      </div>

                      <button
                        onClick={() => setShowSources(!showSources)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #DDE2EE',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0066FF',
                          cursor: 'pointer',
                          marginTop: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>View Sources</span>
                        <ChevronDown size={16} color="#0066FF" />
                      </button>
                    </div>

                    {/* Community Answers Section (343735.png) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#09122E', margin: 0 }}>
                          Community Answers (8)
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#777E90' }}>
                            <span>Sort by:</span>
                            <select style={{ border: '1px solid #DDE2EE', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: '#09122E', background: '#FFF', outline: 'none' }}>
                              <option>Most Helpful</option>
                              <option>Latest</option>
                            </select>
                          </div>
                          <button
                            onClick={() => setIsAddingAnswer(!isAddingAnswer)}
                            style={{
                              background: '#EA650A',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 20px',
                              fontSize: '14px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Plus size={16} color="#FFFFFF" />
                            <span>Add Your Answer</span>
                          </button>
                        </div>
                      </div>

                      {/* Community Answer Card */}
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img
                              src="/default-avatar.png"
                              alt="Priya Sharma"
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '15px', fontWeight: '700', color: '#09122E' }}>Priya Sharma</span>
                                <span style={{
                                  background: '#FFF0E6',
                                  color: '#EA650A',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Trophy size={12} color="#EA650A" /> Top Contributor
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#777E90', marginTop: '2px' }}>
                                Restaurant Consultant • 5 years experience • 156 answers
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '12px', color: '#777E90' }}>3 hours ago</span>
                        </div>

                        <div style={{ fontSize: '14px', color: '#353945', lineHeight: '1.6', marginBottom: '16px' }}>
                          <p style={{ margin: '0 0 8px 0' }}>I run a restaurant consulting firm in Chennai. Here are my key recommendations:</p>
                          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Get FSSAI and local corporation licenses early - this can take 4–8 weeks.</li>
                            <li>Location is critical. For family dining, areas like Anna Nagar and Velachery work well. For younger crowd, OMR and ECR are good.</li>
                            <li>Keep a buffer of 20–30% over your estimated budget.</li>
                            <li>Focus on a clear concept and consistent quality rather than a very large menu.</li>
                            <li>Build relationships with local suppliers for fresh ingredients at better rates.</li>
                          </ul>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E8EDF3', paddingTop: '14px', fontSize: '13px', color: '#545A69' }}>
                          <div style={{ display: 'flex', gap: '20px' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
                              <ThumbsUp size={16} color="#545A69" /> 18
                            </button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
                              <MessageSquare size={16} color="#545A69" /> Reply
                            </button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#545A69', fontWeight: '600' }}>
                              <Share2 size={16} color="#545A69" /> Share
                            </button>
                          </div>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066FF', fontWeight: '600', fontSize: '13px' }}>
                            View 2 replies ∨
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: 100% Dynamic Widgets */}
              {!isCreateExpanded && (
                <div className="share-right-column" style={{ flex: '1.1', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
                  {!selectedQuestionDetail ? (
                    <>
                      {/* Main Feed Sidebar (343734.png) */}

                      {/* Card 1: Your Interests */}
                      <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E' }}>Your Interests</h3>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingInterests([...userInterests]);
                              setIsManageInterestsOpen(true);
                            }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                            title="Settings"
                          >
                            <Settings size={18} color="#777E90" />
                          </button>
                        </div>

                        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#777E90' }}>
                          Select topics to see questions that match your interests.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                          {(allAvailableInterests.length > 0 ? allAvailableInterests : userInterests).map((topicName) => {
                            const isSelected = userInterests.some(i => i.toLowerCase() === topicName.toLowerCase());
                            const icon = getTopicIcon(topicName);
                            return (
                              <button
                                key={topicName}
                                type="button"
                                onClick={() => toggleInterestPill(topicName)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  border: isSelected ? '1px solid #0066FF' : '1px solid #E8EDF3',
                                  background: isSelected ? '#F0F7FF' : '#FFFFFF',
                                  color: isSelected ? '#0066FF' : '#353945',
                                  fontSize: '12px',
                                  fontWeight: isSelected ? '600' : '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span>{icon} {topicName}</span>
                                {isSelected ? <Check size={14} color="#0066FF" /> : <Plus size={14} color="#777E90" />}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingInterests([...userInterests]);
                            setIsManageInterestsOpen(true);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0066FF',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: 0
                          }}
                        >
                          <span>Manage all interests</span>
                          <span>→</span>
                        </button>
                      </div>

                      {/* Card 2: Trending Questions */}
                      <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} color="#0066FF" /> Trending Questions
                          </h3>
                        </div>

                        {dynamicTrendingQuestions.length === 0 ? (
                          <p style={{ fontSize: '12px', color: '#777E90', margin: 0 }}>No questions asked yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {dynamicTrendingQuestions.map((item, idx) => {
                              const title = item.content || item.title || 'Untitled Question';
                              const answersCount = item.commentsCount || (item.comments ? item.comments.length : 0);
                              const viewsCount = item.views || item.viewsCount || (idx + 1) * 120;
                              return (
                                <div
                                  key={item._id || idx}
                                  onClick={() => handleQuestionClick(item)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    padding: '6px 4px',
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FB')}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <div style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: '#F0F7FF',
                                    color: '#0066FF',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px'
                                  }}>
                                    {idx + 1}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      color: '#09122E',
                                      lineHeight: '1.35',
                                      marginBottom: '4px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }} title={title}>
                                      {title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#777E90' }}>
                                      {answersCount} answers • {viewsCount} views
                                    </div>
                                  </div>
                                  <ChevronRight size={16} color="#777E90" style={{ flexShrink: 0, marginTop: '4px' }} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Card 3: Top Contributors */}
                      <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Trophy size={18} color="#EA650A" /> Top Contributors
                          </h3>
                        </div>

                        {topSharers.length === 0 ? (
                          <p style={{ fontSize: '12px', color: '#777E90', margin: 0 }}>No contributors yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {topSharers.map((sharer) => {
                              const userObj = sharer.user || {};
                              const userDetail = userObj.userDetailId || {};
                              const isBusiness = userDetail.isBusinessProfile;
                              const fullName = isBusiness
                                ? (userDetail.businessName || 'Business User')
                                : (userDetail.fullName || 'User');
                              const avatar = isBusiness
                                ? resolveImageUrl(userDetail.businessLogo)
                                : resolveImageUrl(userDetail.profileImage);
                              const defaultAvatar = getAvatar(userDetail.gender, userDetail.dateOfBirth);
                              const targetUserId = userObj._id || sharer._id;
                              const isFollowing = followedUsers[targetUserId];

                              return (
                                <div key={targetUserId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                  <div
                                    onClick={() => handleUserClick(targetUserId)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, cursor: 'pointer' }}
                                  >
                                    <img
                                      src={avatar || defaultAvatar}
                                      alt={fullName}
                                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                      onError={(e) => { e.target.src = defaultAvatar; }}
                                    />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {fullName}
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#777E90', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {sharer.sharesCount} questions asked
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleConnectUser(targetUserId)}
                                    style={{
                                      border: '1px solid #0066FF',
                                      background: isFollowing ? '#0066FF' : '#ffffff',
                                      color: isFollowing ? '#ffffff' : '#0066FF',
                                      borderRadius: '8px',
                                      padding: '6px 14px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      flexShrink: 0
                                    }}
                                  >
                                    {isFollowing ? 'Following' : 'Follow'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Single Question View Sidebar (343735.png) */}

                      {/* Card 1: About the Person */}
                      <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px', textAlign: 'left' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#09122E' }}>About the Person</h3>

                        {(() => {
                          const author = selectedQuestionDetail.userId || {};
                          const authorDetail = author.userDetailId || {};
                          const authorName = authorDetail.isBusinessProfile
                            ? (authorDetail.businessName || 'Business User')
                            : (authorDetail.fullName || 'User');
                          const authorAvatar = authorDetail.isBusinessProfile
                            ? resolveImageUrl(authorDetail.businessLogo)
                            : resolveImageUrl(authorDetail.profileImage);
                          const defaultAvatar = getAvatar(authorDetail.gender, authorDetail.dateOfBirth);
                          const authorHeadline = authorDetail.position || authorDetail.businessCategory || 'Connect Member';
                          const authorCity = authorDetail.city || selectedQuestionDetail.targetSegments?.cityLocation || '';
                          const authorId = author._id;
                          const isConnected = followedUsers[authorId];

                          const likesCount = selectedQuestionDetail.reactions?.length || selectedQuestionDetail.likesCount || 12;
                          const answersCount = selectedQuestionDetail.commentsCount || (selectedQuestionDetail.comments ? selectedQuestionDetail.comments.length : 8);
                          const viewsCount = selectedQuestionDetail.views || selectedQuestionDetail.viewsCount || 320;
                          const timeAgo = formatTimeAgo(selectedQuestionDetail.createdAt);

                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
                                  <img
                                    src={authorAvatar || defaultAvatar}
                                    alt={authorName}
                                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                    onError={(e) => { e.target.src = defaultAvatar; }}
                                  />
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {authorName}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#545A69', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {authorHeadline}
                                    </div>
                                    {authorCity && (
                                      <div style={{ fontSize: '12px', color: '#777E90', marginBottom: '6px' }}>
                                        {authorCity}
                                      </div>
                                    )}
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => { e.preventDefault(); handleUserClick(authorId); }}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleUserClick(authorId); }}
                                      style={{ fontSize: '12px', fontWeight: '600', color: '#0066FF', cursor: 'pointer' }}
                                    >
                                      View Profile
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleConnectUser(authorId)}
                                  style={{
                                    border: '1px solid #0066FF',
                                    background: isConnected ? '#0066FF' : '#ffffff',
                                    color: isConnected ? '#ffffff' : '#0066FF',
                                    borderRadius: '8px',
                                    padding: '6px 14px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                >
                                  {isConnected ? 'Connected' : 'Connect'}
                                </button>
                              </div>

                              <div style={{ borderTop: '1px solid #E8EDF3', paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#09122E' }}>{likesCount}</div>
                                  <div style={{ fontSize: '11px', color: '#777E90' }}>Likes</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#09122E' }}>{answersCount}</div>
                                  <div style={{ fontSize: '11px', color: '#777E90' }}>Answers</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#09122E' }}>{viewsCount}</div>
                                  <div style={{ fontSize: '11px', color: '#777E90' }}>Views</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#09122E' }}>{timeAgo}</div>
                                  <div style={{ fontSize: '11px', color: '#777E90' }}>Asked</div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Card 2: Related Questions */}
                      <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E' }}>Related Questions</h3>
                        </div>

                        {dynamicRelatedQuestions.length === 0 ? (
                          <p style={{ fontSize: '12px', color: '#777E90', margin: 0 }}>No other questions found.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {dynamicRelatedQuestions.map((item, idx) => {
                              const title = item.content || item.title || 'Untitled Question';
                              const answersCount = item.commentsCount || (item.comments ? item.comments.length : 0);
                              const viewsCount = item.views || item.viewsCount || 100;
                              return (
                                <div
                                  key={item._id || idx}
                                  onClick={() => handleQuestionClick(item)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justify: 'space-between',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    padding: '4px 0'
                                  }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      color: '#0066FF',
                                      lineHeight: '1.35',
                                      marginBottom: '4px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}>
                                      {title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#777E90' }}>
                                      {answersCount} answers • {viewsCount} views
                                    </div>
                                  </div>
                                  <ChevronRight size={16} color="#777E90" style={{ flexShrink: 0, marginTop: '4px' }} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Card 3: Top Contributors */}
                      <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E' }}>Top Contributors</h3>
                        </div>

                        {topSharers.length === 0 ? (
                          <p style={{ fontSize: '12px', color: '#777E90', margin: 0 }}>No contributors yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {topSharers.map((sharer) => {
                              const userObj = sharer.user || {};
                              const userDetail = userObj.userDetailId || {};
                              const isBusiness = userDetail.isBusinessProfile;
                              const fullName = isBusiness
                                ? (userDetail.businessName || 'Business User')
                                : (userDetail.fullName || 'User');
                              const avatar = isBusiness
                                ? resolveImageUrl(userDetail.businessLogo)
                                : resolveImageUrl(userDetail.profileImage);
                              const defaultAvatar = getAvatar(userDetail.gender, userDetail.dateOfBirth);
                              const targetUserId = userObj._id || sharer._id;
                              const isConnected = followedUsers[targetUserId];

                              return (
                                <div key={targetUserId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                  <div
                                    onClick={() => handleUserClick(targetUserId)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, cursor: 'pointer' }}
                                  >
                                    <img
                                      src={avatar || defaultAvatar}
                                      alt={fullName}
                                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                      onError={(e) => { e.target.src = defaultAvatar; }}
                                    />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {fullName}
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#777E90', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {sharer.sharesCount} questions asked
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleConnectUser(targetUserId)}
                                    style={{
                                      border: '1px solid #0066FF',
                                      background: isConnected ? '#0066FF' : '#ffffff',
                                      color: isConnected ? '#ffffff' : '#0066FF',
                                      borderRadius: '8px',
                                      padding: '6px 14px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  >
                                    {isConnected ? 'Connected' : 'Connect'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Share;
