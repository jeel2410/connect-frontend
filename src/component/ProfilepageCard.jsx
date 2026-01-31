import React, { useState, useEffect } from "react";
import mobileIcon from "../../src/assets/image/mobile.png"
import emailIcon from "../../src/assets/image/email.png"
import calenderIcon from "../../src/assets/image/calender.png"
import cityIcon from "../../src/assets/image/city.png"
import ProfilecardHeader from "./ProfilecardHeader";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Not provided";
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default function ProfilepageCard({ profileData }) {
  // All hooks must be called before any conditional returns
  const [industryName, setIndustryName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cityName, setCityName] = useState("");

  // Fetch industry, company, and city names
  useEffect(() => {
    if (!profileData) return;

    const fetchIndustryAndCompanies = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) return;

        // Fetch city name
        if (profileData.city) {
          // If city is an object with name, use it
          if (typeof profileData.city === 'object' && profileData.city.name) {
            setCityName(profileData.city.name);
          } else if (profileData.cityName) {
            setCityName(profileData.cityName);
          } else if (typeof profileData.city === 'string') {
            // Fetch city name from API
            const citiesResponse = await fetch(`${API_BASE_URL}/api/list/city`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (citiesResponse.ok) {
              const citiesResult = await citiesResponse.json();
              if (citiesResult.success && citiesResult.data && citiesResult.data.city) {
                const city = citiesResult.data.city.find(c => c._id === profileData.city);
                if (city) setCityName(city.name);
              }
            }
          }
        }

        // Fetch industry name
        if (profileData.industry) {
          const industriesResponse = await fetch(`${API_BASE_URL}/api/list/industries`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (industriesResponse.ok) {
            const industriesResult = await industriesResponse.json();
            if (industriesResult.success && industriesResult.data && industriesResult.data.industries) {
              const industry = industriesResult.data.industries.find(ind => ind._id === profileData.industry);
              if (industry) setIndustryName(industry.name);
            }
          }
        }

        // Fetch company name
        if (profileData.company) {
          const companiesResponse = await fetch(`${API_BASE_URL}/api/list/companies`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (companiesResponse.ok) {
            const companiesResult = await companiesResponse.json();
            if (companiesResult.success && companiesResult.data && companiesResult.data.companies) {
              const company = companiesResult.data.companies.find(c => c._id === profileData.company);
              if (company) setCompanyName(company.name);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching industry/companies:", err);
      }
    };

    fetchIndustryAndCompanies();
  }, [profileData?.industry, profileData?.company, profileData?.city]);

  // Early return after hooks
  if (!profileData) {
    return (
      <div className="dating-profile-main">
        <div className="dating-profile-card">
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No profile data available
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(profileData.dateOfBirth);
  const interests = profileData.interests || [];
  const habits = profileData.habits || [];

  return (
      <div className="dating-profile-main">
        <div className="dating-profile-card">
         <ProfilecardHeader 
           showChangePassword={true}
           profileData={profileData}
         ></ProfilecardHeader>

          {/* Contact Info Row */}
          <div className="dating-profile-contact-row">
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={mobileIcon} alt="Mobile"></img>
              </span>
              <div>
                <label>Mobile Number</label>
                <p>{profileData.phoneNumber || "Not provided"}</p>
              </div>
            </div>
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={emailIcon} alt="Email"></img>
              </span>
              <div>
                <label>Email ID</label>
                <p>{profileData.email || "Not provided"}</p>
              </div>
            </div>
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={calenderIcon} alt="Calendar"></img>
              </span>
              <div>
                <label>Date of Birth</label>
                <p>{formatDate(profileData.dateOfBirth)}</p>
              </div>
            </div>
            <div className="dating-profile-contact-item">
              <span className="dating-profile-contact-icon">
                <img src={cityIcon} alt="City"></img>
              </span>
              <div>
                <label>Location</label>
                <p>{cityName || profileData.cityName || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div className="dating-profile-section">
            <h3>More Information</h3>

            {interests.length > 0 && (
              <div className="dating-profile-info-group">
                <label>Interest</label>
                <div className="dating-profile-tags">
                  {interests.map((interest, index) => (
                    <span key={index} className="dating-profile-tag">{interest}</span>
                  ))}
                </div>
              </div>
            )}

            {habits.length > 0 && (
              <div className="dating-profile-info-group">
                <label>Habits</label>
                <div className="dating-profile-tags">
                  {habits.map((habit, index) => (
                    <span key={index} className="dating-profile-tag">{habit}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="dating-profile-info-grid">
              {age && (
                <div className="dating-profile-info-item">
                  <label>Age</label>
                  <p>{age}</p>
                </div>
              )}
              <div className="dating-profile-info-item">
                <label>Gender</label>
                <p>{profileData.gender || "Not provided"}</p>
              </div>
              <div className="dating-profile-info-item">
                <label>Religion</label>
                <p>{profileData.religion || "Not provided"}</p>
              </div>
              <div className="dating-profile-info-item">
                <label>Status</label>
                <p>{profileData.status || "Not provided"}</p>
              </div>
            </div>

            {profileData.preferredLanguage && (
              <div className="dating-profile-info-group">
                <label>Preferred Language</label>
                <div className="dating-profile-tags">
                  <span className="dating-profile-tag">{profileData.preferredLanguage}</span>
                </div>
              </div>
            )}

            {profileData.skills && profileData.skills.length > 0 && (
              <div className="dating-profile-info-group">
                <label>Skills</label>
                <div className="dating-profile-tags">
                  {profileData.skills.map((skill, index) => (
                    <span key={index} className="dating-profile-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {industryName && (
              <div className="dating-profile-info-group">
                <label>Industry</label>
                <div className="dating-profile-tags">
                  <span className="dating-profile-tag">{industryName}</span>
                </div>
              </div>
            )}

            {companyName && (
              <div className="dating-profile-info-group">
                <label>Company</label>
                <div className="dating-profile-tags">
                  <span className="dating-profile-tag">{companyName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

  );
}
