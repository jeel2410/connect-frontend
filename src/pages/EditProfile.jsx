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
import { getCookie, setCookie, logout } from "../utils/auth";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          
          // Populate form with current profile data
          setData({
            fullName: profile.fullName || "",
            phoneNumber: profile.phoneNumber || "",
            email: profile.email || "",
            birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
            city: profile.city || "",
            gender: profile.gender || "",
            religion: profile.religion || "",
            status: profile.status || "",
            preferredLanguage: profile.preferredLanguage || "",
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

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError("");
      
      const token = getCookie("authToken");
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/user/account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete account. Please try again.");
      }

      if (result.success) {
        // Logout and redirect to login page
        logout();
      } else {
        throw new Error(result.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
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
                  <div className="edit-profile-tags-row">
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
                    <button className="edit-profile-dropdown-toggle">
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </button>
                  </div>
                </div>
              </div>
              <div className="edit-profile-section">
                <div className="edit-profile-tags-container">
                  <div className="edit-profile-label">Habits</div>
                  <div className="edit-profile-tags-row">
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
                    <button className="edit-profile-dropdown-toggle">
                      <img src={dropdownIcon} alt="Dropdown"></img>
                    </button>
                  </div>
                </div>
              </div>

              {skills.length > 0 && (
                <div className="edit-profile-section">
                  <div className="edit-profile-tags-container">
                    <div className="edit-profile-label">Skills</div>
                    <div className="edit-profile-tags-row">
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
                      <button className="edit-profile-dropdown-toggle">
                        <img src={dropdownIcon} alt="Dropdown"></img>
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                disabled={saving || deleting}
              >
                Cancel
              </button>
              <button 
                className="edit-profile-save-btn"
                onClick={handleSave}
                disabled={saving || deleting}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Delete Account Section */}
            <div className="delete-account-section" style={{margin:20}}>
              <h3 className="delete-account-title">Danger Zone</h3>
              <p className="delete-account-description">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button 
                className="delete-account-btn"
                onClick={() => setShowDeleteModal(true)}
                disabled={saving || deleting}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="delete-modal-title">Delete Account</h2>
            <p className="delete-modal-message">
              Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data, connections, and messages.
            </p>
            <div className="delete-modal-actions">
              <button 
                className="delete-modal-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="delete-modal-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer></Footer>
    </>
  );
}
