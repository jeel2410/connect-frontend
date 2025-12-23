import React from "react";

import mobileIcon from "../../src/assets/image/mobile.png"
import emailIcon from "../../src/assets/image/email.png"
import calenderIcon from "../../src/assets/image/calender.png"
import cityIcon from "../../src/assets/image/city.png"
import ProfilecardHeader from "./ProfilecardHeader";
export default function ProfilepageCard() {
  return (
      <div className="dating-profile-main">
        <div className="dating-profile-card">
         <ProfilecardHeader showChangePassword={true}></ProfilecardHeader>

          {/* Contact Info Row */}
          <div className="dating-profile-contact-row">
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={mobileIcon}></img>
              </span>
              <div>
                <label>Mobile Number</label>
                <p>+91 99548-20314</p>
              </div>
            </div>
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={emailIcon}></img>
              </span>
              <div>
                <label>Email ID</label>
                <p>herlongtan@gmail.com</p>
              </div>
            </div>
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={calenderIcon}></img>
              </span>
              <div>
                <label>Date of Birth</label>
                <p>05 December, 2024</p>
              </div>
            </div>
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={cityIcon}></img>
              </span>
              <div>
                <label>Location</label>
                <p>Brooklyn</p>
              </div>
            </div>
          </div>

          <div className="dating-profile-section">
            <h3>More Information</h3>

            <div className="dating-profile-info-group">
              <label>Interest</label>
              <div className="dating-profile-tags">
                <span className="dating-profile-tag">Shopping</span>
                <span className="dating-profile-tag">Music</span>
                <span className="dating-profile-tag">Twitter</span>
                <span className="dating-profile-tag">Books</span>
                <span className="dating-profile-tag">Poem</span>
                <span className="dating-profile-tag">Football</span>
              </div>
            </div>

            <div className="dating-profile-info-group">
              <label>Habits</label>
              <div className="dating-profile-tags">
                <span className="dating-profile-tag">Regular Smoker</span>
                <span className="dating-profile-tag">Clothing</span>
                <span className="dating-profile-tag">Reworking</span>
              </div>
            </div>

            <div className="dating-profile-info-grid">
              <div className="dating-profile-info-item">
                <label>Age</label>
                <p>26</p>
              </div>
              <div className="dating-profile-info-item">
                <label>Marital Status</label>
                <p>Male</p>
              </div>
              <div className="dating-profile-info-item">
                <label>Religion</label>
                <p>Christianity</p>
              </div>
              <div className="dating-profile-info-item">
                <label>Status</label>
                <p>Married</p>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
}
