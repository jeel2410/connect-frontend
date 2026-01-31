import React from "react";
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
import { getUserProfile } from "../utils/auth";

export default function Sidebar({ profileData = null }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get profile data from prop or from cookies
  const cachedProfile = profileData || getUserProfile();
  
  const displayName = cachedProfile?.fullName || "User";
  const displayImage = cachedProfile?.profileImage || profileImage;

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
            onClick={() => navigate("/delete-account")}
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
    </div>
  );
}
