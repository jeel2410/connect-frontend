import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Trash2, EyeOff, Eye, ChevronLeft, ChevronRight,
  FileText, Link, ImageIcon, UserCircle, Calendar
} from "lucide-react";
import { getPosts, togglePostVisibility, deletePost } from "../../utils/adminApi";
import { toast } from "react-toastify";

const SharedPostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPosts(currentPage, 15, searchTerm);
      if (res.success && res.data) {
        setPosts(res.data.posts || []);
        setPagination(res.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(fetchPosts, searchTerm ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const handleToggle = async (postId, currentlyEnabled) => {
    const action = currentlyEnabled ? "disable" : "enable";
    if (!window.confirm(`Are you sure you want to ${action} this post? ${currentlyEnabled ? "It will be hidden from all feeds." : "It will reappear in feeds."}`)) return;
    try {
      const res = await togglePostVisibility(postId);
      if (res.success) {
        toast.success(res.message || `Post ${action}d successfully`);
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, isApproved: !currentlyEnabled } : p));
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${action} post`);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to permanently delete this post? This cannot be undone.")) return;
    try {
      const res = await deletePost(postId);
      if (res.success) {
        toast.success("Post deleted successfully");
        setPosts(prev => prev.filter(p => p._id !== postId));
        setPagination(prev => ({ ...prev, totalItems: prev.totalItems - 1 }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete post");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) setCurrentPage(page);
  };

  return (
    <div className="admin-section">
      {/* Header */}
      <div className="admin-section-header">
        <div className="section-title-group">
          <h2 className="section-title">Shared Post Management</h2>
          <span className="admin-total-badge">
            {loading ? "—" : `${pagination.totalItems.toLocaleString()} posts`}
          </span>
        </div>
        <div className="search-controls-group">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by content..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading && posts.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 0" }}>Loading posts...</div>
      ) : error ? (
        <div className="empty-state" style={{ color: "#EF4444", padding: "60px 0" }}>{error}</div>
      ) : posts.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 0" }}>No posts found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          {posts.map((post) => {
            const author = post.userId?.userDetailId || {};
            const authorName = author.isBusinessProfile ? author.businessName : author.fullName;
            const authorImage = author.isBusinessProfile ? author.businessLogo : author.profileImage;
            const isEnabled = post.isApproved === true;
            const hasLink = post.linkPreview?.url;
            const hasAttachments = post.attachments?.length > 0;

            return (
              <div
                key={post._id}
                style={{
                  background: isEnabled ? "#ffffff" : "#fafafa",
                  border: `1px solid ${isEnabled ? "#E8EDF3" : "#E2E8F0"}`,
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                  opacity: isEnabled ? 1 : 0.75,
                  transition: "all 0.2s",
                }}
              >
                {/* Author Avatar */}
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName || "User"}
                    style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #E8EDF3", flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <UserCircle size={28} color="#94A3B8" />
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#09122E" }}>
                      {authorName || "Unknown User"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94A3B8" }}>
                      <Calendar size={12} />
                      {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    {hasLink && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
                        <Link size={11} /> Link
                      </span>
                    )}
                    {hasAttachments && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", background: "#F0FDF4", color: "#15803D", padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
                        <ImageIcon size={11} /> {post.attachments.length} Attachment{post.attachments.length > 1 ? "s" : ""}
                      </span>
                    )}
                    <span style={{
                      fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "20px",
                      background: isEnabled ? "#E6F4EA" : "#FEF9C3",
                      color: isEnabled ? "#137333" : "#854D0E",
                    }}>
                      {isEnabled ? "● Live" : "● Hidden"}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p style={{
                    fontSize: "14px", color: "#353945", margin: "0 0 10px 0",
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                    overflow: "hidden", lineHeight: "1.6",
                    borderLeft: "3px solid #EA650A", paddingLeft: "12px"
                  }}>
                    {post.content}
                  </p>

                  {/* Link Preview */}
                  {hasLink && (
                    <div style={{ display: "flex", gap: "10px", background: "#F8FAFC", border: "1px solid #E8EDF3", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", alignItems: "center" }}>
                      <Link size={14} color="#64748B" />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: "600", color: "#09122E", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {post.linkPreview.title || "External Link"}
                        </p>
                        <a href={post.linkPreview.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: "11px", color: "#EA650A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {post.linkPreview.url}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {hasAttachments && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {post.attachments.map((file, idx) => (
                        <span key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F1F5F9", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#475569" }}>
                          <FileText size={12} /> {file.name || "File"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, marginTop: "2px" }}>
                  <button
                    onClick={() => handleToggle(post._id, isEnabled)}
                    title={isEnabled ? "Disable post" : "Enable post"}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                      cursor: "pointer", border: "none", transition: "all 0.15s",
                      background: isEnabled ? "#FFF7ED" : "#F0FDF4", color: isEnabled ? "#EA650A" : "#15803D",
                    }}
                  >
                    {isEnabled ? <><EyeOff size={15} /> Disable</> : <><Eye size={15} /> Enable</>}
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    title="Delete post permanently"
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                      cursor: "pointer", border: "none", background: "#FEF2F2", color: "#DC2626", transition: "all 0.15s",
                    }}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination-container" style={{ marginTop: "24px" }}>
          <div className="pagination-info">
            Showing {posts.length > 0 ? (currentPage - 1) * 15 + 1 : 0} to{" "}
            {Math.min(currentPage * 15, pagination.totalItems)} of {pagination.totalItems} posts
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={20} /> Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="pagination-ellipsis">...</span>}
                    <button
                      className={`pagination-number ${currentPage === page ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedPostManagement;
