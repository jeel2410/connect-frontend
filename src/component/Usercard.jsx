import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatar, resolveImageUrl } from "../utils/avatarHelper";
import close from "../../src/assets/image/close.png";
import heartfillIcon from "../../src/assets/image/fill_heart.png";
import heartOutlineIcon from "../../src/assets/image/outline_icon.png";
import blackcIcon from "../../src/assets/image/black_c.png";

// Helper function to format a connections count compactly (e.g. 1200 -> "1.2k")
const formatConnectionsCount = (count) => {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return count.toString();
};

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
  pendingProfiles = new Set(),
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
            image: resolveImageUrl(item.businessLogo) || businessLogoPlaceholder,
            fallbackImage: businessLogoPlaceholder,
            verified: item.verified || false,
            featured: item.featured || false,
            connectionsCount: item.connectionsCount || 0,
            isBusiness: true,
            alreadyConnect: item.alreadyConnect || false,
            sendRequest: item.sendRequest || false,
            isLiked: item.isLiked || false,
            isConnected: item.isConnected || false,
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
          image: resolveImageUrl(item.profileImage || item.image) || defaultAvatar,
          fallbackImage: defaultAvatar,
          verified: item.verified || false,
          featured: item.featured || false,
          isBusiness: false,
          alreadyConnect: item.alreadyConnect || false,
          sendRequest: item.sendRequest || false,
          isLiked: item.isLiked || false,
          isConnected: item.isConnected || false,
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
          const isLiked = likedProfiles ? likedProfiles.has(String(profile.userId)) : profile.isLiked;
          const isAlreadyConnected = connectedProfiles ? connectedProfiles.has(String(profile.userId)) : profile.alreadyConnect;
          const isPending = pendingProfiles ? pendingProfiles.has(String(profile.userId)) : (profile.sendRequest || (profile.isConnected && !profile.alreadyConnect));

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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profile.fallbackImage;
                  }}
                  style={{ objectFit: profile.isBusiness ? 'contain' : 'cover', backgroundColor: profile.isBusiness ? '#fff' : 'transparent' }}
                />
              </div>

              <h3 className="profile-name" title={profile.name} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</span>
                {profile.isBusiness && profile.verified && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#10B981" title="Verified" style={{ flexShrink: 0 }}>
                    <path d="M12 2l2.4 2.4 3.4-.6.8 3.3 3 1.7-1.2 3.2 1.2 3.2-3 1.7-.8 3.3-3.4-.6L12 22l-2.4-2.4-3.4.6-.8-3.3-3-1.7 1.2-3.2-1.2-3.2 3-1.7.8-3.3 3.4.6z" />
                    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </h3>
              <p className="profile-address" title={profile.industry || ""}>{profile.industry || "\u00A0"}</p>
              {profile.isBusiness && (
                <p
                  className="profile-connections-count"
                  style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}
                  title={`${profile.connectionsCount} people connected`}
                >
                  {formatConnectionsCount(profile.connectionsCount)} connection{profile.connectionsCount === 1 ? "" : "s"}
                </p>
              )}

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
                  className={`action-btn chat-btn ${isAlreadyConnected ? "connected" : ""}`}
                  onClick={(e) => handleConnectClick(profile.userId, e)}
                  title={isAlreadyConnected ? "Connected" : isPending ? "Request sent" : "Connect"}
                  disabled={isPending || isAlreadyConnected}
                  style={{ opacity: isPending ? 0.6 : 1, cursor: (isPending || isAlreadyConnected) ? "default" : "pointer" }}
                >
                  <img
                    src={blackcIcon}
                    className="chatbtn-icon"
                    alt={isAlreadyConnected ? "Connected" : isPending ? "Request sent" : "Connect"}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "50%",
                      padding: "5px",
                      transform: "none",
                      opacity: isPending ? 0.6 : 1,
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
