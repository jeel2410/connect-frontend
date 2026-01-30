import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { getCookie, setCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [data, setData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    birthDate: "",
    city: "",
    gender: "",
    religion: "",
    status: "",
    preferredLanguage: "",
  });

  const [interests, setInterests] = useState([]);
  const [habits, setHabits] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [industriesList, setIndustriesList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  
  // Dropdown states for interests, habits, skills
  const [interestsList, setInterestsList] = useState([]);
  const [habitsList, setHabitsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
  const [showHabitsDropdown, setShowHabitsDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      // Check if click is outside all dropdown containers
      if (!target.closest('.edit-profile-tags-row') && 
          !target.closest('.edit-profile-dropdown-menu')) {
        setShowInterestsDropdown(false);
        setShowHabitsDropdown(false);
        setShowSkillsDropdown(false);
      }
    };

    if (showInterestsDropdown || showHabitsDropdown || showSkillsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInterestsDropdown, showHabitsDropdown, showSkillsDropdown]);

  // Load current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) {
          setError("Please login to edit your profile");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized: Please login again");
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const result = await response.json();

        if (result.success && result.data && result.data.profile) {
          const profile = result.data.profile;
          
          // Normalize religion value (handle both lowercase and capitalized)
          let normalizedReligion = profile.religion || "";
          if (normalizedReligion) {
            const lowerReligion = normalizedReligion.toLowerCase();
            if (lowerReligion === "christianity" || lowerReligion === "christian") {
              normalizedReligion = "Christian";
            } else if (lowerReligion === "hindu") {
              normalizedReligion = "Hindu";
            } else if (lowerReligion === "muslim" || lowerReligion === "islam") {
              normalizedReligion = "Muslim";
            } else if (lowerReligion === "sikh") {
              normalizedReligion = "Sikh";
            } else {
              // Capitalize first letter if not matching
              normalizedReligion = normalizedReligion.charAt(0).toUpperCase() + normalizedReligion.slice(1).toLowerCase();
            }
          }
          
          // Normalize preferred language value
          let normalizedLanguage = profile.preferredLanguage || "";
          if (normalizedLanguage) {
            const lowerLang = normalizedLanguage.toLowerCase();
            if (lowerLang === "english") {
              normalizedLanguage = "English";
            } else if (lowerLang === "hindi") {
              normalizedLanguage = "Hindi";
            } else if (lowerLang === "gujarati") {
              normalizedLanguage = "Gujarati";
            } else if (lowerLang === "marathi") {
              normalizedLanguage = "Marathi";
            } else if (lowerLang === "tamil") {
              normalizedLanguage = "Tamil";
            } else {
              // Capitalize first letter if not matching
              normalizedLanguage = normalizedLanguage.charAt(0).toUpperCase() + normalizedLanguage.slice(1).toLowerCase();
            }
          }
          
          // Populate form with current profile data
          setData({
            fullName: profile.fullName || "",
            phoneNumber: profile.phoneNumber || "",
            email: profile.email || "",
            birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
            city: profile.city || "",
            gender: profile.gender || "",
            religion: normalizedReligion,
            status: profile.status || "",
            preferredLanguage: normalizedLanguage,
          });
          
          setInterests(profile.interests || []);
          setHabits(profile.habits || []);
          setSkills(profile.skills || []);
          setIndustry(profile.industry || "");
          setCompany(profile.company || "");
          if (profile.profileImage) {
            setProfileImage(profile.profileImage);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoadingIndustries(true);
        const token = getCookie("authToken");
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
        }
      } catch (err) {
        console.error("Error fetching industries:", err);
      } finally {
        setLoadingIndustries(false);
      }
    };

    fetchIndustries();
  }, []);

  // Fetch companies when industry is selected
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!industry) {
        setCompaniesList([]);
        return;
      }

      try {
        setLoadingCompanies(true);
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/companies?industryId=${industry}`, {
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
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [industry]);

  // Fetch interests list
  useEffect(() => {
    const fetchInterestsList = async () => {
      try {
        setLoadingInterests(true);
        const token = getCookie("authToken");
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
        }
      } catch (err) {
        console.error("Error fetching interests:", err);
      } finally {
        setLoadingInterests(false);
      }
    };

    fetchInterestsList();
  }, []);

  // Fetch habits list
  useEffect(() => {
    const fetchHabitsList = async () => {
      try {
        setLoadingHabits(true);
        const token = getCookie("authToken");
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
        }
      } catch (err) {
        console.error("Error fetching habits:", err);
      } finally {
        setLoadingHabits(false);
      }
    };

    fetchHabitsList();
  }, []);

  // Fetch skills list
  useEffect(() => {
    const fetchSkillsList = async () => {
      try {
        setLoadingSkills(true);
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/skill`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.skills) {
            setSkillsList(result.data.skills);
          }
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkillsList();
  }, []);

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const removeHabit = (index) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const toggleInterest = (interestName) => {
    if (interests.includes(interestName)) {
      setInterests(interests.filter(i => i !== interestName));
    } else {
      setInterests([...interests, interestName]);
    }
  };

  const toggleHabit = (habitName) => {
    if (habits.includes(habitName)) {
      setHabits(habits.filter(h => h !== habitName));
    } else {
      setHabits([...habits, habitName]);
    }
  };

  const toggleSkill = (skillName) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter(s => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      setSaving(true);

      const token = getCookie("authToken");
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      // Prepare FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append("fullName", data.fullName);
      formData.append("city", data.city);
      formData.append("religion", data.religion);
      formData.append("status", data.status);
      formData.append("gender", data.gender);
      formData.append("dateOfBirth", data.birthDate || "");
      formData.append("habits", habits.join(","));
      formData.append("interests", interests.join(","));
      formData.append("skills", skills.join(","));
      formData.append("preferredLanguage", data.preferredLanguage);
      formData.append("email", data.email);
      formData.append("industry", industry || "");
      formData.append("company", company || "");

      // Add profile image if it's a new file
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile. Please try again.");
      }

      // Update profile in cookies
      if (result.success && result.data && result.data.profile) {
        setCookie("userProfile", JSON.stringify(result.data.profile), 7);
        if (result.data.profile.fullName) {
          setCookie("userFullName", result.data.profile.fullName, 7);
        }
        if (result.data.profile.email) {
          setCookie("userEmail", result.data.profile.email, 7);
        }
        if (result.data.profile.profileImage) {
          setCookie("userProfileImage", result.data.profile.profileImage, 7);
        }
      }

      setSuccess("Profile updated successfully!");
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate("/profile");
      }, 1500);

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };
  if (loading) {
    return (
      <>
        <Header></Header>
        <div className="dating-profile-wrapper">
          <Sidebar></Sidebar>
          <div className="edit-profile-container">
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
              Loading profile...
            </div>
          </div>
        </div>
        <Footer></Footer>
      </>
    );
  }

  return (
    <>
      <Header></Header>
      <div className="dating-profile-wrapper">
        <Sidebar profileData={data.fullName ? { fullName: data.fullName, profileImage } : null}></Sidebar>

        <div className="edit-profile-container">
          <div className="edit-profile-card">
            {/* Header with Avatar */}
            <ProfilecardHeader 
              showChangePassword={false}
              profileData={data.fullName ? { fullName: data.fullName, profileImage } : null}
            ></ProfilecardHeader>

            {/* Error and Success Messages */}
            {error && (
              <div className="message-error" style={{ margin: "20px" }}>
                {error}
              </div>
            )}
            {success && (
              <div className="message-success" style={{ margin: "20px" }}>
                {success}
              </div>
            )}

            {/* Contact Information */}
            <div className="edit-profile-contact-grid">
              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={mobileIcon} alt="Mobile"></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      value={data.fullName || ""}
                      onChange={(e) => updateData("fullName", e.target.value)}
                      placeholder="Enter full name"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={mobileIcon} alt="Mobile"></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Mobile Number</label>
                    <input
                      type="text"
                      value={data.phoneNumber || ""}
                      onChange={(e) => updateData("phoneNumber", e.target.value)}
                      placeholder="+91 6789067890"
                      className="form-input"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={emailIcon} alt="Email"></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Email Id</label>
                    <input
                      type="email"
                      value={data.email || ""}
                      onChange={(e) => updateData("email", e.target.value)}
                      placeholder="example@email.com"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={calenderIcon} alt="Calendar"></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">Date of birth</label>
                    <input
                      type="date"
                      value={data.birthDate || ""}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        // Validate 18+ on change
                        if (selectedDate) {
                          const birthDate = new Date(selectedDate);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          if (age < 18) {
                            alert("You must be at least 18 years old");
                            return;
                          }
                        }
                        updateData("birthDate", selectedDate);
                      }}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={cityIcon} alt="City"></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">City</label>
                    <input
                      type="text"
                      value={data.city || ""}
                      onChange={(e) => updateData("city", e.target.value)}
                      placeholder="Enter city"
                      className="form-input"
                    />
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
                  <div className="edit-profile-tags-row" style={{ position: "relative" }}>
                    <div className="edit-profile-tags">
                      {interests.map((interest, index) => (
                        <span key={index} className="edit-profile-tag">
                          {interest}
                          <button
                            className="edit-profile-tag-remove"
                            onClick={() => removeInterest(index)}
                          >
                            <img src={removeIcom} alt="Remove"></img>
                          </button>
                        </span>
                      ))}
                    </div>
                    <button 
                      className="edit-profile-dropdown-toggle"
                      onClick={() => setShowInterestsDropdown(!showInterestsDropdown)}
                    >
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </button>
                    {showInterestsDropdown && (
                      <div className="edit-profile-dropdown-menu" style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #E8EDF3",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1000,
                        minWidth: "200px",
                        marginTop: "8px"
                      }}>
                        {loadingInterests ? (
                          <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                            Loading...
                          </div>
                        ) : interestsList.length === 0 ? (
                          <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                            No interests available
                          </div>
                        ) : (
                          interestsList.map((interest) => (
                            <div
                              key={interest._id}
                              onClick={() => {
                                toggleInterest(interest.name);
                              }}
                              style={{
                                padding: "10px 16px",
                                cursor: "pointer",
                                backgroundColor: interests.includes(interest.name) ? "#F0F4F8" : "white",
                                borderBottom: "1px solid #E8EDF3"
                              }}
                              onMouseEnter={(e) => {
                                if (!interests.includes(interest.name)) {
                                  e.target.style.backgroundColor = "#F9FBFE";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!interests.includes(interest.name)) {
                                  e.target.style.backgroundColor = "white";
                                }
                              }}
                            >
                              {interest.name}
                              {interests.includes(interest.name) && (
                                <span style={{ marginLeft: "8px", color: "#EA650A" }}>✓</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="edit-profile-section">
                <div className="edit-profile-tags-container">
                  <div className="edit-profile-label">Habits</div>
                  <div className="edit-profile-tags-row" style={{ position: "relative" }}>
                    <div className="edit-profile-tags">
                      {habits.map((habit, index) => (
                        <span key={index} className="edit-profile-tag">
                          {habit}
                          <button
                            className="edit-profile-tag-remove"
                            onClick={() => removeHabit(index)}
                          >
                            <img src={removeIcom} alt="Remove"></img>
                          </button>
                        </span>
                      ))}
                    </div>
                    <button 
                      className="edit-profile-dropdown-toggle"
                      onClick={() => setShowHabitsDropdown(!showHabitsDropdown)}
                    >
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </button>
                    {showHabitsDropdown && (
                      <div className="edit-profile-dropdown-menu" style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #E8EDF3",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1000,
                        minWidth: "200px",
                        marginTop: "8px"
                      }}>
                        {loadingHabits ? (
                          <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                            Loading...
                          </div>
                        ) : habitsList.length === 0 ? (
                          <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                            No habits available
                          </div>
                        ) : (
                          habitsList.map((habit) => (
                            <div
                              key={habit._id}
                              onClick={() => {
                                toggleHabit(habit.name);
                              }}
                              style={{
                                padding: "10px 16px",
                                cursor: "pointer",
                                backgroundColor: habits.includes(habit.name) ? "#F0F4F8" : "white",
                                borderBottom: "1px solid #E8EDF3"
                              }}
                              onMouseEnter={(e) => {
                                if (!habits.includes(habit.name)) {
                                  e.target.style.backgroundColor = "#F9FBFE";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!habits.includes(habit.name)) {
                                  e.target.style.backgroundColor = "white";
                                }
                              }}
                            >
                              {habit.name}
                              {habits.includes(habit.name) && (
                                <span style={{ marginLeft: "8px", color: "#EA650A" }}>✓</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="edit-profile-section">
                <div className="edit-profile-tags-container">
                  <div className="edit-profile-label">Skills</div>
                  <div className="edit-profile-tags-row" style={{ position: "relative" }}>
                    <div className="edit-profile-tags">
                      {skills.map((skill, index) => (
                        <span key={index} className="edit-profile-tag">
                          {skill}
                          <button
                            className="edit-profile-tag-remove"
                            onClick={() => removeSkill(index)}
                          >
                            <img src={removeIcom} alt="Remove"></img>
                          </button>
                        </span>
                      ))}
                    </div>
                    <button 
                      className="edit-profile-dropdown-toggle"
                      onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                    >
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </button>
                    {showSkillsDropdown && (
                      <div className="edit-profile-dropdown-menu" style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #E8EDF3",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1000,
                        minWidth: "200px",
                        marginTop: "8px"
                      }}>
                        {loadingSkills ? (
                          <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                            Loading...
                          </div>
                        ) : skillsList.length === 0 ? (
                          <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                            No skills available
                          </div>
                        ) : (
                          skillsList.map((skill) => (
                            <div
                              key={skill._id}
                              onClick={() => {
                                toggleSkill(skill.name);
                              }}
                              style={{
                                padding: "10px 16px",
                                cursor: "pointer",
                                backgroundColor: skills.includes(skill.name) ? "#F0F4F8" : "white",
                                borderBottom: "1px solid #E8EDF3"
                              }}
                              onMouseEnter={(e) => {
                                if (!skills.includes(skill.name)) {
                                  e.target.style.backgroundColor = "#F9FBFE";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!skills.includes(skill.name)) {
                                  e.target.style.backgroundColor = "white";
                                }
                              }}
                            >
                              {skill.name}
                              {skills.includes(skill.name) && (
                                <span style={{ marginLeft: "8px", color: "#EA650A" }}>✓</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info Grid */}
              <div className="edit-profile-info-grid">
                <div className="edit-profile-field-inline">
                  <label>Gender</label>
                  <select
                    value={data.gender || ""}
                    onChange={(e) => updateData("gender", e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon} alt="Dropdown"></img>
                  </span>
                </div>
                <div className="edit-profile-field-inline">
                  <label>Religion</label>
                  <select
                    value={data.religion || ""}
                    onChange={(e) => updateData("religion", e.target.value)}
                  >
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon} alt="Dropdown"></img>
                  </span>
                </div>
                <div className="edit-profile-field-inline">
                  <label>Status</label>
                  <select
                    value={data.status || ""}
                    onChange={(e) => updateData("status", e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon} alt="Dropdown"></img>
                  </span>
                </div>
                <div className="edit-profile-field-inline">
                  <label>Preferred Language</label>
                  <select
                    value={data.preferredLanguage || ""}
                    onChange={(e) => updateData("preferredLanguage", e.target.value)}
                  >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon} alt="Dropdown"></img>
                  </span>
                </div>
                <div className="edit-profile-field-inline">
                  <label>Industry <span className="required">*</span></label>
                  <select
                    value={industry || ""}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      setCompany(""); // Clear company when industry changes
                    }}
                    disabled={loadingIndustries}
                  >
                    <option value="">Select Industry</option>
                    {industriesList.map((ind) => (
                      <option key={ind._id} value={ind._id}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <span className="edit-profile-select-arrow">
                    <img src={dropdownIcon} alt="Dropdown"></img>
                  </span>
                </div>
                {industry && (
                  <div className="edit-profile-field-inline">
                    <label>Company</label>
                    <select
                      value={company || ""}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={loadingCompanies}
                    >
                      <option value="">Select Company</option>
                      {companiesList.map((comp) => (
                        <option key={comp._id} value={comp._id}>
                          {comp.name}
                        </option>
                      ))}
                    </select>
                    <span className="edit-profile-select-arrow">
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Image Upload */}
              <div className="edit-profile-section">
                <div className="edit-profile-tags-container">
                  <div className="edit-profile-label">Profile Image</div>
                  <div style={{ marginTop: "12px" }}>
                    {profileImage && (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        style={{ 
                          width: "120px", 
                          height: "120px", 
                          borderRadius: "50%", 
                          objectFit: "cover",
                          marginBottom: "12px",
                          border: "2px solid #EA650A"
                        }} 
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "block", marginTop: "8px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="edit-profile-actions">
              <button 
                className="edit-profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="edit-profile-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
</button>
            </div>
          </div>
        </div>
      </div>

      <Footer></Footer>
    </>
  );
}
