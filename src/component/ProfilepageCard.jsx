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

export default function ProfilepageCard({ profileData }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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
          ></ProfilecardHeader>

          {/* Contact Info Row */}
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
                <p>{profileData.city || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div className="dating-profile-section">
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
