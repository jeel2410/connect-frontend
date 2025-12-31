import React from "react";
import profileImage from "../../src/assets/image/profile.png";
import editIcon from "../../src/assets/image/edit (1).png";
import passwordIcon from "../../src/assets/image/passwordIcon.png";
import { useNavigate } from "react-router-dom";

export default function ProfilecardHeader({ showChangePassword = true, profileData = null }) {
  const navigate = useNavigate();
  
  const displayName = profileData?.fullName || "User";
  const displayImage = profileData?.profileImage || profileImage;
  
  return (
    <div className="dating-profile-header">
      <div className="dating-profile-header-background"></div>
      <div className="dating-profile-header-content">
        <div className="dating-profile-header-avatar-wrapper">
          <img
            src={displayImage}
            alt="Profile"
            className="dating-profile-header-avatar"
          />
          <h2>{displayName}</h2>
        </div>
        <div className="dating-profile-header-actions">
          <button className="dating-profile-edit-btn" onClick={() => navigate('/editProfile')}>
            <img src={editIcon} alt="Edit"></img> Edit Profile
          </button>
          {showChangePassword && (
            <button className="dating-profile-password-btn">
              <img src={passwordIcon} alt="Password" /> Change Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
