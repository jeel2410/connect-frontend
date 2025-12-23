import React, { useState } from "react";
import Header from "../component/Header";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import ProfilecardHeader from "../component/ProfilecardHeader";
import mobileIcon from "../../src/assets/image/mobile.png";
import emailIcon from "../../src/assets/image/email.png";
import calenderIcon from "../../src/assets/image/calender.png";
import cityIcon from "../../src/assets/image/city.png";
import removeIcom from "../../src/assets/image/removeIcon.png";
import dropdownIcon from "../../src/assets/image/dropdownIcon.png";
import ProfilepageCard from "../component/ProfilepageCard";

export default function EditProfile() {
  const [data, setData] = useState({
    mobileNumber: "",
    email: "",
    birthDate: "",
    city: "",
  });

  const [interests, setInterests] = useState([
    "Shopping",
    "Music",
    "Coffee",
    "Books",
    "Piano",
    "Football",
  ]);
  const [habits, setHabits] = useState([
    "Regular Smoker",
    "Clothing",
    "Reworking",
  ]);

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const removeHabit = (index) => {
    setHabits(habits.filter((_, i) => i !== index));
  };
  return (
    <>
      <Header></Header>
      <div className="dating-profile-wrapper">
        <Sidebar></Sidebar>

        <div className="edit-profile-container">
          <div className="edit-profile-card">
            {/* Header with Avatar */}
            <ProfilecardHeader showChangePassword={false}></ProfilecardHeader>

            {/* Contact Information */}
            <div className="edit-profile-contact-grid">
              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={mobileIcon}></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Mobile Number</label>
                    <input
                      type="text"
                      value={data.email || ""}
                      onChange={(e) => setData("mobileNumber", e.target.value)}
                      placeholder="+91 6789067890"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={emailIcon}></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Email Id</label>
                    <input
                      type="text"
                      value={data.email || ""}
                      onChange={(e) => setData("email", e.target.value)}
                      placeholder="Hellen Pitter"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={calenderIcon}></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Date of birth</label>
                    <input
                      type="text"
                      value={data.email || ""}
                      onChange={(e) => setData("birthDate", e.target.value)}
                      placeholder="05 December,2024"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={cityIcon}></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Date of birth</label>
                    <div className="edit-profile-custom-select">
                      <select>
                        <option>Brooklyn</option>
                        <option>Manhattan</option>
                        <option>Queens</option>
                      </select>
                      <span className="edit-profile-custom-arrow">
                        <img src={dropdownIcon}></img>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* More Information Section */}
            <div className="edit-profile-more-info">
              <h3>More Information</h3>
              <div className="edit-profile-section">
                <div className="edit-profile-tags-container">
                  <div className="edit-profile-label">Interest</div>
                  <div className="edit-profile-tags-row">
                    <div className="edit-profile-tags">
                      {interests.map((interest, index) => (
                        <span key={index} className="edit-profile-tag">
                          {interest}
                          <button
                            className="edit-profile-tag-remove"
                            onClick={() => removeInterest(index)}
                          >
                            <img src={removeIcom}></img>
                          </button>
                        </span>
                      ))}
                    </div>
                    <button className="edit-profile-dropdown-toggle">
                      <img src={dropdownIcon}></img>
                    </button>
                  </div>
                </div>
              </div>
              <div className="edit-profile-section">
                <div className="edit-profile-tags-container">
                  <div className="edit-profile-label">Interest</div>
                  <div className="edit-profile-tags-row">
                    <div className="edit-profile-tags">
                      {habits.map((habit, index) => (
                        <span key={index} className="edit-profile-tag">
                          {habit}
                          <button
                            className="edit-profile-tag-remove"
                            onClick={() => removeHabit(index)}
                          >
                            <img src={removeIcom}></img>
                          </button>
                        </span>
                      ))}
                    </div>
                    <button className="edit-profile-dropdown-toggle">
                      <img src={dropdownIcon}></img>
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info Grid */}
              <div className="edit-profile-info-grid">
                <div className="edit-profile-field-inline">
                  <label>Age</label>
                  <select>
                    <option>26</option>
                    <option>25</option>
                    <option>27</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon}></img>
                  </span>
                </div>
                <div className="edit-profile-field-inline">
                  <label>Gender</label>
                  <select>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon}></img>
                  </span>
                </div>
                <div className="edit-profile-field-inline">
                  <label>Religion</label>
                  <select>
                    <option>Christianity</option>
                    <option>Islam</option>
                    <option>Hinduism</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon}></img>
                  </span>
                </div>
                <div className="edit-profile-field-inline">
                  <label>Status</label>
                  <select>
                    <option>Married</option>
                    <option>Single</option>
                    <option>Divorced</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon}></img>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="edit-profile-actions">
              <button className="edit-profile-cancel-btn">Cancel</button>
              <button className="edit-profile-save-btn">Save</button>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
