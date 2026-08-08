import React from "react";
import "../../styles/style.css";
import facebookIcon from "../../assets/image/social/facebook.png";
import instagramIcon from "../../assets/image/social/instagram.png";
import linkedinIcon from "../../assets/image/social/linkedin.png";
import twitterIcon from "../../assets/image/social/twitter.png";
import fullnameIcon from "../../assets/image/firstname.png";

const BusinessStep3 = ({ data, updateData, errors, touched }) => {
  return (
    <div className="step-content active">
      <h2 className="step-title">Website & Social Links</h2>
      <p className="step-description">Connect your website and social media accounts to strengthen your business presence online.</p>

      {/* Facebook */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={facebookIcon} alt="Facebook" style={{ width: "20px", height: "20px" }}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Facebook</label>
            <input
              type="text"
              name="facebook"
              value={data.facebook || ""}
              onChange={(e) => updateData("facebook", e.target.value)}
              className="form-input"
              placeholder="https://facebook.com/your-page"
            />
          </div>
        </div>
      </div>

      {/* Instagram */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={instagramIcon} alt="Instagram" style={{ width: "20px", height: "20px" }}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={data.instagram || ""}
              onChange={(e) => updateData("instagram", e.target.value)}
              className="form-input"
              placeholder="https://instagram.com/your-profile"
            />
          </div>
        </div>
      </div>

      {/* LinkedIn */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={linkedinIcon} alt="LinkedIn" style={{ width: "20px", height: "20px" }}></img>
          </div>
          <div className="input-content">
            <label className="input-label">LinkedIn</label>
            <input
              type="text"
              name="linkedIn"
              value={data.linkedIn || ""}
              onChange={(e) => updateData("linkedIn", e.target.value)}
              className="form-input"
              placeholder="https://linkedin.com/in/your-profile"
            />
          </div>
        </div>
      </div>

      {/* YouTube */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon} alt="Youtube" style={{ opacity: 0.7 }}></img>
          </div>
          <div className="input-content">
            <label className="input-label">YouTube</label>
            <input
              type="text"
              name="youtube"
              value={data.youtube || ""}
              onChange={(e) => updateData("youtube", e.target.value)}
              className="form-input"
              placeholder="https://youtube.com/c/your-channel"
            />
          </div>
        </div>
      </div>

      {/* X (Twitter) */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={twitterIcon} alt="Twitter" style={{ width: "20px", height: "20px" }}></img>
          </div>
          <div className="input-content">
            <label className="input-label">X (Twitter)</label>
            <input
              type="text"
              name="twitter"
              value={data.twitter || ""}
              onChange={(e) => updateData("twitter", e.target.value)}
              className="form-input"
              placeholder="https://twitter.com/your-handle"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStep3;
