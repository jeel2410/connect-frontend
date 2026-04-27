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
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [data, setData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    birthDate: "",
    city: "",
    gender: "",
    religion: "",
    status: "",
    preferredLanguage: [],
  });

  const [interests, setInterests] = useState([]);
  const [habits, setHabits] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [industriesList, setIndustriesList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Dropdown states for interests, habits, skills
  const [interestsList, setInterestsList] = useState([]);
  const [habitsList, setHabitsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
  const [showHabitsDropdown, setShowHabitsDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showLanguagesDropdown, setShowLanguagesDropdown] = useState(false);
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
        setShowLanguagesDropdown(false);
      }
    };

    if (showInterestsDropdown || showHabitsDropdown || showSkillsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInterestsDropdown, showHabitsDropdown, showSkillsDropdown]);

  // Store raw profile data
  const [rawProfileData, setRawProfileData] = useState(null);
  const [cityMatched, setCityMatched] = useState(false);
  const [industryMatched, setIndustryMatched] = useState(false);
  const [companyMatched, setCompanyMatched] = useState(false);

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
          
          // Store raw profile data for later matching
          setRawProfileData(profile);
          
          // Normalize religion value (handle both lowercase and capitalized)
          let normalizedReligion = profile.religion || "";
          if (normalizedReligion) {
            const lowerReligion = normalizedReligion.toLowerCase();
            if (lowerReligion === "christianity" || lowerReligion === "christian") {
              normalizedReligion = "Christianity";
            } else if (lowerReligion === "hindu" || lowerReligion === "hinduism") {
              normalizedReligion = "Hinduism";
            } else if (lowerReligion === "muslim" || lowerReligion === "islam") {
              normalizedReligion = "Islam";
            } else if (lowerReligion === "sikh" || lowerReligion === "sikhism") {
              normalizedReligion = "Sikhism";
            } else if (lowerReligion === "buddhism" || lowerReligion === "buddhist") {
              normalizedReligion = "Buddhism";
            } else if (lowerReligion === "jainism" || lowerReligion === "jain") {
              normalizedReligion = "Jainism";
            } else {
              // Capitalize first letter if not matching
              normalizedReligion = normalizedReligion.charAt(0).toUpperCase() + normalizedReligion.slice(1).toLowerCase();
            }
          }
          
          // Handle preferred language - can be string or array
          let languageArray = [];
          if (profile.preferredLanguage) {
            if (Array.isArray(profile.preferredLanguage)) {
              languageArray = profile.preferredLanguage;
            } else {
              // Convert single string to array
              languageArray = [profile.preferredLanguage];
            }
          }
          
          let normalizedStatus = profile.status || "";
          if (normalizedStatus === "Unmarried") {
            normalizedStatus = "Single";
          }
          
          setData({
            fullName: profile.fullName || "",
            phoneNumber: profile.phoneNumber || "",
            email: profile.email || "",
            birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
            city: "", // Will be set after cities list loads
            gender: profile.gender || "",
            religion: normalizedReligion,
            status: normalizedStatus,
            preferredLanguage: [],
          });
          
          setInterests(profile.interests || []);
          setHabits(profile.habits || []);
          setSkills(profile.skills || []);
          setLanguages(languageArray);
          setIndustry(""); // Will be set after industries list loads
          setCompany(""); // Will be set after companies list loads
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

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/city`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.city) {
            setCitiesList(result.data.city);
          }
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Match city name to ID after cities list loads
  useEffect(() => {
    if (rawProfileData && rawProfileData.city && citiesList.length > 0 && !cityMatched) {
      const cityName = rawProfileData.city;
      // Find city by name (case-insensitive)
      const matchedCity = citiesList.find(
        city => city.name.toLowerCase() === cityName.toLowerCase()
      );
      if (matchedCity) {
        setData(prev => ({ ...prev, city: matchedCity._id }));
        setCityMatched(true);
      }
    }
  }, [citiesList, rawProfileData, cityMatched]);

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

  // Match industry name to ID after industries list loads
  useEffect(() => {
    if (rawProfileData && rawProfileData.industry && industriesList.length > 0 && !industryMatched) {
      const industryName = rawProfileData.industry;
      // Find industry by name (case-insensitive)
      const matchedIndustry = industriesList.find(
        ind => ind.name.toLowerCase() === industryName.toLowerCase()
      );
      if (matchedIndustry) {
        setIndustry(matchedIndustry._id);
        setIndustryMatched(true);
      }
    }
  }, [industriesList, rawProfileData, industryMatched]);

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

  // Match company name to ID after companies list loads
  useEffect(() => {
    if (rawProfileData && rawProfileData.company && companiesList.length > 0 && industry && !companyMatched) {
      const companyName = rawProfileData.company;
      // Find company by name (case-insensitive)
      const matchedCompany = companiesList.find(
        comp => comp.name.toLowerCase() === companyName.toLowerCase()
      );
      if (matchedCompany) {
        setCompany(matchedCompany._id);
        setCompanyMatched(true);
      }
    }
  }, [companiesList, rawProfileData, industry, companyMatched]);

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

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
    // Clear error when user removes a language
    if (fieldErrors.preferredLanguage) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.preferredLanguage;
        return newErrors;
      });
    }
  };

  const toggleLanguage = (languageName) => {
    if (languages.includes(languageName)) {
      setLanguages(languages.filter(l => l !== languageName));
    } else {
      setLanguages([...languages, languageName]);
    }
    // Clear error when user selects/deselects a language
    if (fieldErrors.preferredLanguage) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.preferredLanguage;
        return newErrors;
      });
    }
  };

  const toggleInterest = (interestName) => {
    if (interests.includes(interestName)) {
      setInterests(interests.filter(i => i !== interestName));
    } else {
      setInterests([...interests, interestName]);
    }
    // Clear error when user selects/deselects an interest
    if (fieldErrors.interests) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.interests;
        return newErrors;
      });
    }
  };

  const toggleHabit = (habitName) => {
    if (habits.includes(habitName)) {
      setHabits(habits.filter(h => h !== habitName));
    } else {
      setHabits([...habits, habitName]);
    }
    // Clear error when user selects/deselects a habit
    if (fieldErrors.habits) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.habits;
        return newErrors;
      });
    }
  };

  const toggleSkill = (skillName) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter(s => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
    // Clear error when user selects/deselects a skill
    if (fieldErrors.skills) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
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

  // Function to clean up error message - remove quotes and format properly
  const cleanErrorMessage = (errorMessage) => {
    if (!errorMessage) return errorMessage;
    
    // Remove escaped quotes and quotes around field names
    // Example: "\"city\" is not allowed to be empty" -> "City is not allowed to be empty"
    let cleaned = errorMessage.replace(/\\?"([^"]+)"\\?/g, (match, fieldName) => {
      // Capitalize first letter of field name
      const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      return capitalized;
    });
    
    // Also handle cases like "city" (without escaped quotes)
    cleaned = cleaned.replace(/"([^"]+)"/g, (match, fieldName) => {
      const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      return capitalized;
    });
    
    // Handle common field name variations
    cleaned = cleaned.replace(/\bfullname\b/gi, 'Full name');
    cleaned = cleaned.replace(/\bfull name\b/gi, 'Full name');
    cleaned = cleaned.replace(/\bdateofbirth\b/gi, 'Date of birth');
    cleaned = cleaned.replace(/\bdate of birth\b/gi, 'Date of birth');
    cleaned = cleaned.replace(/\bpreferredlanguage\b/gi, 'Preferred language');
    cleaned = cleaned.replace(/\bpreferred language\b/gi, 'Preferred language');
    
    return cleaned;
  };

  // Function to parse error message and map to field
  const parseFieldError = (errorMessage) => {
    const fieldErrorMap = {};
    
    // Clean the error message first
    const cleanedMessage = cleanErrorMessage(errorMessage);
    
    // Check for common field-specific error patterns
    if (errorMessage.toLowerCase().includes("city")) {
      fieldErrorMap.city = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("email")) {
      fieldErrorMap.email = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("full name") || errorMessage.toLowerCase().includes("fullname")) {
      fieldErrorMap.fullName = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("gender")) {
      fieldErrorMap.gender = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("date of birth") || errorMessage.toLowerCase().includes("birthdate")) {
      fieldErrorMap.birthDate = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("religion")) {
      fieldErrorMap.religion = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("status") || errorMessage.toLowerCase().includes("marital")) {
      fieldErrorMap.status = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("language") || errorMessage.toLowerCase().includes("preferred")) {
      fieldErrorMap.preferredLanguage = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("industry")) {
      fieldErrorMap.industry = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("company")) {
      fieldErrorMap.company = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("habit")) {
      fieldErrorMap.habits = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("interest")) {
      fieldErrorMap.interests = cleanedMessage;
    } else if (errorMessage.toLowerCase().includes("skill")) {
      fieldErrorMap.skills = cleanedMessage;
    }
    
    return fieldErrorMap;
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      setFieldErrors({});
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
      formData.append("preferredLanguage", languages.join(","));
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
        const errorMessage = result.message || "Failed to update profile. Please try again.";
        // Try to parse field-specific errors
        const parsedErrors = parseFieldError(errorMessage);
        
        if (Object.keys(parsedErrors).length > 0) {
          // Field-specific error found
          setFieldErrors(parsedErrors);
        } else {
          // General error - show at top
          setError(errorMessage);
        }
        throw new Error(errorMessage);
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
        
        // Dispatch custom event to notify Header to refresh
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }

      setSuccess("Profile updated successfully!");
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate("/profile");
      }, 1500);

    } catch (err) {
      console.error("Error updating profile:", err);
      // Only set general error if no field-specific errors were set
      if (Object.keys(fieldErrors).length === 0) {
        setError(err.message || "Something went wrong. Please try again.");
      }
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
          {/* <Sidebar></Sidebar> */}
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
        {/* <Sidebar profileData={data.fullName ? { fullName: data.fullName, profileImage } : null}></Sidebar> */}

        <div className="edit-profile-container">
          <div className="edit-profile-card">
            {/* Header with Avatar */}
            <ProfilecardHeader 
              showChangePassword={false}
              profileData={data.fullName ? { fullName: data.fullName, profileImage } : null}
              onImageChange={handleImageChange}
              showImageUpload={true}
            ></ProfilecardHeader>

            {/* Success Message */}
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
                      onChange={(e) => {
                        updateData("fullName", e.target.value);
                        // Clear error when user starts typing
                        if (fieldErrors.fullName) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.fullName;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="Enter full name"
                      className={`form-input ${fieldErrors.fullName ? "input-error" : ""}`}
                    />
                  </div>
                </div>
                {fieldErrors.fullName && (
                  <div className="field-error-message" style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "60px" }}>
                    {fieldErrors.fullName}
                  </div>
                )}
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
                      onChange={(e) => {
                        updateData("email", e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="example@email.com"
                      className={`form-input ${fieldErrors.email ? "input-error" : ""}`}
                    />
                  </div>
                </div>
                {fieldErrors.email && (
                  <div className="field-error-message" style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "60px" }}>
                    {fieldErrors.email}
                  </div>
                )}
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
                        if (fieldErrors.birthDate) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.birthDate;
                            return newErrors;
                          });
                        }
                      }}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className={`form-input ${fieldErrors.birthDate ? "input-error" : ""}`}
                    />
                  </div>
                </div>
                {fieldErrors.birthDate && (
                  <div className="field-error-message" style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "60px" }}>
                    {fieldErrors.birthDate}
                  </div>
                )}
              </div>
              <div className="edit-form-group">
                <div className="edit-input-wrapper">
                  <div className="input-icon">
                    <img src={cityIcon} alt="City"></img>
                  </div>
                  <div className="input-content">
                    <label className="input-label">City</label>
                    <select
                      value={data.city || ""}
                      onChange={(e) => {
                        updateData("city", e.target.value);
                        if (fieldErrors.city) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.city;
                            return newErrors;
                          });
                        }
                      }}
                      className={`form-input ${fieldErrors.city ? "input-error" : ""}`}
                      disabled={loadingCities}
                    >
                      <option value="">{loadingCities ? "Loading cities..." : "Select City"}</option>
                      {citiesList.map((city) => (
                        <option key={city._id} value={city._id}>
                          {city.name.charAt(0).toUpperCase() + city.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {fieldErrors.city && (
                  <div className="field-error-message" style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "60px" }}>
                    {fieldErrors.city}
                  </div>
                )}
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
              {fieldErrors.interests && (
                <div style={{ 
                  marginTop: "8px", 
                  marginBottom: "16px",
                  fontSize: "12px", 
                  color: "#dc2626",
                  display: "block",
                  width: "100%",
                  paddingLeft: "0"
                }}>
                  {fieldErrors.interests}
                </div>
              )}
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
              {fieldErrors.habits && (
                <div style={{ 
                  marginTop: "8px", 
                  marginBottom: "16px",
                  fontSize: "12px", 
                  color: "#dc2626",
                  display: "block",
                  width: "100%",
                  paddingLeft: "0"
                }}>
                  {fieldErrors.habits}
                </div>
              )}

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
              {fieldErrors.skills && (
                <div style={{ 
                  marginTop: "8px", 
                  marginBottom: "16px",
                  fontSize: "12px", 
                  color: "#dc2626",
                  display: "block",
                  width: "100%",
                  paddingLeft: "0"
                }}>
                  {fieldErrors.skills}
                </div>
              )}

              {/* Additional Info Grid */}
              <div className="edit-profile-info-grid">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="edit-profile-field-inline">
                    <label>Gender</label>
                    <select
                      value={data.gender || ""}
                      onChange={(e) => {
                        updateData("gender", e.target.value);
                        if (fieldErrors.gender) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.gender;
                            return newErrors;
                          });
                        }
                      }}
                      className={fieldErrors.gender ? "input-error" : ""}
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
                  {fieldErrors.gender && (
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "20px" }}>
                      {fieldErrors.gender}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="edit-profile-field-inline">
                    <label>Religion</label>
                    <select
                      value={data.religion || ""}
                      onChange={(e) => {
                        updateData("religion", e.target.value);
                        if (fieldErrors.religion) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.religion;
                            return newErrors;
                          });
                        }
                      }}
                      className={fieldErrors.religion ? "input-error" : ""}
                    >
                      <option value="">Select Religion</option>
                      <option value="Hinduism">Hinduism</option>
                      <option value="Islam">Islam</option>
                      <option value="Christianity">Christianity</option>
                      <option value="Sikhism">Sikhism</option>
                      <option value="Buddhism">Buddhism</option>
                      <option value="Jainism">Jainism</option>
                    </select>
                    <span className="edit-profile-select-arrow">
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </span>
                  </div>
                  {fieldErrors.religion && (
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "20px" }}>
                      {fieldErrors.religion}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="edit-profile-field-inline">
                    <label>Status</label>
                    <select
                      value={data.status || ""}
                      onChange={(e) => {
                        updateData("status", e.target.value);
                        if (fieldErrors.status) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.status;
                            return newErrors;
                          });
                        }
                      }}
                      className={fieldErrors.status ? "input-error" : ""}
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <span className="edit-profile-select-arrow">
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </span>
                  </div>
                  {fieldErrors.status && (
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "20px" }}>
                      {fieldErrors.status}
                    </div>
                  )}
                </div>
                <div className="edit-profile-section">
                  <div className="edit-profile-tags-container">
                    <div className="edit-profile-label">Languages Spoken</div>
                    <div className="edit-profile-tags-row" style={{ position: "relative" }}>
                      <div className="edit-profile-tags">
                        {languages.map((language, index) => (
                          <span key={index} className="edit-profile-tag">
                            {language}
                            <button
                              className="edit-profile-tag-remove"
                              onClick={() => removeLanguage(index)}
                            >
                              <img src={removeIcom} alt="Remove"></img>
                            </button>
                          </span>
                        ))}
                      </div>
                      <button className="edit-profile-dropdown-toggle" onClick={() => setShowLanguagesDropdown(!showLanguagesDropdown)}>
                        <img src={dropdownIcon} alt="Dropdown"></img>
                      </button>
                      {showLanguagesDropdown && (
                        <div className="edit-profile-dropdown-menu" style={{ position: "absolute", top: "100%", right: 0, backgroundColor: "white", border: "1px solid #E8EDF3", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: "300px", overflowY: "auto", zIndex: 1000, minWidth: "200px", marginTop: "8px" }}>
                          {["Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "English", "Spanish"].map((language) => (
                            <div
                              key={language}
                              onClick={() => {
                                toggleLanguage(language);
                              }}
                              style={{
                                padding: "10px 16px",
                                cursor: "pointer",
                                backgroundColor: languages.includes(language) ? "#F0F4F8" : "white",
                                borderBottom: "1px solid #E8EDF3"
                              }}
                              onMouseEnter={(e) => {
                                if (!languages.includes(language)) {
                                  e.target.style.backgroundColor = "#F9FBFE";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!languages.includes(language)) {
                                  e.target.style.backgroundColor = "white";
                                }
                              }}
                            >
                              {language}
                              {languages.includes(language) && (
                                <span style={{ marginLeft: "8px", color: "#EA650A" }}>✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {fieldErrors.preferredLanguage && (
                    <div className="field-error-message" style={{ marginTop: "8px", fontSize: "12px", color: "#dc2626" }}>
                      {fieldErrors.preferredLanguage}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="edit-profile-field-inline">
                    <label>Industry <span className="required">*</span></label>
                    <select
                      value={industry || ""}
                      onChange={(e) => {
                        setIndustry(e.target.value);
                        setCompany(""); // Clear company when industry changes
                        if (fieldErrors.industry) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.industry;
                            return newErrors;
                          });
                        }
                      }}
                      disabled={loadingIndustries}
                      className={fieldErrors.industry ? "input-error" : ""}
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
                  {fieldErrors.industry && (
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626", paddingLeft: "20px" }}>
                      {fieldErrors.industry}
                    </div>
                  )}
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
