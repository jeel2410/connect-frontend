import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatar } from "../utils/avatarHelper";
import close from "../../src/assets/image/close.png";
import heartfillIcon from "../../src/assets/image/fill_heart.png";
import heartOutlineIcon from "../../src/assets/image/outline_icon.png";
import blackcIcon from "../../src/assets/image/black_c.png";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function Usercard({
  feedData = [],
  loading = false,
  onLike = null,
  onConnect = null,
  onSkip = null,
  likedProfiles = new Set(),
  connectedProfiles = new Set(),
  isBusiness = false,
}) {
  const navigate = useNavigate();

  // Map feed data to profile format
  const profiles =
    feedData && feedData.length > 0
      ? feedData.map((item, index) => {
        const userId = item._id || item.id;
        const isBusiness = item.isBusinessProfile === true || !!item.businessName;

        if (isBusiness) {
          const businessLogoPlaceholder = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop";
          return {
            id: userId || index + 1,
            userId: userId,
            name: item.businessName || "Unknown Business",
            industry: item.businessCategoryName || item.businessCategory || "Business",
            image: item.businessLogo || businessLogoPlaceholder,
            verified: item.verified || false,
            featured: item.featured || false,
            isBusiness: true,
          };
        }

        const age = item.age || calculateAge(item.dateOfBirth);
        const name = item.fullName || item.name || "Unknown";
        const defaultAvatar = getAvatar(item.gender, age || item.dateOfBirth);
        return {
          id: userId || index + 1,
          userId: userId,
          name: age ? `${name} (${age})` : name,
          industry: item.industry || "",
          image: item.profileImage || item.image || defaultAvatar,
          verified: item.verified || false,
          featured: item.featured || false,
          isBusiness: false,
        };
      })
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
            {isBusiness ? "No Businesses Found" : "No Users Found"}
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
                  style={{ objectFit: profile.isBusiness ? 'contain' : 'cover', backgroundColor: profile.isBusiness ? '#fff' : 'transparent' }}
                />
              </div>

              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-address">{profile.industry}</p>

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
