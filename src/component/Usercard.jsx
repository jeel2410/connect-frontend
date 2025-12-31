import React from "react";
import profile1 from "../../src/assets/image/profile/profile1.png";
import close from "../../src/assets/image/close.png";
import heart from "../../src/assets/image/heart.png";
import c from "../../src/assets/image/c.png";

export default function Usercard({ feedData = [], loading = false }) {
  // Map feed data to profile format
  const profiles = feedData && feedData.length > 0 
    ? feedData.map((item, index) => ({
        id: item._id || item.id || index + 1,
        name: item.fullName || item.name || "Unknown",
        address: item.city || item.address || "Location not available",
        image: item.profileImage || item.image || profile1,
        verified: item.verified || false,
        featured: item.featured || false,
      }))
    : [];

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
          <div key={profile.id} className="profile-card">
            <div className="profile-image-wrapper">
              <img
                src={profile.image}
                alt={profile.name}
                className="profile-image"
              />
            </div>

            <h3 className="profile-name">{profile.name}</h3>
            <p className="profile-address">{profile.address}</p>

            <div className="profile-actions">
              <button className="action-btn ">
                <img src={close} alt="Close"></img>
              </button>
              <button className={`action-btn-2 heart-btn`}>
                <img src={heart} className="heart-btn-icon" alt="Like"></img>
              </button>
              <button className="action-btn chat-btn">
                <img src={c} className="chatbtn-icon" alt="Chat"></img>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
