import React from "react";

import mobileIcon from "../../src/assets/image/mobile.png"
import emailIcon from "../../src/assets/image/email.png"
import calenderIcon from "../../src/assets/image/calender.png"
import cityIcon from "../../src/assets/image/city.png"
import ProfilecardHeader from "./ProfilecardHeader";

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
          </div>
        </div>
      </div>

  );
}
