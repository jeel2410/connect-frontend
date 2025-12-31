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
        </nav>
      </div>
    </div>
  );
}
