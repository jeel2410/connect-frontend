import React from "react";
import "../../styles/style.css";
import mobileIcon from "../../assets/image/mobile.png";
import passwordIcon from "../../assets/image/password.png"
import fullnameIcon from "../../assets/image/firstname.png"
import cityIcon from "../../assets/image/city.png"
import religionIcon from "../../assets/image/religion.png"
import statusIcon from "../../assets/image/status.png"

const Step1 = ({ data, updateData }) => {
  return (
    <div className="step-content active">
      <h2 className="step-title">About You</h2>
      <p className="step-description">Enter your credentials to continue</p>

      {/* <div className="form-group">
        <input
          type="text"
          value={data.mobileNumber || ""}
          onChange={(e) => updateData("mobileNumber", e.target.value)}
          placeholder="Mobile Number"
        />
      </div> */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={mobileIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Mobile Number & Email ID</label>
            <input
              type="text"
              className="form-input"
              value={data.mobileNumber || ""}
              onChange={(e) => updateData("mobileNumber", e.target.value)}
              placeholder="+91 98765-67890"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              value={data.fullName || ""}
              onChange={(e) => updateData("fullName", e.target.value)}
              placeholder="Hellen Pitter"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={cityIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">City</label>
            <select
              value={data.city || ""}
              onChange={(e) => updateData("city", e.target.value)}
            >
              <option value="">Ahmedabad</option>
              <option value="Baroda">Baroda</option>
            </select>
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={religionIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Select Religion</label>

            <select
              value={data.region || ""}
              onChange={(e) => updateData("region", e.target.value)}
            >
              <option value="">Christianity</option>
              <option value="hindu">Hindu</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={statusIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Select Status</label>
            <select
              value={data.maritalStatus || ""}
              onChange={(e) => updateData("maritalStatus", e.target.value)}
            >
              <option value="">Married</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={passwordIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Password</label>
            <input
              type="password"
              value={data.password || ""}
              onChange={(e) => updateData("password", e.target.value)}
              placeholder="••••••••••••"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={passwordIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Confirm Password</label>
            <input
              type="password"
              value={data.confirmPassword || ""}
              onChange={(e) => updateData("confirmPassword", e.target.value)}
              placeholder="••••••••••••"
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
