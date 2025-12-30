import React from "react";
import "../../styles/style.css";
import emailIcon from "../../assets/image/email.png";
import genderIcon from "../../assets/image/gender.png";
import birthIcon from "../../assets/image/calender.png";

const Step2 = ({ data, updateData, errors, touched }) => {
  return (
    <div className="step-content active">
      <h2 className="step-title">What's your Info</h2>
      <p className="step-description">Let others know about your languages</p>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={emailIcon} alt="Email"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Email Id</label>
            <input
              type="email"
              value={data.email || ""}
              onChange={(e) => updateData("email", e.target.value)}
              onBlur={() => updateData("_touched_email", true)}
              // placeholder="hellenpitter@gmail.com"
              className={`form-input ${touched?.email && errors?.email ? "input-error" : ""}`}
            />
            {touched?.email && errors?.email && (
              <div className="field-error-message">{errors.email}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={genderIcon} alt="Gender"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Gender</label>
            <select
              value={data.gender || ""}
              onChange={(e) => updateData("gender", e.target.value)}
              onBlur={() => updateData("_touched_gender", true)}
              className={touched?.gender && errors?.gender ? "input-error" : ""}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>

            </select>
            {touched?.gender && errors?.gender && (
              <div className="field-error-message">{errors.gender}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={birthIcon} alt="Date of Birth"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Date of Birth</label>
            <input
              type="date"
              value={data.birthDate || ""}
              onChange={(e) => updateData("birthDate", e.target.value)}
              onBlur={() => updateData("_touched_birthDate", true)}
              className={`form-input ${touched?.birthDate && errors?.birthDate ? "input-error" : ""}`}
            />
            {touched?.birthDate && errors?.birthDate && (
              <div className="field-error-message">{errors.birthDate}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;
