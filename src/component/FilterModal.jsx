import { useState } from "react";
import closeICon from "../../src/assets/image/close_icon.png";
import { X } from "lucide-react";
const FilterModal = ({ isOpen, onClose }) => {
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [gender, setGender] = useState("Male");
  const [habits, setHabits] = useState("Get Serious");
  const [interests, setInterests] = useState([]);
  const [language, setLanguage] = useState("");
  const [relationship, setRelationship] = useState("");
  const [religion, setReligion] = useState("");
  const handleAgeChange = (e, index) => {
    const newRange = [...ageRange];
    newRange[index] = parseInt(e.target.value);
    setAgeRange(newRange);
  };

  const handleInterestToggle = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="filter-modal">
        <div className="modal-header">
          <h2>Filter</h2>
          <button className="close-btn" onClick={onClose}>
            <img src={closeICon}></img>
          </button>
        </div>

        <div className="modal-body">
          {/* Age Range */}
          <div className="filter-section">
            <div style={{ display: "flex",gap:'100px' }}>
              <label className="filter-label">Age Range</label>
              <div className="filter-sidebar-range-values">
                <span>{ageRange[0]}</span>
                <span> - </span>
                <span>{ageRange[1]}</span>
              </div>
            </div>
            <div className="filter-sidebar-range-wrapper">
              <input
                type="range"
                min="18"
                max="65"
                value={ageRange[0]}
                onChange={(e) => handleAgeChange(e, 0)}
                className="filter-sidebar-range-input filter-sidebar-range-min"
                style={{
                  background: `linear-gradient(to right, #EA650A6B ${
                    ((ageRange[0] - 18) / 47) * 100
                  }%, #EA650A ${((ageRange[0] - 18) / 47) * 100}%, #EA650A ${
                    ((ageRange[1] - 18) / 47) * 100
                  }%, #EA650A6B ${((ageRange[1] - 18) / 47) * 100}%)`,
                }}
              />
              <input
                type="range"
                min="18"
                max="65"
                value={ageRange[1]}
                onChange={(e) => handleAgeChange(e, 1)}
                className="filter-sidebar-range-input filter-sidebar-range-max"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="filter-section">
            <label className="filter-label">Gender</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={gender === "Male"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span className="custom-radio"></span>
                <span>Male</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={gender === "Female"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span className="custom-radio"></span>
                <span>Female</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={gender === "Other"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span className="custom-radio"></span>
                <span>Other</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Any"
                  checked={gender === "Any"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span className="custom-radio"></span>
                <span>Any</span>
              </label>
            </div>
          </div>

          {/* Habits */}
          <div className="filter-section">
            <label className="filter-label">Habits</label>
            <div className="chip-group">
              {[
                "Night Out",
                "Regular Smooker",
                "Get Serious",
                "Drinking",
                "Regular Drinke",
              ].map((habit) => (
                <button
                  key={habit}
                  className={`chip ${habits === habit ? "chip-active" : ""}`}
                  onClick={() => setHabits(habit)}
                >
                  {habit}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="filter-section">
            <label className="filter-label">Interests</label>
            <div className="chip-group">
              {["Travel", "Music", "Books", "Coffee", "Football"].map(
                (interest) => (
                  <button
                    key={interest}
                    className={`chip ${
                      interests.includes(interest) ? "chip-active" : ""
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Language */}
          <div className="filter-section">
            <label className="filter-label">Language</label>
            <div className="chip-group">
              {["English", "Spanish"].map((lang) => (
                <button
                  key={lang}
                  className={`chip ${language === lang ? "chip-active" : ""}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Relationship */}
          <div className="filter-section">
            <label className="filter-label">Relationship</label>
            <div className="chip-group">
              {["Married", "Single"].map((status) => (
                <button
                  key={status}
                  className={`chip ${
                    relationship === status ? "chip-active" : ""
                  }`}
                  onClick={() => setRelationship(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Religion */}
          <div className="filter-section">
            <label className="filter-label">Religion</label>
            <div className="chip-group">
              {["Hindu", "Christian", "Muslim", "Chirstian"].map((rel) => (
                <button
                  key={rel}
                  className={`chip ${religion === rel ? "chip-active" : ""}`}
                  onClick={() => setReligion(rel)}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-clear" onClick={onClose}>
            Clear
          </button>
          <button className="btn-apply" onClick={onClose}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
