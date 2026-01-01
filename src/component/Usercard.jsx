import React from "react";
import { useNavigate } from "react-router-dom";
import profile1 from "../../src/assets/image/profile/profile1.png";
import close from "../../src/assets/image/close.png";
import heart from "../../src/assets/image/heart.png";
import c from "../../src/assets/image/c.png";

export default function Usercard({ feedData = [], loading = false, onLike = null, onConnect = null }) {
  const navigate = useNavigate();

  // Map feed data to profile format
  const profiles = feedData && feedData.length > 0 
    ? feedData.map((item, index) => ({
        id: item._id || item.id || index + 1,
        userId: item._id || item.id, // Store the actual user ID for API calls
        name: item.fullName || item.name || "Unknown",
        address: item.city || item.address || "Location not available",
        image: item.profileImage || item.image || profile1,
        verified: item.verified || false,
        featured: item.featured || false,
      }))
    : [];

  const handleLikeClick = (userId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking like button
    if (onLike && userId) {
      onLike(userId);
    }
  };

  const handleConnectClick = (userId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking connect button
    if (onConnect && userId) {
      onConnect(userId);
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

  // Show "No user found" message if no data
  if (!profiles || profiles.length === 0) {
    return (
      <div className="profile-grid">
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px", 
          color: "#666",
          width: "100%",
          gridColumn: "1 / -1"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
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
        {profiles.map((profile) => (
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

            <div className="profile-actions" onClick={(e) => e.stopPropagation()}>
              <button className="action-btn ">
                <img src={close} alt="Close"></img>
              </button>
              <button 
                className={`action-btn-2 heart-btn`}
                onClick={(e) => handleLikeClick(profile.userId, e)}
              >
                <img src={heart} className="heart-btn-icon" alt="Like"></img>
              </button>
              <button 
                className="action-btn chat-btn"
                onClick={(e) => handleConnectClick(profile.userId, e)}
              >
                <img src={c} className="chatbtn-icon" alt="Connect"></img>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
