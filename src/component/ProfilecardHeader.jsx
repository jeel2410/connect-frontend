import React, { useRef } from "react";
import { getAvatar } from "../utils/avatarHelper";
import editIcon from "../../src/assets/image/edit (1).png";
import passwordIcon from "../../src/assets/image/passwordIcon.png";
import { useNavigate } from "react-router-dom";

export default function ProfilecardHeader({ showChangePassword = true, profileData = null, onImageChange = null, showImageUpload = false, onCoverImageChange = null }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isBusiness = profileData?.isBusinessProfile === true;
  const businessPlaceholderLogo = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop";
  const defaultAvatar = isBusiness ? businessPlaceholderLogo : getAvatar(profileData?.gender, profileData?.dateOfBirth || profileData?.age || profileData?.birthDate);

  const displayName = isBusiness ? (profileData?.businessName || "Business User") : (profileData?.fullName || "User");
  const displayImage = isBusiness ? (profileData?.businessLogo || businessPlaceholderLogo) : (profileData?.profileImage || defaultAvatar);
  const displayCover = isBusiness ? (profileData?.businessCoverImage || profileData?.coverImage) : profileData?.coverImage;

  const handleImageClick = () => {
    if (fileInputRef.current && showImageUpload) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="dating-profile-header">
      <div
        className="dating-profile-header-background"
        style={displayCover ? { backgroundImage: `url(${displayCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      ></div>
      <div className="dating-profile-header-content">
        <div className="dating-profile-header-avatar-wrapper">
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={displayImage}
              alt="Profile"
              className="dating-profile-header-avatar"
              style={{ objectFit: isBusiness ? 'contain' : 'cover', backgroundColor: isBusiness ? '#fff' : 'transparent', border: isBusiness ? '1px solid #e5e7eb' : 'none' }}
            />
            {showImageUpload && onImageChange && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  style={{ display: "none" }}
                />
                <button
                  onClick={handleImageClick}
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#EA650A",
                    border: "3px solid white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    padding: 0
                  }}
                  title="Change profile picture"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9C3 7.89543 3.89543 7 5 7H9L11 5H13L15 7H19C20.1046 7 21 7.89543 21 9V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="13" r="3" stroke="white" strokeWidth="2" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <h2>{displayName}</h2>
        </div>
        <div className="dating-profile-header-actions">
          <button className="dating-profile-edit-btn" onClick={() => navigate('/editProfile')}>
            <img src={editIcon} alt="Edit"></img> Edit Profile
          </button>
          <button
            className="dating-profile-edit-btn"
            onClick={() => navigate('/userprofile', { state: { userId: profileData?.originalid || profileData?._id } })}
            style={{ marginLeft: "10px" }}
          >
            Preview Profile
          </button>
          {onCoverImageChange && (
            <div style={{ display: "inline-block" }}>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={onCoverImageChange}
                style={{ display: "none" }}
              />
              <button
                className="dating-profile-edit-btn"
                onClick={() => coverInputRef.current?.click()}
                style={{ marginLeft: "10px" }}
              >
                Cover Image
              </button>
            </div>
          )}
          {/* {showChangePassword && (
            <button className="dating-profile-password-btn">
              <img src={passwordIcon} alt="Password" /> Change Password
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}
