import React, { useState, useEffect } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import CreatePost from '../component/CreatePost';
import PostCard from '../component/PostCard';
import API_BASE_URL from '../utils/config';
import { getCookie, setCookie } from '../utils/auth';
import { getAvatar, resolveImageUrl } from '../utils/avatarHelper';
import { X, Share2 } from 'lucide-react';
import '../styles/style.css';

const Share = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [topSharers, setTopSharers] = useState([]);
  const [mostShared, setMostShared] = useState([]);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const [popupOffer, setPopupOffer] = useState(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts?sortBy=${sortBy}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopSharers = async () => {
    try {
      const token = getCookie('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts/top-sharers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTopSharers(data.data);
      }
    } catch (err) {
      console.error('Error fetching top sharers:', err);
    }
  };

  const fetchMostShared = async () => {
    try {
      const token = getCookie('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts/most-shared`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMostShared(data.data);
      }
    } catch (err) {
      console.error('Error fetching most shared reels:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  useEffect(() => {
    fetchTopSharers();
    fetchMostShared();
  }, []);

  const handlePopupCheckNow = async (cardId) => {
    try {
      const token = getCookie("authToken");
      await fetch(`${API_BASE_URL}/api/list/cards/${cardId}/click`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.error("Error tracking popup click:", err);
    }
  };

  useEffect(() => {
    const checkPopupOffer = async () => {
      try {
        const cookieName = "lastOfferShownAt_share";
        if (getCookie(cookieName)) return;

        const token = getCookie("authToken");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/list/popup-offer?page=share`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.showPopup && result.data.offer) {
            setPopupOffer(result.data.offer);
            setShowOfferPopup(true);
            setCookie(cookieName, new Date().toISOString(), 1); // expire in 1 day (24 hours)
          }
        }
      } catch (err) {
        console.error("Error checking popup offer:", err);
      }
    };

    checkPopupOffer();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    fetchTopSharers();
    fetchMostShared();
  };

  const handleReact = (postId, updatedReactions) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, reactions: updatedReactions } : post
      )
    );
    fetchMostShared();
  };

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <div className="share-page-wrapper" style={{ width: '100%' }}>
          <div className="title-div">
            <h1 className="inner-page-title"><span>Shared</span><span className="title-highlight">Feed</span></h1>
          </div>
          
          <div className="share-page-container">
            <div className="share-two-column-layout" style={{ display: 'flex', gap: '30px', width: '100%', alignItems: 'flex-start' }}>
              {/* Left Column: Feed & CreatePost */}
              <div className="share-left-column" style={{ flex: isCreateExpanded ? '1' : '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isCreateExpanded && (
                  <CreatePost 
                    onPostCreated={handlePostCreated} 
                    isExpanded={isCreateExpanded} 
                    setIsExpanded={setIsCreateExpanded} 
                  />
                )}

                {!isCreateExpanded && (
                  <div className="posts-feed connections-page-card" style={{ marginTop: '10px' }}>
                    <CreatePost 
                      onPostCreated={handlePostCreated} 
                      isExpanded={isCreateExpanded} 
                      setIsExpanded={setIsCreateExpanded} 
                    />

                    <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 className="feed-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#09122E' }}>Recent Articles</h3>
                      <div className="feed-sort-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="feed-sort-label" style={{ fontSize: '13px', color: '#777E90' }}>Sort by:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="feed-sort-select"
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #DDE2EE',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#09122E',
                            background: '#fff',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="latest">Latest</option>
                          <option value="popularity">Popularity</option>
                        </select>
                      </div>
                    </div>

                    {loading ? (
                      <div className="posts-loading">
                        <div className="spinner"></div>
                        <span>Loading posts...</span>
                      </div>
                    ) : error ? (
                      <div className="posts-error">{error}</div>
                    ) : posts.length === 0 ? (
                      <div className="no-posts">
                        <p>No posts to show. Start by sharing something!</p>
                      </div>
                    ) : (
                      <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {posts.map((post) => (
                          <PostCard key={post._id} post={post} onReact={handleReact} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Widgets */}
              {!isCreateExpanded && (
                <div className="share-right-column" style={{ flex: '1.1', display: 'flex', flexDirection: 'column', gap: '30px', position: 'sticky', top: '100px', marginTop: '10px' }}>
                  {/* Top Sharers Card */}
                  <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🏆</span> Top Sharers
                      </h3>
                      <a href="#" style={{ fontSize: '12px', fontWeight: '600', color: '#EA650A', textDecoration: 'none' }}>View All</a>
                    </div>
                    <p style={{ margin: '0 0 20px 0', fontSize: '11px', color: '#777E90', textAlign: 'left' }}>People making content travel on Connect.in</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {topSharers.map((sharer, idx) => {
                        const userDetail = sharer.user?.userDetailId || {};
                        const isBusiness = userDetail.isBusinessProfile;
                        const fullName = isBusiness 
                          ? (userDetail.businessName || 'Business')
                          : (userDetail.fullName || 'User');
                        const avatar = isBusiness
                          ? resolveImageUrl(userDetail.businessLogo)
                          : resolveImageUrl(userDetail.profileImage);
                        const defaultAvatar = isBusiness
                          ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop"
                          : getAvatar(userDetail.gender, userDetail.dateOfBirth || userDetail.age);
                        const sharesCount = sharer.sharesCount || 0;
                        const rankColors = ['#EA650A', '#FD9043', '#FFB884', '#777E90', '#777E90'];
                        const rankBgColors = ['#FFF1E6', '#FFF6F0', '#FFFBF7', '#F4F5F6', '#F4F5F6'];
                        
                        return (
                          <div key={sharer.user?._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: rankColors[idx] || '#777E90',
                                background: rankBgColors[idx] || '#F4F5F6'
                              }}>{idx + 1}</span>
                              <img 
                                src={avatar || defaultAvatar} 
                                alt={fullName} 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = defaultAvatar; }}
                              />
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#353945' }}>{fullName}</span>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#777E90' }}>{sharesCount} Shared</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Most Shared Reels Card */}
                  <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DDE2EE', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔥</span> Most Shared
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '11px', color: '#777E90', textAlign: 'left' }}>Top 5 Reels based on Likes and Reshares</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {mostShared.map((reel, idx) => {
                        const title = reel.content || 'Untitled Reel';
                        const postAttachments = reel.attachments || [];
                        const sharedAttachments = reel.sharedPostId?.attachments || [];
                        const allAttachments = [...postAttachments, ...sharedAttachments];

                        const imageAttachment = allAttachments.find(att => att.type === 'image');
                        const videoAttachment = allAttachments.find(att => att.type === 'video');
                        const linkPreviewImage = reel.linkPreview?.image || reel.sharedPostId?.linkPreview?.image;

                        const fallbackImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=120&auto=format&fit=crop&q=60';
                        const likes = reel.likesCount || 0;
                        const reshares = reel.reshares || reel.reshareCount || 0;
                        
                        const formatCount = (num) => {
                          if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                          return num;
                        };

                        const renderThumbnail = () => {
                          if (imageAttachment) {
                            return (
                              <img 
                                src={resolveImageUrl(imageAttachment.url)} 
                                alt={title} 
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = fallbackImage; }}
                              />
                            );
                          }
                          if (videoAttachment) {
                            return (
                              <video 
                                src={resolveImageUrl(videoAttachment.url)} 
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: '#000' }}
                                muted
                                playsInline
                                preload="metadata"
                              />
                            );
                          }
                          if (linkPreviewImage) {
                            return (
                              <img 
                                src={resolveImageUrl(linkPreviewImage)} 
                                alt={title} 
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = fallbackImage; }}
                              />
                            );
                          }
                          return (
                            <img 
                              src={fallbackImage} 
                              alt={title} 
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                          );
                        };

                        return (
                          <div key={reel._id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {renderThumbnail()}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: 0 }}>
                              <span style={{ 
                                fontSize: '12px', 
                                fontWeight: '600', 
                                color: '#353945', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                textAlign: 'left'
                              }}>
                                {title}
                              </span>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#777E90' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>👍</span> {formatCount(likes)}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Share2 size={12} color="#777E90" /> {formatCount(reshares)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showOfferPopup && popupOffer && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          backdropFilter: "blur(5px)"
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "450px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            padding: "24px",
            position: "relative",
            animation: "slideUp 0.3s ease-out",
            overflow: "hidden"
          }}>
            <button 
              onClick={() => setShowOfferPopup(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(0,0,0,0.05)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#666",
                transition: "background 0.2s"
              }}
            >
              <X size={18} />
            </button>

            {popupOffer.offer_image ? (
              <div style={{
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "16px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img 
                  src={resolveImageUrl(popupOffer.offer_image)} 
                  alt={popupOffer.name} 
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "350px",
                    objectFit: "contain"
                  }}
                />
              </div>
            ) : popupOffer.logo_image ? (
              <div style={{
                width: "100%",
                height: "150px",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "16px",
                backgroundColor: "#fff8f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ffe0d0"
              }}>
                <img 
                  src={resolveImageUrl(popupOffer.logo_image)} 
                  alt={popupOffer.name} 
                  style={{
                    maxWidth: "120px",
                    maxHeight: "120px",
                    objectFit: "contain"
                  }}
                />
              </div>
            ) : null}

            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#333",
              margin: "0 0 8px 0",
              textAlign: "center"
            }}>{popupOffer.name}</h3>

            {popupOffer.description && (
              <p style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 16px 0",
                textAlign: "center",
                lineHeight: "1.4"
              }}>{popupOffer.description}</p>
            )}

            {popupOffer.features && popupOffer.features.length > 0 && (
              <div style={{
                backgroundColor: "#f9f9f9",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
                maxHeight: "150px",
                overflowY: "auto"
              }}>
                <h4 style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#ea650a",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: "0 0 8px 0"
                }}>Key Features</h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "13px",
                  color: "#444",
                  lineHeight: "1.6"
                }}>
                  {popupOffer.features.map((feature, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px"
            }}>
              <button
                onClick={() => setShowOfferPopup(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  color: "#666",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background 0.2s"
                }}
              >
                Dismiss
              </button>
              
              <a
                href={popupOffer.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handlePopupCheckNow(popupOffer._id);
                  setShowOfferPopup(false);
                }}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#ea650a",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(234, 101, 10, 0.25)",
                  transition: "all 0.2s"
                }}
              >
                Check Now
              </a>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Share;
