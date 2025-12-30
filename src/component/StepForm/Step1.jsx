import React from "react";
import "../../styles/style.css";
import mobileIcon from "../../assets/image/mobile.png";
import passwordIcon from "../../assets/image/password.png"
import fullnameIcon from "../../assets/image/firstname.png"
import cityIcon from "../../assets/image/city.png"
import religionIcon from "../../assets/image/religion.png"
import statusIcon from "../../assets/image/status.png"

const Step1 = ({ data, updateData, errors, touched, phoneNumber }) => {
  return (
    <div className="step-content active">
      <h2 className="step-title">About You</h2>
      <p className="step-description">Enter your credentials to continue</p>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={mobileIcon} alt="Mobile"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Mobile Number</label>
            <input
              type="text"
              className={`form-input ${touched?.mobileNumber && errors?.mobileNumber ? "input-error" : ""}`}
              value={phoneNumber || data.mobileNumber || ""}
              disabled={true}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon} alt="Full Name"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={data.fullName || ""}
              onChange={(e) => updateData("fullName", e.target.value)}
              onBlur={() => updateData("_touched_fullName", true)}
              className={`form-input ${touched?.fullName && errors?.fullName ? "input-error" : ""}`}
            />
            {touched?.fullName && errors?.fullName && (
              <div className="field-error-message">{errors.fullName}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={cityIcon} alt="City"></img>
          </div>
          <div className="input-content">
            <label className="input-label">City</label>
            <select
              value={data.city || ""}
              onChange={(e) => updateData("city", e.target.value)}
              onBlur={() => updateData("_touched_city", true)}
              className={touched?.city && errors?.city ? "input-error" : ""}
            >
              <option value="">Select City</option>
              <option value="ahmedabad">Ahmedabad</option>
              <option value="Baroda">Baroda</option>
            </select>
            {touched?.city && errors?.city && (
              <div className="field-error-message">{errors.city}</div>
            )}
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={religionIcon} alt="Religion"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Select Religion</label>
            <select
              value={data.religion || ""}
              onChange={(e) => updateData("religion", e.target.value)}
              onBlur={() => updateData("_touched_religion", true)}
              className={touched?.religion && errors?.religion ? "input-error" : ""}
            >
              <option value="">Select Religion</option>
              <option value="christianity">Christianity</option>
              <option value="hindu">Hindu</option>
            </select>
            {touched?.religion && errors?.religion && (
              <div className="field-error-message">{errors.religion}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={statusIcon} alt="Status"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Select Status</label>
            <select
              value={data.maritalStatus || ""}
              onChange={(e) => updateData("maritalStatus", e.target.value)}
              onBlur={() => updateData("_touched_maritalStatus", true)}
              className={touched?.maritalStatus && errors?.maritalStatus ? "input-error" : ""}
            >
              <option value="">Select Status</option>
              <option value="Married">Married</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Divorced">Divorced</option>
            </select>
            {touched?.maritalStatus && errors?.maritalStatus && (
              <div className="field-error-message">{errors.maritalStatus}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={passwordIcon} alt="Password"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              value={data.password || ""}
              onChange={(e) => updateData("password", e.target.value)}
              onBlur={() => updateData("_touched_password", true)}
              className={`form-input ${touched?.password && errors?.password ? "input-error" : ""}`}
            />
            {touched?.password && errors?.password && (
              <div className="field-error-message">{errors.password}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={passwordIcon} alt="Confirm Password"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={data.confirmPassword || ""}
              onChange={(e) => updateData("confirmPassword", e.target.value)}
              onBlur={() => updateData("_touched_confirmPassword", true)}
              className={`form-input ${touched?.confirmPassword && errors?.confirmPassword ? "input-error" : ""}`}
            />
            {touched?.confirmPassword && errors?.confirmPassword && (
              <div className="field-error-message">{errors.confirmPassword}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
