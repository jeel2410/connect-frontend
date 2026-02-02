import React, { useState } from "react";
import profileImage from "../../src/assets/image/profile.png";
import profileIconActive from "../../src/assets/image/profileicon/profile.png";
import profileIcon from "../../src/assets/image/profileicon/profile_black.png";
import connectionIconActive from "../../src/assets/image/profileicon/connection_white.png";
import connectionIcon from "../../src/assets/image/profileicon/connection.png";
import chatActiveIcon from "../../src/assets/image/profileicon/chat_white.png";
import chatIcon from "../../src/assets/image/profileicon/chat.png";
import likeActiveIcon from "../../src/assets/image/profileicon/like_white.png";
import likeIcon from "../../src/assets/image/profileicon/like.png";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserProfile, logout } from "../utils/auth";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

export default function Sidebar({ profileData = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Get profile data from prop or from cookies
  const cachedProfile = profileData || getUserProfile();
  
  const displayName = cachedProfile?.fullName || "User";
  const displayImage = cachedProfile?.profileImage || profileImage;

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError("");
      
      const token = getCookie("authToken");
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/user/account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete account. Please try again.");
      }

      if (result.success) {
        // Logout and redirect to login page
        logout();
      } else {
        throw new Error(result.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="dating-profile-sidebar">
        <div className="dating-profile-image-container">
          <div className="dating-profile-sidebar-avatar">
            <img src={displayImage} alt="Profile" />
          </div>
          <h3 className="dating-profile-sidebar-name">{displayName}</h3>
        </div>

        <nav className="dating-profile-sidebar-nav">
          <button
            className={`dating-profile-nav-item ${
              location.pathname === "/profile" ? "active" : ""
            }`}
            onClick={() => navigate("/profile")}
          >
            <span className="dating-profile-nav-icon">
              <img
                src={
                  location.pathname === "/profile"
                    ? profileIconActive
                    : profileIcon
                }
              ></img>
            </span>
            My Profile
          </button>
          <button
            className={`dating-profile-nav-item ${
              location.pathname === "/connection" ? "active" : ""
            }`}
            onClick={() => navigate("/connection")}
          >
            <span className="dating-profile-nav-icon">
              <img
                src={
                  location.pathname === "/connection"
                    ? connectionIconActive
                    : connectionIcon
                }
              ></img>
            </span>
            Connections
          </button>
          <button
            className={`dating-profile-nav-item ${
              location.pathname === "/chat" ? "active" : ""
            }`}
            onClick={() => navigate("/chat")}
          >
            <span className="dating-profile-nav-icon">
              <img
                src={location.pathname === "/chat" ? chatActiveIcon : chatIcon}
              ></img>
            </span>
            Chat
          </button>
          <button
            className={`dating-profile-nav-item ${
              location.pathname === "/like" ? "active" : ""
            }`}
            onClick={() => navigate("/like")}
          >
            <span className="dating-profile-nav-icon">
              <img
                src={location.pathname === "/like" ? likeActiveIcon : likeIcon}
              ></img>
            </span>
            Likes
          </button>
          <button
            className={`dating-profile-nav-item ${
              location.pathname === "/inquiry" ? "active" : ""
            }`}
            onClick={() => navigate("/inquiry")}
          >
            <span className="dating-profile-nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={location.pathname === "/inquiry" ? "#FFFFFF" : "#16171B"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="13" y2="14" />
              </svg>
            </span>
            Inquiry
          </button>
          <button
            className={`dating-profile-nav-item ${
              location.pathname === "/delete-account" ? "active" : ""
            }`}
            onClick={() => setShowDeleteModal(true)}
          >
            <span className="dating-profile-nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={location.pathname === "/delete-account" ? "#FFFFFF" : "#16171B"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </span>
            Delete Account
          </button>
        </nav>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="delete-modal-overlay" 
          onClick={() => !deleting && setShowDeleteModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div 
            className="delete-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
            }}
          >
            <h2 
              className="delete-modal-title"
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#16171B",
                marginBottom: "16px",
                marginTop: 0
              }}
            >
              Delete Account
            </h2>
            <p 
              className="delete-modal-message"
              style={{
                fontSize: "16px",
                color: "#666",
                lineHeight: "1.5",
                marginBottom: "32px",
                marginTop: 0
              }}
            >
              Your account will be permanently deleted and this action cannot be undone.
            </p>
            {error && (
              <div 
                style={{
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  fontSize: "14px"
                }}
              >
                {error}
              </div>
            )}
            <div 
              className="delete-modal-actions"
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end"
              }}
            >
              <button 
                className="delete-modal-cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setError("");
                }}
                disabled={deleting}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "1px solid #E8EDF3",
                  backgroundColor: "white",
                  color: "#16171B",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.target.style.backgroundColor = "#F9FBFE";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.target.style.backgroundColor = "white";
                  }
                }}
              >
                Cancel
              </button>
              <button 
                className="delete-modal-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.target.style.backgroundColor = "#B91C1C";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.target.style.backgroundColor = "#DC2626";
                  }
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
