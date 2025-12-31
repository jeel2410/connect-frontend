import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle } from "lucide-react";
import Header from "../component/Header";
import heroImage from "../../src/assets/image/hero_man.png";
import "../../src/styles/style.css";
import avtar1 from "../../src/assets/image/review/review_avatar1.png";
import avtar2 from "../../src/assets/image/review/review_avatar2.png";
import avtar3 from "../../src/assets/image/review/review_avatar3.png";
import avtar4 from "../../src/assets/image/review/review_avatar4.png";
import avtar5 from "../../src/assets/image/review/review_avatar5.png";
import floatchart from "../../src/assets/image/floatChart.png";
import homebg from "../../src/assets/image/home_bg.png";
import htmlIcom from "../../src/assets/image/language/html.png";
import cssIcon from "../../src/assets/image/language/css.png";
import jqueryIcon from "../../src/assets/image/language/jquery.png";
import angularIcon from "../../src/assets/image/language/angular.png";
import reactIcon from "../../src/assets/image/language/react.png";
import bootstrapIcon from "../../src/assets/image/language/bootstrap.png";
import Footer from "../component/Footer";
import { useNavigate } from "react-router-dom";
import Usercard from "../component/Usercard";
import { getCookie, setCookie, getUserProfile } from "../utils/auth";
import API_BASE_URL from "../utils/config";

export default function Home() {
  const navigate = useNavigate();
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  
  const technologies = [
    { icon: htmlIcom },
    { icon: cssIcon },
    { icon: jqueryIcon },
    { icon: bootstrapIcon },
    { icon: angularIcon },
    { icon: reactIcon },
  ];

  // Fetch user profile data and then feed data when component mounts
  useEffect(() => {
    const fetchUserProfileAndFeed = async () => {
      try {
        // Check if user is authenticated
        const token = getCookie("authToken");
        if (!token) {
          return; // User not authenticated, skip API call
        }

        // First, fetch user profile
        const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) {
          // If unauthorized, user might need to login again
          if (profileResponse.status === 401) {
            console.error("Unauthorized: Please login again");
            return;
          }
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();

        // Check if response is successful and has profile data
        let userProfile = null;
        if (profileData.success && profileData.data && profileData.data.profile) {
          const profile = profileData.data.profile;
          
          // Save entire profile data to cookie as JSON
          setCookie("userProfile", JSON.stringify(profile), 7);
          userProfile = profile;
          
          // Optionally save individual fields for easier access
          if (profile.fullName) {
            setCookie("userFullName", profile.fullName, 7);
          }
          if (profile.email) {
            setCookie("userEmail", profile.email, 7);
          }
          if (profile.profileImage) {
            setCookie("userProfileImage", profile.profileImage, 7);
          }
          if (profile.phoneNumber) {
            setCookie("userPhoneNumber", profile.phoneNumber, 7);
          }
          
          // Store currentLocation if available
          if (profile.currentLocation && profile.currentLocation.coordinates) {
            const coordinates = profile.currentLocation.coordinates;
            // Only store if coordinates are valid (not [0, 0])
            if (coordinates.length >= 2 && (coordinates[0] !== 0 || coordinates[1] !== 0)) {
              setCookie("userCurrentLocation", JSON.stringify({
                longitude: coordinates[0],
                latitude: coordinates[1]
              }), 7);
            }
          }
        }

        // Now fetch feed data if profile is available
        if (!userProfile || !userProfile.gender) {
          console.warn("User profile or gender not found, skipping feed fetch");
          return;
        }

        // Determine opposite gender
        const userGender = userProfile.gender;
        const oppositeGender = userGender === "Male" ? "Female" : userGender === "Female" ? "Male" : null;
        
        if (!oppositeGender) {
          console.warn("Unable to determine opposite gender");
          return;
        }

        setLoadingFeed(true);

        // Get location coordinates - prioritize stored location from profile
        let latitude = null;
        let longitude = null;

        // First, check if user profile has currentLocation stored
        if (userProfile.currentLocation && userProfile.currentLocation.coordinates) {
          const coordinates = userProfile.currentLocation.coordinates;
          // Check if coordinates are valid (not [0, 0])
          if (coordinates.length >= 2 && (coordinates[0] !== 0 || coordinates[1] !== 0)) {
            // Note: coordinates array is typically [longitude, latitude] in GeoJSON format
            longitude = coordinates[0];
            latitude = coordinates[1];
            console.log("Using stored location from profile:", { latitude, longitude });
          }
        }

        // If no stored location, request browser geolocation
        if (latitude === null || longitude === null) {
          if (navigator.geolocation) {
            try {
              const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                });
              });

              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              console.log("Using browser geolocation:", { latitude, longitude });
            } catch (error) {
              console.log("Location permission denied or error:", error);
              // Continue without location - will only pass gender
            }
          }
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append("gender", oppositeGender);
        queryParams.append("page", "1");
        queryParams.append("limit", "10");
        
        if (latitude !== null && longitude !== null) {
          queryParams.append("latitude", latitude.toString());
          queryParams.append("longitude", longitude.toString());
        }

        // Call the feed API
        const feedResponse = await fetch(`${API_BASE_URL}/api/feed/web?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!feedResponse.ok) {
          if (feedResponse.status === 401) {
            console.error("Unauthorized: Please login again");
            return;
          }
          throw new Error("Failed to fetch feed data");
        }

        const feedData = await feedResponse.json();

        // Check if response is successful and has feed data
        if (feedData.success && feedData.data) {
          // Handle different possible response structures
          const feed = Array.isArray(feedData.data) ? feedData.data : (feedData.data.profiles || feedData.data.feed || []);
          setFeedData(feed);
        }
      } catch (error) {
        console.error("Error fetching user profile or feed data:", error);
        // Silently fail - don't disrupt user experience
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchUserProfileAndFeed();
  }, []); // Empty dependency array - run only once on mount

  return (
    <div>
      <Header></Header>
      {/* First section */}
      <div className="hero-container">
        <div className="deco-circle deco-circle-1"></div>
        <div className="deco-circle deco-circle-2"></div>
        <div className="deco-dot deco-dot-1"></div>
        <div className="deco-dot deco-dot-2"></div>
        <div className="deco-dot deco-dot-3"></div>

        <div className="hero-content">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-left">
              <div className="hero-badge">
                <span>Etiam Eget Mattis</span>
              </div>

              <h1 className="hero-title">
                Easy to <span className="text-orange">Hire</span>
                <br></br>
                <span className="text-weight">
                  Talented Developers & Professional Agencies
                </span>
              </h1>

              <p className="hero-description">
                Easy to Hire and user friendly Platform. Loremipssume is simply
                dummy text of the printing and typesetting industry lorem ipsum
                has been the industry's standard dummy text.
              </p>

              <div className="search-box">
                <div className="search-row">
                  <div className="search-field">
                    <label className="search-label">Job Name</label>
                    <input
                      type="text"
                      placeholder="Search"
                      className="search-input"
                    />
                  </div>

                  <div className="search-field">
                    <label className="search-label">Job Type</label>
                    <div className="search-select-wrapper">
                      <select className="search-select">
                        <option value="">Select Job Type</option>
                        <option value="software-developer">Software Developer</option>
                        <option value="designer">Designer</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                      </select>
                    </div>
                  </div>

                  <div className="search-button-wrapper">
                    <button
                      className="search-button"
                      onClick={() => navigate("/search")}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image & Stats */}
            <div className="hero-right">
              {/* Professional Image */}
              <div className="hero-image-container">
                <img
                  src={heroImage}
                  alt="Professional"
                  className="hero-image"
                />
              </div>

              {/* Floating Review Card */}
              <div className="review-card">
                <div className="review-content">
                  <div className="avatar-stack">
                    <img src={avtar1} className="avatar"></img>
                    <img src={avtar2} className="avatar"></img>
                    <img src={avtar3} className="avatar"></img>
                    <img src={avtar4} className="avatar"></img>
                    <img src={avtar5} className="avatar"></img>
                  </div>
                  <div className="review-text">
                    <div className="rating">
                      <span className="rating-value">4.9</span>
                      <span className="review-count">(370 review)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stats-card">
                {/* <div className="stats-number">50K+</div>
                <div className="stats-chart">
                  <div className="bar bar-1"></div>
                  <div className="bar bar-2"></div>
                  <div className="bar bar-3"></div>
                  <div className="bar bar-4"></div>
                </div>
                <p className="stats-text">People got hired</p> */}
                <img src={floatchart}></img>
              </div>

              {/* Decorative elements */}
              <div className="hero-deco hero-deco-1"></div>
              <div className="hero-deco hero-deco-2"></div>
            </div>
          </div>
        </div>
      </div>
      {/* second section */}
      <div className="profile-container">
        <div className="sec-header">
          <div className="sec-header-left">
            <div className="byerul-badge">
              <span className="byerul-text">Byerul Nedsori</span>
            </div>
            <h1 className="title">
              Latest <span className="title-highlight">Profile</span>
            </h1>
          </div>
          <button className="view-more-btn" onClick={() => navigate("/search")}>View More</button>
        </div>
        <Usercard feedData={feedData} loading={loadingFeed}></Usercard>
      </div>

      {/* third section */}
      <div className="tech-platform-container">
        <div className="content-wrapper">
          <div className="image-section">
            <img
              src={homebg}
              alt="Person working on laptop"
              className="main-image"
            />
          </div>
          <div className="text-section">
            <span className="badge-text">Donec Kuctus</span>

            <h1 className="main-title">
              <span className="highlight-number">60+</span> Technologies
              <br />
              Registered Our Platform
            </h1>

            <p className="description">
              Phasellus in massa nec ipsum ultricies elementum. Sed a
              condimentum ipsum. Donec euismod blandit dignissim. Fusce leo
              quam, vestibulum nec lorem curabitur laoreet non nulla a
              porttitor. Maecenas tempus lorem vel leo mattis, at convallis quam
              vulputate. Nulla facilisi. Ut at rhoncus lectus. Phasellus
              fermentum metus non leo congue varius. Sed vel facilisis sem. Nam
              pharetra erat in dolor fermentum.
            </p>
            <div className="tech-icons">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className="tech-icon"
                >
                  <img src={tech.icon} alt={`Tech ${index + 1}`}></img>
                </div>
              ))}
            </div>
          </div>
        </div>

      
        <div className="decorative-dots top-dots"></div>
      </div>
   

      <Footer></Footer>
    </div>
  );
}
