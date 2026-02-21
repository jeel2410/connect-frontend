import { useState, useEffect } from "react";
import closeICon from "../../src/assets/image/close_icon.png";
import { X } from "lucide-react";
import API_BASE_URL from "../utils/config";
import { getCookie } from "../utils/auth";

const FilterModal = ({ isOpen, onClose, onApply, onClear }) => {
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [gender, setGender] = useState("Male");
  const [habits, setHabits] = useState("");
  const [interests, setInterests] = useState([]);
  const [language, setLanguage] = useState("");
  const [relationship, setRelationship] = useState("");
  const [religion, setReligion] = useState("");
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  
  // State for API data
  const [habitsList, setHabitsList] = useState([]);
  const [interestsList, setInterestsList] = useState([]);
  const [industriesList, setIndustriesList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
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

  // Fetch interests from API
  useEffect(() => {
    const fetchInterests = async () => {
      if (!isOpen) return; // Only fetch when modal is open
      
      try {
        setLoadingInterests(true);
        const token = getCookie("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/list/interest`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.interests) {
            setInterestsList(result.data.interests);
          }
        } else {
          console.error("Failed to fetch interests");
        }
      } catch (err) {
        console.error("Error fetching interests:", err);
      } finally {
        setLoadingInterests(false);
      }
    };

    fetchInterests();
  }, [isOpen]);

  // Fetch habits from API
  useEffect(() => {
    const fetchHabits = async () => {
      if (!isOpen) return; // Only fetch when modal is open
      
      try {
        setLoadingHabits(true);
        const token = getCookie("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/list/habits`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.habits) {
            setHabitsList(result.data.habits);
          }
        } else {
          console.error("Failed to fetch habits");
        }
      } catch (err) {
        console.error("Error fetching habits:", err);
      } finally {
        setLoadingHabits(false);
      }
    };

    fetchHabits();
  }, [isOpen]);

  // Fetch industries from API
  useEffect(() => {
    const fetchIndustries = async () => {
      if (!isOpen) return; // Only fetch when modal is open
      
      try {
        setLoadingIndustries(true);
        const token = getCookie("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/list/industries`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.industries) {
            setIndustriesList(result.data.industries);
          }
        } else {
          console.error("Failed to fetch industries");
        }
      } catch (err) {
        console.error("Error fetching industries:", err);
      } finally {
        setLoadingIndustries(false);
      }
    };

    fetchIndustries();
  }, [isOpen]);

  // Fetch companies from API when industry is selected
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!isOpen || !industry) {
        setCompaniesList([]);
        setCompany(""); // Reset company when industry changes
        return;
      }
      
      try {
        setLoadingCompanies(true);
        const token = getCookie("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        // Find the industry ID from the name
        const selectedIndustry = industriesList.find(ind => ind.name === industry);
        if (!selectedIndustry) {
          setCompaniesList([]);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/list/companies?industryId=${selectedIndustry._id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.companies) {
            setCompaniesList(result.data.companies);
          }
        } else {
          console.error("Failed to fetch companies");
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [isOpen, industry, industriesList]);

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
              {loadingHabits ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  Loading habits...
                </div>
              ) : habitsList.length === 0 ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  No habits available
                </div>
              ) : (
                habitsList.map((habit) => (
                  <button
                    key={habit._id}
                    className={`chip ${habits === habit.name ? "chip-active" : ""}`}
                    onClick={() => setHabits(habit.name)}
                  >
                    {habit.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="filter-section">
            <label className="filter-label">Interests</label>
            <div className="chip-group">
              {loadingInterests ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  Loading interests...
                </div>
              ) : interestsList.length === 0 ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  No interests available
                </div>
              ) : (
                interestsList.map((interest) => (
                  <button
                    key={interest._id}
                    className={`chip ${
                      interests.includes(interest.name) ? "chip-active" : ""
                    }`}
                    onClick={() => handleInterestToggle(interest.name)}
                  >
                    {interest.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Language */}
          <div className="filter-section">
            <label className="filter-label">Language</label>
            <div className="chip-group">
              {["english", "spanish"].map((lang) => (
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
              {["Married", "Unmarried"].map((status) => (
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
              {["Hindu", "Christian", "Muslim", "Chirstian","Sikh"].map((rel) => (
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

          {/* Industry */}
          <div className="filter-section">
            <label className="filter-label">Industry</label>
            <div className="chip-group">
              {loadingIndustries ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  Loading industries...
                </div>
              ) : industriesList.length === 0 ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  No industries available
                </div>
              ) : (
                industriesList.map((ind) => (
                  <button
                    key={ind._id}
                    className={`chip ${industry === ind.name ? "chip-active" : ""}`}
                    onClick={() => {
                      setIndustry(ind.name);
                      setSelectedIndustryId(ind._id);
                      setCompany(""); // Reset company when industry changes
                      setSelectedCompanyId(""); // Reset company ID
                    }}
                  >
                    {ind.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Company */}
          <div className="filter-section">
            <label className="filter-label">Company</label>
            <div className="chip-group">
              {!industry ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "14px" }}>
                  Please select an industry first
                </div>
              ) : loadingCompanies ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  Loading companies...
                </div>
              ) : companiesList.length === 0 ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  No companies available for this industry
                </div>
              ) : (
                companiesList.map((comp) => (
                  <button
                    key={comp._id}
                    className={`chip ${company === comp.name ? "chip-active" : ""}`}
                    onClick={() => {
                      setCompany(comp.name);
                      setSelectedCompanyId(comp._id);
                    }}
                  >
                    {comp.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-clear" onClick={() => {
            // Reset all filters
            setAgeRange([0, 100]);
            setGender("Any");
            setHabits("");
            setInterests([]);
            setLanguage("");
            setRelationship("");
            setReligion("");
            setIndustry("");
            setCompany("");
            setSelectedIndustryId("");
            setSelectedCompanyId("");
            if (onClear) {
              onClear();
            } else {
              onClose();
            }
          }}>
            Clear
          </button>
          <button className="btn-apply" onClick={() => {
            if (onApply) {
              onApply({
                ageRange,
                gender,
                habits,
                interests,
                language,
                relationship,
                religion,
                industry: selectedIndustryId || null,
                company: selectedCompanyId || null
              });
            } else {
              onClose();
            }
          }}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
