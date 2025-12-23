import React from "react";
import "../../styles/style.css";
import emailIcon from "../../assets/image/email.png";
import genderIcon from "../../assets/image/gender.png";
import birthIcon from "../../assets/image/calender.png";

const Step2 = ({ data, updateData }) => {
  return (
    <div className="step-content active">
      <h2 className="step-title">What's your Info</h2>
      <p className="step-description">Let others know about your languages</p>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={emailIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Email Id</label>
            <input
              type="email"
              value={data.email || ""}
              onChange={(e) => updateData("email", e.target.value)}
              placeholder="hellenpitter@gmail.com"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={genderIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Gender</label>
            <select
              value={data.gender || ""}
              onChange={(e) => updateData("gender", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={birthIcon}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Date of Birth</label>
            <input
              type="text"
              value={data.birthDate || ""}
              onChange={(e) => updateData("birthDate", e.target.value)}
              placeholder="05 DEcember,2024"
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;
