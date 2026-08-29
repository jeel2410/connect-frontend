import React, { useState, useEffect } from "react";
import { Check, X, ShieldAlert, Users, MapPin, Briefcase, Calendar, FileText, File, Share2 } from "lucide-react";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";
import { toast } from "react-toastify";
import { resolveImageUrl } from "../../utils/avatarHelper";

const PostApproval = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const renderAttachment = (att, index) => {
    const resolvedUrl = resolveImageUrl(att.url);
    if (att.type === 'image') {
      return (
        <div key={index} className="post-attachment-image" style={{ width: '100%', maxWidth: '300px', margin: '8px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E8EDF3' }}>
          <img src={resolvedUrl} alt={att.name || 'attachment'} style={{ width: '100%', display: 'block' }} />
        </div>
      );
    }

    if (att.type === 'video') {
      return (
        <div key={index} className="post-attachment-video" style={{ width: '100%', maxWidth: '400px', margin: '8px 0', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
          <video src={resolvedUrl} controls style={{ width: '100%', maxHeight: '300px', display: 'block', outline: 'none' }} />
        </div>
      );
    }

    return (
      <a key={index} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="post-attachment-file" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E8EDF3', borderRadius: '6px', padding: '8px 12px', background: '#F8F9FB', textDecoration: 'none', color: '#353945', fontSize: '12px', width: 'fit-content' }}>
        {att.type === 'pdf' ? <FileText size={18} color="#EA650A" /> : <File size={18} color="#EA650A" />}
        <span style={{ fontWeight: "500" }}>{att.name || (att.type === 'pdf' ? 'PDF Document' : 'Document')}</span>
      </a>
    );
  };

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getCookie("authToken");
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/pending`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending posts");
      }

      const result = await response.json();
      if (result.success && result.data) {
        const postsWithOriginals = (result.data.posts || []).map(post => ({
          ...post,
          originalSegments: JSON.parse(JSON.stringify(post.targetSegments || {}))
        }));
        setPosts(postsWithOriginals);
      } else {
        throw new Error(result.message || "Failed to fetch pending posts");
      }
    } catch (err) {
      setError(err.message || "Failed to load pending posts");
      console.error("Error fetching pending posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSegment = (postId, field, value) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          targetSegments: {
            ...post.targetSegments,
            [field]: value
          }
        };
      }
      return post;
    }));
  };

  const handleToggleArraySegment = (postId, field, item, isSelected) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post._id === postId) {
        const currentList = post.targetSegments?.[field] || [];
        const newList = isSelected 
          ? [...currentList, item]
          : currentList.filter(x => x !== item);
        return {
          ...post,
          targetSegments: {
            ...post.targetSegments,
            [field]: newList
          }
        };
      }
      return post;
    }));
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleApprove = async (postId) => {
    const postToApprove = posts.find(p => p._id === postId);
    const targetSegments = postToApprove ? postToApprove.targetSegments : null;

    try {
      const token = getCookie("authToken");
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/approve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetSegments })
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Post approved successfully");
        setPosts(posts.filter((p) => p._id !== postId));
      } else {
        toast.error(result.message || "Failed to approve post");
      }
    } catch (err) {
      toast.error("An error occurred during approval");
      console.error("Error approving post:", err);
    }
  };

  const handleReject = async (postId) => {
    if (!window.confirm("Are you sure you want to reject and delete this post?")) {
      return;
    }

    try {
      const token = getCookie("authToken");
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/reject`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Post rejected and deleted successfully");
        setPosts(posts.filter((p) => p._id !== postId));
      } else {
        toast.error(result.message || "Failed to reject post");
      }
    } catch (err) {
      toast.error("An error occurred during rejection");
      console.error("Error rejecting post:", err);
    }
  };

  if (loading && posts.length === 0) {
    return <div className="admin-loading" style={{ padding: "40px", textAlign: "center", fontSize: "16px", color: "#777E90" }}>Loading pending posts...</div>;
  }

  if (error) {
    return <div className="admin-error" style={{ padding: "40px", textAlign: "center", color: "#EF4444", fontSize: "15px" }}>{error}</div>;
  }

  return (
    <div className="post-approval-container" style={{ padding: "20px 0" }}>
      {posts.length === 0 ? (
        <div className="empty-state-card" style={{ background: "#ffffff", border: "1px solid #E8EDF3", borderRadius: "12px", padding: "60px 20px", textAlign: "center" }}>
          <ShieldAlert size={48} color="#777E90" style={{ marginBottom: "16px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#353945", marginBottom: "8px" }}>No Pending Shares</h3>
          <p style={{ fontSize: "14px", color: "#777E90" }}>All shared posts and links are currently approved.</p>
        </div>
      ) : (
        <div className="pending-posts-grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {posts.map((post) => {
            const author = post.userId?.userDetailId || {};
            const segments = post.targetSegments || {};
            const authorName = author.isBusinessProfile ? author.businessName : author.fullName;
            const authorImage = author.isBusinessProfile 
              ? (resolveImageUrl(author.businessLogo) || "/default-avatar.png") 
              : (resolveImageUrl(author.profileImage) || "/default-avatar.png");
            
            return (
              <div key={post._id} className="pending-post-card" style={{ background: "#ffffff", border: "1px solid #E8EDF3", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img
                      src={authorImage}
                      alt={authorName || "User"}
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #E8EDF3" }}
                      onError={(e) => { e.target.src = "/default-avatar.png"; }}
                    />
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#09122E", margin: "0" }}>{authorName || "Unnamed User"}</h4>
                      <p style={{ fontSize: "12px", color: "#777E90", margin: "2px 0 0 0" }}>
                        Shared on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleApprove(post._id)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", background: "#E8F5E9", border: "none", color: "#2E7D32", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={(e) => e.target.style.background = "#C8E6C9"}
                      onMouseLeave={(e) => e.target.style.background = "#E8F5E9"}
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(post._id)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFEBEE", border: "none", color: "#C62828", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={(e) => e.target.style.background = "#FFCDD2"}
                      onMouseLeave={(e) => e.target.style.background = "#FFEBEE"}
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ fontSize: "14px", color: "#353945", whiteSpace: "pre-line", borderLeft: "4px solid #EA650A", paddingLeft: "16px", margin: "0" }}>
                  {post.content}
                </div>

                {/* Link Preview (if present) */}
                {post.linkPreview && post.linkPreview.url && (
                  <div style={{ display: "flex", gap: "16px", border: "1px solid #E8EDF3", borderRadius: "8px", overflow: "hidden", background: "#F8F9FB" }}>
                    {post.linkPreview.image && (
                      <img src={resolveImageUrl(post.linkPreview.image)} alt="preview" style={{ width: "150px", height: "100px", objectFit: "cover" }} />
                    )}
                    <div style={{ padding: "12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <h5 style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 6px 0", color: "#09122E" }}>{post.linkPreview.title || "External Link"}</h5>
                      {post.linkPreview.description && (
                        <p style={{ fontSize: "12px", color: "#777E90", margin: "0 0 8px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.linkPreview.description}</p>
                      )}
                      <a href={post.linkPreview.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#EA650A", fontWeight: "600", textDecoration: "none" }}>{post.linkPreview.url}</a>
                    </div>
                  </div>
                )}

                {/* Attachments (if present) */}
                {post.attachments && post.attachments.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {post.attachments.map((file, idx) => renderAttachment(file, idx))}
                  </div>
                )}

                {/* Reshared Post Box (if present) */}
                {post.sharedPostId && (
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
                        src={post.sharedPostId.userId?.userDetailId?.isBusinessProfile
                          ? (resolveImageUrl(post.sharedPostId.userId?.userDetailId?.businessLogo) || '/default-avatar.png')
                          : (resolveImageUrl(post.sharedPostId.userId?.userDetailId?.profileImage) || '/default-avatar.png')
                        }
                        alt={post.sharedPostId.userId?.userDetailId?.fullName || 'User'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#09122E' }}>
                          {post.sharedPostId.userId?.userDetailId?.isBusinessProfile
                            ? post.sharedPostId.userId?.userDetailId?.businessName
                            : post.sharedPostId.userId?.userDetailId?.fullName || 'User'
                          }
                        </h5>
                        <span style={{ fontSize: '11px', color: '#777E90' }}>
                          {new Date(post.sharedPostId.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="reshared-content" style={{ fontSize: '13px', color: '#353945', marginBottom: '12px' }}>
                      <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{post.sharedPostId.content}</p>
                    </div>

                    {post.sharedPostId.attachments && post.sharedPostId.attachments.length > 0 && (
                      <div className="post-attachments" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {post.sharedPostId.attachments.map((att, index) => renderAttachment(att, index))}
                      </div>
                    )}

                    {post.sharedPostId.linkPreview && post.sharedPostId.linkPreview.url && (
                      <div className="post-link-preview" style={{ display: 'flex', gap: '16px', border: '1px solid #E8EDF3', borderRadius: '8px', overflow: 'hidden', background: '#ffffff', marginBottom: '0px', marginTop: '8px' }}>
                        {post.sharedPostId.linkPreview.image && (
                          <img src={resolveImageUrl(post.sharedPostId.linkPreview.image)} alt="preview" style={{ width: '120px', height: '80px', objectFit: 'cover', flexShrink: 0 }} />
                        )}
                        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                          <h5 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.sharedPostId.linkPreview.title || 'External Link'}</h5>
                          {post.sharedPostId.linkPreview.description && (
                            <p style={{ fontSize: '11px', color: '#777E90', margin: '0 0 4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.sharedPostId.linkPreview.description}</p>
                          )}
                          <a href={post.sharedPostId.linkPreview.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: '#EA650A', fontWeight: '600', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.sharedPostId.linkPreview.url}</a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Target Segments Indicators */}
                <div style={{ borderTop: "1px solid #E8EDF3", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h5 style={{ fontSize: "13px", fontWeight: "600", color: "#09122E", margin: "0" }}>Target Segments & Audience</h5>
                    <span style={{ fontSize: "11px", color: "#777E90" }}>(Uncheck items to deselect them before approving)</span>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* General Toggles */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {/* Connections Checkbox */}
                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        background: segments.connections ? "#FFF1E6" : "#F8F9FB", 
                        border: `1px solid ${segments.connections ? "#EA650A" : "#E8EDF3"}`, 
                        borderRadius: "20px", 
                        padding: "6px 12px", 
                        fontSize: "12px", 
                        color: segments.connections ? "#EA650A" : "#777E90", 
                        fontWeight: "500",
                        cursor: "pointer",
                        userSelect: "none"
                      }}>
                        <input 
                          type="checkbox" 
                          checked={!!segments.connections} 
                          onChange={(e) => handleToggleSegment(post._id, 'connections', e.target.checked)}
                          style={{ cursor: "pointer", accentColor: "#EA650A", width: "14px", height: "14px" }}
                        />
                        <Users size={14} /> My Connections
                      </label>

                      {/* Same City Checkbox */}
                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        background: segments.city ? "#FFF1E6" : "#F8F9FB", 
                        border: `1px solid ${segments.city ? "#EA650A" : "#E8EDF3"}`, 
                        borderRadius: "20px", 
                        padding: "6px 12px", 
                        fontSize: "12px", 
                        color: segments.city ? "#EA650A" : "#777E90", 
                        fontWeight: "500",
                        cursor: "pointer",
                        userSelect: "none"
                      }}>
                        <input 
                          type="checkbox" 
                          checked={!!segments.city} 
                          onChange={(e) => handleToggleSegment(post._id, 'city', e.target.checked)}
                          style={{ cursor: "pointer", accentColor: "#EA650A", width: "14px", height: "14px" }}
                        />
                        <MapPin size={14} /> Same City ({post.authorCity?.name || "Poster City"})
                      </label>
                    </div>

                    {/* Industries Segment */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#777E90", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Briefcase size={12} /> Target Industries:
                      </span>
                      {post.originalSegments?.industries && post.originalSegments.industries.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {post.originalSegments.industries.map((ind) => {
                            const isChecked = segments.industries?.includes(ind);
                            return (
                              <label key={ind} style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "6px", 
                                background: isChecked ? "#FFF1E6" : "#F8F9FB", 
                                border: `1px solid ${isChecked ? "#EA650A" : "#E8EDF3"}`, 
                                borderRadius: "20px", 
                                padding: "4px 10px", 
                                fontSize: "11px", 
                                color: isChecked ? "#EA650A" : "#777E90", 
                                fontWeight: "500",
                                cursor: "pointer",
                                userSelect: "none"
                              }}>
                                <input 
                                  type="checkbox" 
                                  checked={!!isChecked} 
                                  onChange={(e) => handleToggleArraySegment(post._id, 'industries', ind, e.target.checked)}
                                  style={{ cursor: "pointer", accentColor: "#EA650A", width: "12px", height: "12px" }}
                                />
                                {ind}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#777E90", fontStyle: "italic", marginLeft: "16px" }}>None specified (all industries)</span>
                      )}
                    </div>

                    {/* Age Groups Segment */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#777E90", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} /> Target Age Groups:
                      </span>
                      {post.originalSegments?.ageGroups && post.originalSegments.ageGroups.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {post.originalSegments.ageGroups.map((age) => {
                            const isChecked = segments.ageGroups?.includes(age);
                            return (
                              <label key={age} style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "6px", 
                                background: isChecked ? "#FFF1E6" : "#F8F9FB", 
                                border: `1px solid ${isChecked ? "#EA650A" : "#E8EDF3"}`, 
                                borderRadius: "20px", 
                                padding: "4px 10px", 
                                fontSize: "11px", 
                                color: isChecked ? "#EA650A" : "#777E90", 
                                fontWeight: "500",
                                cursor: "pointer",
                                userSelect: "none"
                              }}>
                                <input 
                                  type="checkbox" 
                                  checked={!!isChecked} 
                                  onChange={(e) => handleToggleArraySegment(post._id, 'ageGroups', age, e.target.checked)}
                                  style={{ cursor: "pointer", accentColor: "#EA650A", width: "12px", height: "12px" }}
                                />
                                {age}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#777E90", fontStyle: "italic", marginLeft: "16px" }}>None specified (all ages)</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostApproval;
