import React from "react";
import userProfile from "../assets/image/userProfile.png"
import closeIcon from "../assets/image/close.png"
import heartfillIcon from "../assets/image/fill_heart.png"
import blackcIcon from "../assets/image/black_c.png"
import messageIcon from "../assets/image/message.png"
export default function UserProfileModal() {
  return (
    <div>
      <div className="user-profile-top-section">
        <div className="user-profile-avatar-section">
          <img
            src={userProfile}
            alt="Profile"
            className="user-profile-avatar"
          />
          <div className="user-profile-name-location">
            <h2>Albert Flores</h2>
            <p>San Diego, CA</p>
          </div>
        </div>
        <div className="user-profile-social-btns">
          <button className="user-profile-social-btn close-btn">
            <img src={closeIcon}></img>
          </button>
          <button className="user-profile-social-btn heartfill-btn">
            <img src={heartfillIcon}></img>
          </button>
          <button className="user-profile-social-btn blackc-btn">
            <img
              src={blackcIcon}
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "5px",
              }}
            ></img>
          </button>
          <button className="user-profile-social-btn message-btn">
            <img src={messageIcon}></img>
          </button>
        </div>
      </div>
      <div className="user-profile-card">
        <div className="user-profile-card-content">
          <div className="user-profile-detail-section">
            <h3 className="user-profile-section-title">Interest</h3>
            <div className="user-profile-pill-group">
              <span className="user-profile-pill">Shopping</span>
              <span className="user-profile-pill">Music</span>
              <span className="user-profile-pill">Coffee</span>
              <span className="user-profile-pill">Books</span>
              <span className="user-profile-pill">Football</span>
            </div>
          </div>
          <div className="user-profile-detail-section">
            <h3 className="user-profile-section-title">Habits</h3>
            <div className="user-profile-pill-group">
              <span className="user-profile-pill">Regular Smoker</span>
              <span className="user-profile-pill">Drinking</span>
              <span className="user-profile-pill">Reworking</span>
            </div>
          </div>
          <div className="user-profile-details-grid">
            <div className="user-profile-detail-item">
              <label>Mobile Number</label>
              <p>+49 99999-79333</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Email ID</label>
              <p>albertflores@gmail.com</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Age</label>
              <p>23</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Gender</label>
              <p>Male</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Date of Birth</label>
              <p>01 December, 2024</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Religion</label>
              <p>Christianity</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Status</label>
              <p>Married</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Languages</label>
              <p>English</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
