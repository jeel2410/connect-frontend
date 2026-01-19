import React, { useRef, useState, useEffect } from "react";
import "../../styles/style.css";
import emailIcon from "../../assets/image/email.png";
import genderIcon from "../../assets/image/gender.png";
import birthIcon from "../../assets/image/calender.png";

// Helper function to format date as "24 December, 2000"
const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

const Step2 = ({ data, updateData, errors, touched }) => {
  const dateInputRef = useRef(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
            <div style={{ position: "relative" }}>
              {/* Hidden date input for actual date selection */}
              <input
                ref={dateInputRef}
                type="date"
                value={data.birthDate || ""}
                onChange={(e) => {
                  updateData("birthDate", e.target.value);
                  setShowDatePicker(false);
                }}
                onBlur={() => {
                  updateData("_touched_birthDate", true);
                  setShowDatePicker(false);
                }}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  zIndex: 2,
                  pointerEvents: showDatePicker ? "auto" : "none"
                }}
              />
              {/* Visible text input showing formatted date */}
              <input
                type="text"
                readOnly
                value={data.birthDate ? formatDateDisplay(data.birthDate) : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setShowDatePicker(true);
                  // Try to use showPicker() if available (modern browsers)
                  if (dateInputRef.current?.showPicker) {
                    dateInputRef.current.showPicker();
                  } else {
                    // Fallback for older browsers
                    dateInputRef.current?.click();
                  }
                }}
                onFocus={(e) => {
                  e.target.blur(); // Prevent keyboard from appearing
                  setShowDatePicker(true);
                  if (dateInputRef.current?.showPicker) {
                    dateInputRef.current.showPicker();
                  } else {
                    dateInputRef.current?.click();
                  }
                }}
                placeholder="Select date of birth"
                className={`form-input ${touched?.birthDate && errors?.birthDate ? "input-error" : ""}`}
                style={{
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  caretColor: "transparent"
                }}
              />
            </div>
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
