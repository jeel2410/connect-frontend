import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header';
import Footer from '../component/Footer';
import CreatePost from '../component/CreatePost';
import API_BASE_URL from '../utils/config';
import { getCookie, getUserProfile } from '../utils/auth';
import { getAvatar, resolveImageUrl } from '../utils/avatarHelper';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/style.css';

// Sub-components
import ManageInterestsModal from '../component/Share/ManageInterestsModal';
import QuestionFeedCard from '../component/Share/QuestionFeedCard';
import QuestionDetailView from '../component/Share/QuestionDetailView';
import ShareSidebar from '../component/Share/ShareSidebar';

const Share = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiHelpful, setAiHelpful] = useState(null);

  // Dynamic Interest Block States
  const [userInterests, setUserInterests] = useState([]);
  const [allAvailableInterests, setAllAvailableInterests] = useState([]);
  const [isManageInterestsOpen, setIsManageInterestsOpen] = useState(false);
  const [editingInterests, setEditingInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);

  // Active question detail and follow state
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState(null);
  const [followedUsers, setFollowedUsers] = useState({});

  const currentUser = getUserProfile();
  const currentUserId = currentUser?.originalid || currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.user?._id;

  const handleUserClick = (userId) => {
    if (!userId) return;
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

  const handleLikePost = async (postId, e) => {
    if (e) e.stopPropagation();
    if (!postId) return;
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast.error('Please log in to react to posts');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction: '👍' })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const updatedReactions = data.data || [];
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p._id === postId ? { ...p, reactions: updatedReactions } : p
          )
        );
        if (selectedQuestionDetail && selectedQuestionDetail._id === postId) {
          setSelectedQuestionDetail(prev => ({ ...prev, reactions: updatedReactions }));
        }
      }
    } catch (err) {
      console.error('Error reacting to post:', err);
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
  };

  const handleQuestionClick = (question) => {
    if (!question) return;
    const currentViews = (question.views || question.viewsCount || 0) + 1;
    const updatedQuestion = { ...question, views: currentViews, viewsCount: currentViews };
    setSelectedQuestionDetail(updatedQuestion);
    setPosts(prevPosts =>
      prevPosts.map(p => (p._id === question._id ? { ...p, views: currentViews } : p))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const token = getCookie('authToken');
      if (token && question._id) {
        fetch(`${API_BASE_URL}/api/posts/${question._id}/view`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(console.error);
      }
    } catch (err) {
      console.error('Error incrementing post view:', err);
    }
  };

  const fetchPosts = useCallback(async (pageNum = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      setError(null);

      const token = getCookie('authToken');
      const limit = 10;
      const response = await fetch(`${API_BASE_URL}/api/posts?sortBy=${sortBy}&filter=${activeTab}&page=${pageNum}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      const newPosts = Array.isArray(data?.data)
        ? data.data
        : (data?.data?.posts || data?.posts || []);

      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sortBy, activeTab]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const [topContributors, setTopContributors] = useState([]);

  const fetchTopSharers = async () => {
    try {
      const token = getCookie('authToken');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/posts/top-sharers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const sharers = data?.data || data?.topSharers || [];
        setTopContributors(sharers);
      }
    } catch (err) {
      console.error('Error fetching top sharers from API:', err);
    }
  };

  useEffect(() => {
    fetchTopSharers();
  }, []);

  useEffect(() => {
    const fetchUserProfileAndInterests = async () => {
      try {
        const token = getCookie('authToken');
        if (!token) return;

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

  const dynamicTrendingQuestions = [...posts].sort((a, b) => {
    const scoreA = (a.reactions?.length || 0) + (a.commentsCount || 0) + (a.reshareCount || 0);
    const scoreB = (b.reactions?.length || 0) + (b.commentsCount || 0) + (b.reshareCount || 0);
    return scoreB - scoreA;
  }).slice(0, 5);

  const dynamicRelatedQuestions = selectedQuestionDetail
    ? posts.filter(p => p._id !== selectedQuestionDetail._id).slice(0, 4)
    : [];

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

  const getTopicIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('food') || n.includes('restaurant') || n.includes('cafe')) return '🍕';
    if (n.includes('hotel') || n.includes('travel') || n.includes('tourism')) return '🏨';
    if (n.includes('interior') || n.includes('design') || n.includes('architect')) return '🛋️';
    if (n.includes('retail') || n.includes('shop') || n.includes('store')) return '🛍️';
    if (n.includes('real estate') || n.includes('property')) return '🏢';
    if (n.includes('tech') || n.includes('it') || n.includes('software')) return '💻';
    if (n.includes('legal') || n.includes('law')) return '⚖️';
    if (n.includes('health') || n.includes('medical')) return '🩺';
    if (n.includes('finance') || n.includes('tax')) return '📊';
    return '📌';
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery.trim() === '' ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
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
                
                {/* Back to Questions Link */}
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

                {/* Expanded Ask Question Form Card */}
                {isCreateExpanded && (
                  <CreatePost
                    onPostCreated={(newPost) => {
                      setPosts([newPost, ...posts]);
                      setIsCreateExpanded(false);
                    }}
                    isExpanded={isCreateExpanded}
                    setIsExpanded={setIsCreateExpanded}
                  />
                )}

                {/* Main Feed View vs Question Detail View */}
                {!selectedQuestionDetail ? (
                  <>
                    {/* Header Bar matching image 343734.png */}
                    {!isCreateExpanded && (
                      <div className="ask-header-card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        textAlign: 'left',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#09122E' }}>
                            Questions
                          </h1>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#545A69' }}>
                            Get real answers from AI and the Connect.in community.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCreateExpanded(true)}
                          style={{
                            background: '#FF4D00',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(255, 77, 0, 0.2)'
                          }}
                        >
                          <Plus size={18} color="#FFFFFF" />
                          <span>Ask a Question</span>
                        </button>
                      </div>
                    )}

                    {/* Filter Tabs & Sort Row matching image 343734.png */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {[
                          { id: 'all', label: 'All Questions' },
                          { id: 'my', label: 'My Questions' },
                          { id: 'connections', label: 'From Connections' },
                          { id: 'unanswered', label: 'Unanswered' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                              padding: '8px 20px',
                              borderRadius: '20px',
                              border: 'none',
                              background: activeTab === tab.id ? '#FF4D00' : '#FFFFFF',
                              color: activeTab === tab.id ? '#FFFFFF' : '#545A69',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(255, 77, 0, 0.25)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: '1px solid #E8EDF3',
                          background: '#FFFFFF',
                          fontSize: '13px',
                          color: '#545A69',
                          fontWeight: '600',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="newest">Latest</option>
                        <option value="popularity">Most Popular</option>
                      </select>
                    </div>

                    {/* Search Bar matching image 343734.png */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} color="#777E90" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          placeholder="Search questions, topics or keywords..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px 12px 44px',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            background: '#F0F7FF',
                            fontSize: '14px',
                            color: '#09122E',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    {/* Questions Feed List */}
                    {loading ? (
                      <div style={{ padding: '40px 0', textAlign: 'center', color: '#777E90' }}>Loading questions...</div>
                    ) : error ? (
                      <div style={{ padding: '40px 0', textAlign: 'center', color: '#FF3B30' }}>{error}</div>
                    ) : filteredPosts.length === 0 ? (
                      <div style={{ padding: '40px 0', textAlign: 'center', color: '#777E90' }}>No questions found.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredPosts.map((post, idx) => (
                          <QuestionFeedCard
                            key={post._id || idx}
                            post={post}
                            idx={idx}
                            onQuestionClick={handleQuestionClick}
                            onLikePost={handleLikePost}
                            currentUserId={currentUserId}
                            resolveImageUrl={resolveImageUrl}
                            getAvatar={getAvatar}
                            formatTimeAgo={formatTimeAgo}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Single Question Detail View Component */
                  <QuestionDetailView
                    selectedQuestionDetail={selectedQuestionDetail}
                    onLikePost={handleLikePost}
                    aiHelpful={aiHelpful}
                    setAiHelpful={setAiHelpful}
                    currentUserId={currentUserId}
                    resolveImageUrl={resolveImageUrl}
                    getAvatar={getAvatar}
                    formatTimeAgo={formatTimeAgo}
                    onCommentAdded={(postId, updatedComments) => {
                      const newCount = updatedComments.length;
                      setPosts(prevPosts =>
                        prevPosts.map(p => (p._id === postId ? { ...p, comments: updatedComments, commentsCount: newCount } : p))
                      );
                      if (selectedQuestionDetail && selectedQuestionDetail._id === postId) {
                        setSelectedQuestionDetail(prev => ({
                          ...prev,
                          comments: updatedComments,
                          commentsCount: newCount
                        }));
                      }
                    }}
                  />
                )}
              </div>

              {/* Right Column: Sidebar Component */}
              {!isCreateExpanded && (
                <div className="share-right-column" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <ShareSidebar
                    selectedQuestionDetail={selectedQuestionDetail}
                    userInterests={userInterests}
                    allAvailableInterests={allAvailableInterests}
                    toggleInterestPill={toggleInterestPill}
                    getTopicIcon={getTopicIcon}
                    onOpenManageInterests={() => {
                      setEditingInterests([...userInterests]);
                      setIsManageInterestsOpen(true);
                    }}
                    dynamicTrendingQuestions={dynamicTrendingQuestions}
                    dynamicRelatedQuestions={dynamicRelatedQuestions}
                    topContributors={topContributors}
                    onQuestionClick={handleQuestionClick}
                    followedUsers={followedUsers}
                    handleConnectUser={handleConnectUser}
                    handleUserClick={handleUserClick}
                    resolveImageUrl={resolveImageUrl}
                    getAvatar={getAvatar}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manage Interests Modal Component */}
      <ManageInterestsModal
        isOpen={isManageInterestsOpen}
        onClose={() => setIsManageInterestsOpen(false)}
        allAvailableInterests={allAvailableInterests}
        editingInterests={editingInterests}
        setEditingInterests={setEditingInterests}
        handleSaveInterests={handleSaveInterests}
        savingInterests={savingInterests}
        getTopicIcon={getTopicIcon}
      />

      <Footer />
    </>
  );
};

export default Share;
