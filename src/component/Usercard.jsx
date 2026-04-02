import React from "react";
import { useNavigate } from "react-router-dom";
import profile1 from "../../src/assets/image/profile/profile1.png";
import close from "../../src/assets/image/close.png";
import heartfillIcon from "../../src/assets/image/fill_heart.png";
import heartOutlineIcon from "../../src/assets/image/outline_icon.png";
import blackcIcon from "../../src/assets/image/black_c.png";


export default function Usercard({
  feedData = [],
  loading = false,
  onLike = null,
  onConnect = null,
  onSkip = null,
  likedProfiles = new Set(),
  connectedProfiles = new Set(),
}) {
  const navigate = useNavigate();

  // Map feed data to profile format
  const profiles =
    feedData && feedData.length > 0
      ? feedData.map((item, index) => ({
        id: item._id || item.id || index + 1,
        userId: item._id || item.id,
        name: item.fullName || item.name || "Unknown",
        address: item.city || item.address || "Location not available",
        image: item.profileImage || item.image || profile1,
        verified: item.verified || false,
        featured: item.featured || false,
      }))
      : [];

  const handleLikeClick = (userId, e) => {
    e.stopPropagation();
    if (onLike && userId) {
      onLike(userId);
    }
  };

  const handleConnectClick = (userId, e) => {
    e.stopPropagation();
    if (onConnect && userId) {
      onConnect(userId);
    }
  };

  const handleSkipClick = (userId, e) => {
    e.stopPropagation();
    if (onSkip && userId) {
      onSkip(userId);
    }
  };

  const handleProfileClick = (userId) => {
    if (userId) {
      navigate(`/userprofile`, { state: { userId } });
    }
  };

  if (loading) {
    return (
      <div className="profile-grid">
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          Loading profiles...
        </div>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="profile-grid">
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#666",
            width: "100%",
            gridColumn: "1 / -1",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "#333",
            }}
          >
            No Users Found
          </div>
          <div style={{ fontSize: "16px", color: "#999" }}>
            Try adjusting your filters or search criteria
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="profile-grid">
        {profiles.map((profile) => {
          const isLiked = likedProfiles.has(String(profile.userId));
          const isConnected = connectedProfiles.has(String(profile.userId));

          return (
            <div
              key={profile.id}
              className="profile-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleProfileClick(profile.userId)}
            >
              <div className="profile-image-wrapper">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="profile-image"
                />
              </div>

              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-address">{profile.address}</p>

              <div
                className="profile-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Skip / Delete button */}
                <button
                  className="action-btn"
                  onClick={(e) => handleSkipClick(profile.userId, e)}
                  title="Delete the profile"
                >
                  <img src={close} alt="Skip" />
                </button>

                {/* Like button — outline when not liked, filled when liked (same as UserProfileModal) */}
                <button
                  className="action-btn-2 heart-btn"
                  onClick={(e) => handleLikeClick(profile.userId, e)}
                  title={isLiked ? "Unlike this user" : "Like this user"}
                  style={{
                    opacity: isLiked ? 0.85 : 1, cursor: "pointer", background: isLiked
                      ? "linear-gradient(180deg, #FF6A6B 0%, #FE6057 100%)"
                      : "transparent",
                  }}
                >
                  <img
                    src={isLiked ? heartfillIcon : heartOutlineIcon}
                    className="heart-btn-icon"

                    alt={isLiked ? "Liked" : "Like"}
                  />
                </button>

                {/* Connect button — black_c.png with white circle bg, same styling as UserProfileModal */}
                <button
                  className="action-btn chat-btn"
                  onClick={(e) => handleConnectClick(profile.userId, e)}
                  title={isConnected ? "Request sent" : "Connect"}
                  disabled={isConnected}
                  style={{ opacity: isConnected ? 0.85 : 1, cursor: isConnected ? "default" : "pointer" }}
                >
                  <img
                    src={blackcIcon}
                    className="chatbtn-icon"
                    alt={isConnected ? "Connected" : "Connect"}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "50%",
                      padding: "5px",
                      // Rotate to indicate "sent/connected" state, matching UserProfileModal's connected look
                      opacity: isConnected ? 0.6 : 1,
                    }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
