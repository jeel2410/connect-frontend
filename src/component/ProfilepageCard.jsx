import React, { useState } from "react";
import mobileIcon from "../../src/assets/image/mobile.png"
import emailIcon from "../../src/assets/image/email.png"
import calenderIcon from "../../src/assets/image/calender.png"
import cityIcon from "../../src/assets/image/city.png"
import ProfilecardHeader from "./ProfilecardHeader";
import { getCookie, logout } from "../utils/auth";
import API_BASE_URL from "../utils/config";

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

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Not provided";
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default function ProfilepageCard({ profileData: initialProfileData }) {
  const [profileData, setProfileData] = React.useState(initialProfileData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setProfileData(initialProfileData);
  }, [initialProfileData]);

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = getCookie("authToken");
    if (!token) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success && result.data && result.data.profile) {
        setProfileData(result.data.profile);
      }
    } catch (err) {
      console.error("Error uploading cover image:", err);
    }
  };

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

  // Early return after hooks
  if (!profileData) {
    return (
      <div className="dating-profile-main">
        <div className="dating-profile-card">
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No profile data available
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(profileData.dateOfBirth);
  const interests = profileData.interests || [];
  const habits = profileData.habits || [];

  return (
    <>
      <div className="dating-profile-main">
        <div className="dating-profile-card">
          <ProfilecardHeader
            showChangePassword={true}
            profileData={profileData}
            onCoverImageChange={handleCoverImageUpload}
          ></ProfilecardHeader>

          {/* Contact Info Row */}
          {profileData.isBusinessProfile ? (
            <div className="dating-profile-contact-row">
              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA650A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <div>
                  <label>Contact Person</label>
                  <p>{profileData.contactPerson || "Not provided"}</p>
                </div>
              </div>

              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <img src={mobileIcon} alt="Mobile"></img>
                </span>
                <div>
                  <label>Mobile Number</label>
                  <p>{profileData.phoneNumber || "Not provided"}</p>
                </div>
              </div>

              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA650A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </span>
                <div>
                  <label>WhatsApp Number</label>
                  <p>{profileData.whatsappNumber || "Not provided"}</p>
                </div>
              </div>

              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <img src={emailIcon} alt="Email"></img>
                </span>
                <div>
                  <label>Email ID</label>
                  <p>{profileData.email || "Not provided"}</p>
                </div>
              </div>

              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA650A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </span>
                <div>
                  <label>Website URL</label>
                  <p>
                    {profileData.website ? (
                      <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#EA650A", textDecoration: "none" }}>
                        {profileData.website}
                      </a>
                    ) : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <img src={cityIcon} alt="City"></img>
                </span>
                <div>
                  <label>Location</label>
                  <p>
                    {profileData.city
                      ? `${profileData.city}${profileData.pincode ? ` - ${profileData.pincode}` : ""}`
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="dating-profile-contact-row">
              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <img src={mobileIcon} alt="Mobile"></img>
                </span>
                <div>
                  <label>Mobile Number</label>
                  <p>{profileData.phoneNumber || "Not provided"}</p>
                </div>
              </div>
              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <img src={emailIcon} alt="Email"></img>
                </span>
                <div>
                  <label>Email ID</label>
                  <p>{profileData.email || "Not provided"}</p>
                </div>
              </div>
              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <img src={calenderIcon} alt="Calendar"></img>
                </span>
                <div>
                  <label>Date of Birth</label>
                  <p>{formatDate(profileData.dateOfBirth)}</p>
                </div>
              </div>
              <div className="dating-profile-contact-item">
                <span className="dating-profile-contact-icon">
                  <img src={cityIcon} alt="City"></img>
                </span>
                <div>
                  <label>Location</label>
                  <p>
                    {profileData.city
                      ? `${profileData.city}${profileData.pincode ? ` - ${profileData.pincode}` : ""}`
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="dating-profile-section">
            {profileData.isBusinessProfile ? (
              <>
                <h3>Business Details</h3>

                {profileData.businessCategory && (
                  <div className="dating-profile-info-group">
                    <label>Business Category</label>
                    <div className="dating-profile-tags">
                      <span className="dating-profile-tag" style={{ borderColor: "#EA650A", color: "#EA650A", backgroundColor: "#FFF8F3" }}>
                        {profileData.businessCategory}
                      </span>
                    </div>
                  </div>
                )}

                {profileData.businessTagline && (
                  <div className="dating-profile-info-group">
                    <label>Business Tagline</label>
                    <p style={{ fontSize: "16px", color: "#081332", fontFamily: "Inter, sans-serif", margin: "0", fontStyle: "italic" }}>
                      "{profileData.businessTagline}"
                    </p>
                  </div>
                )}

                {profileData.businessDescription && (
                  <div className="dating-profile-info-group">
                    <label>About the Business</label>
                    <p style={{ fontSize: "15px", color: "#333", lineHeight: "1.6", fontFamily: "Inter, sans-serif", margin: "0", whiteSpace: "pre-line" }}>
                      {profileData.businessDescription}
                    </p>
                  </div>
                )}

                {/* Business Social Media */}
                <div className="dating-profile-info-group" style={{ borderTop: "1px solid #DDE2EE", paddingTop: "20px", marginTop: "20px" }}>
                  <label style={{ fontSize: "16px", fontWeight: "600", color: "#081332" }}>Social Media Links</label>
                  <div className="business-social-links" style={{ display: "flex", gap: "15px", marginTop: "12px", flexWrap: "wrap" }}>
                    {profileData.facebook && (
                      <a href={profileData.facebook} target="_blank" rel="noopener noreferrer" className="social-link-badge" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "#f0f2f5", color: "#1877f2", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
                        Facebook
                      </a>
                    )}
                    {profileData.instagram && (
                      <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" className="social-link-badge" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "#fdf0f5", color: "#e1306c", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                        Instagram
                      </a>
                    )}
                    {profileData.linkedIn && (
                      <a href={profileData.linkedIn} target="_blank" rel="noopener noreferrer" className="social-link-badge" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "#e8f3f9", color: "#0077b5", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        LinkedIn
                      </a>
                    )}
                    {profileData.youtube && (
                      <a href={profileData.youtube} target="_blank" rel="noopener noreferrer" className="social-link-badge" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "#ffeeee", color: "#ff0000", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        YouTube
                      </a>
                    )}
                    {profileData.twitter && (
                      <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="social-link-badge" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "#f1f3f5", color: "#0f1419", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Twitter / X
                      </a>
                    )}
                    {!profileData.facebook && !profileData.instagram && !profileData.linkedIn && !profileData.youtube && !profileData.twitter && (
                      <span style={{ color: "#777E90", fontSize: "14px", fontStyle: "italic" }}>No social links added</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3>More Information</h3>

                {interests.length > 0 && (
                  <div className="dating-profile-info-group">
                    <label>Interest</label>
                    <div className="dating-profile-tags">
                      {interests.map((interest, index) => (
                        <span key={index} className="dating-profile-tag">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}

                {habits.length > 0 && (
                  <div className="dating-profile-info-group">
                    <label>Habits</label>
                    <div className="dating-profile-tags">
                      {habits.map((habit, index) => (
                        <span key={index} className="dating-profile-tag">{habit}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="dating-profile-info-grid">
                  {age && (
                    <div className="dating-profile-info-item">
                      <label>Age</label>
                      <p>{age}</p>
                    </div>
                  )}
                  <div className="dating-profile-info-item">
                    <label>Gender</label>
                    <p>{profileData.gender || "Not provided"}</p>
                  </div>
                  <div className="dating-profile-info-item">
                    <label>Religion</label>
                    <p>{profileData.religion || "Not provided"}</p>
                  </div>
                  <div className="dating-profile-info-item">
                    <label>Status</label>
                    <p>{profileData.status || "Not provided"}</p>
                  </div>
                </div>

                {profileData.preferredLanguage && (
                  <div className="dating-profile-info-group">
                    <label>Preferred Language</label>
                    <div className="dating-profile-tags">
                      <span className="dating-profile-tag">{profileData.preferredLanguage}</span>
                    </div>
                  </div>
                )}

                {profileData.skills && profileData.skills.length > 0 && (
                  <div className="dating-profile-info-group">
                    <label>Skills</label>
                    <div className="dating-profile-tags">
                      {profileData.skills.map((skill, index) => (
                        <span key={index} className="dating-profile-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.sports && profileData.sports.length > 0 && (
                  <div className="dating-profile-info-group">
                    <label>Sports</label>
                    <div className="dating-profile-tags">
                      {profileData.sports.map((sport, index) => (
                        <span key={index} className="dating-profile-tag">{sport}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.position && (
                  <div className="dating-profile-info-group">
                    <label>Position</label>
                    <div className="dating-profile-tags">
                      <span className="dating-profile-tag">{profileData.position}</span>
                    </div>
                  </div>
                )}

                {profileData.industry && (
                  <div className="dating-profile-info-group">
                    <label>Industry</label>
                    <div className="dating-profile-tags">
                      <span className="dating-profile-tag">{profileData.industry}</span>
                    </div>
                  </div>
                )}

                {profileData.company && (
                  <div className="dating-profile-info-group">
                    <label>Company</label>
                    <div className="dating-profile-tags">
                      <span className="dating-profile-tag">{profileData.company}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Delete Account Section */}
            <div className="dating-profile-info-group" style={{ marginTop: "30px", paddingTop: "30px", }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#DC2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#B91C1C";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#DC2626";
                }}
              >
                Delete Account
              </button>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "8px", marginBottom: "0" }}>
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>
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
    </>
  );
}
