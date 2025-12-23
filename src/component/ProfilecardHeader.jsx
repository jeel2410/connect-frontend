import React from "react";
import profileImage from "../../src/assets/image/profile.png";
import editIcon from "../../src/assets/image/edit (1).png";
import passwordIcon from "../../src/assets/image/passwordIcon.png";
import { useNavigate } from "react-router-dom";
export default function ProfilecardHeader({ showChangePassword = true }) {
  const navigate=useNavigate()
  return (
    <div className="dating-profile-header">
      <div className="dating-profile-header-background"></div>
      <div className="dating-profile-header-content">
        <div className="dating-profile-header-avatar-wrapper">
          <img
            src={profileImage}
            alt="Profile"
            className="dating-profile-header-avatar"
          />
          <h2>Amelia Sutton</h2>
        </div>
        <div className="dating-profile-header-actions">
          <button className="dating-profile-edit-btn" onClick={()=>navigate('/editProfile')}>
            <img src={editIcon}></img> Edit Profile
          </button>
          {showChangePassword && (
            <button className="dating-profile-password-btn">
              <img src={passwordIcon} alt="" /> Change Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
