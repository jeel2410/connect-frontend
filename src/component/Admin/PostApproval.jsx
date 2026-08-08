import React, { useState, useEffect } from "react";
import { Check, X, ShieldAlert, Users, MapPin, Briefcase, Calendar, FileText } from "lucide-react";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";
import { toast } from "react-toastify";

const PostApproval = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setPosts(result.data.posts || []);
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

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleApprove = async (postId) => {
    try {
      const token = getCookie("authToken");
      const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/approve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
            const authorImage = author.isBusinessProfile ? author.businessLogo : author.profileImage;
            
            return (
              <div key={post._id} className="pending-post-card" style={{ background: "#ffffff", border: "1px solid #E8EDF3", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img
                      src={authorImage || "/default-avatar.png"}
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
                      <img src={post.linkPreview.image} alt="preview" style={{ width: "150px", height: "100px", objectFit: "cover" }} />
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
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {post.attachments.map((file, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #E8EDF3", borderRadius: "6px", padding: "8px 12px", background: "#F8F9FB" }}>
                        <FileText size={18} color="#EA650A" />
                        <span style={{ fontSize: "12px", color: "#353945", fontWeight: "500" }}>{file.name || "Attachment"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Target Segments Indicators */}
                <div style={{ borderTop: "1px solid #E8EDF3", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h5 style={{ fontSize: "13px", fontWeight: "600", color: "#09122E", margin: "0" }}>Target Segments & Audience</h5>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {/* Connections */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: segments.connections ? "#FFF1E6" : "#F8F9FB", border: `1px solid ${segments.connections ? "#EA650A" : "#E8EDF3"}`, borderRadius: "20px", padding: "6px 12px", fontSize: "12px", color: segments.connections ? "#EA650A" : "#777E90", fontWeight: "500" }}>
                      <Users size={14} /> My Connections: {segments.connections ? "Yes" : "No"}
                    </div>

                    {/* Same City */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: segments.city ? "#FFF1E6" : "#F8F9FB", border: `1px solid ${segments.city ? "#EA650A" : "#E8EDF3"}`, borderRadius: "20px", padding: "6px 12px", fontSize: "12px", color: segments.city ? "#EA650A" : "#777E90", fontWeight: "500" }}>
                      <MapPin size={14} /> Same City: {segments.city ? `Yes (${post.authorCity?.name || "Poster City"})` : "No"}
                    </div>

                    {/* Industries */}
                    {segments.industries && segments.industries.length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFF1E6", border: "1px solid #EA650A", borderRadius: "20px", padding: "6px 12px", fontSize: "12px", color: "#EA650A", fontWeight: "500" }}>
                        <Briefcase size={14} /> Industries: {segments.industries.join(", ")}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F8F9FB", border: "1px solid #E8EDF3", borderRadius: "20px", padding: "6px 12px", fontSize: "12px", color: "#777E90", fontWeight: "500" }}>
                        <Briefcase size={14} /> Industries: None
                      </div>
                    )}

                    {/* Age Groups */}
                    {segments.ageGroups && segments.ageGroups.length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFF1E6", border: "1px solid #EA650A", borderRadius: "20px", padding: "6px 12px", fontSize: "12px", color: "#EA650A", fontWeight: "500" }}>
                        <Calendar size={14} /> Age Groups: {segments.ageGroups.join(", ")}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F8F9FB", border: "1px solid #E8EDF3", borderRadius: "20px", padding: "6px 12px", fontSize: "12px", color: "#777E90", fontWeight: "500" }}>
                        <Calendar size={14} /> Age Groups: None
                      </div>
                    )}
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
