import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
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
import FilterModal from "../component/FilterModal";
import filterIcon from "../../src/assets/image/filter.png";

export default function Home() {
  const navigate = useNavigate();
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    ageMin: null,
    ageMax: null,
    gender: null,
    language: null,
    habits: null,
    interests: null,
    relationship: null,
    religion: null,
    company: null,
    industry: null
  });
  
  const technologies = [
    { icon: htmlIcom },
    { icon: cssIcon },
    { icon: jqueryIcon },
    { icon: bootstrapIcon },
    { icon: angularIcon },
    { icon: reactIcon },
  ];

  // Function to fetch feed data (extracted for reuse after like)
  const fetchFeedData = async () => {
    try {
      // Check if user is authenticated
      const token = getCookie("authToken");
      if (!token) {
        return; // User not authenticated, skip API call
      }

      // Get user profile from cookie
      const userProfileJson = getCookie("userProfile");
      let userProfile = null;
      if (userProfileJson) {
        try {
          userProfile = JSON.parse(userProfileJson);
        } catch (error) {
          console.error("Error parsing user profile:", error);
        }
      }

      // If no profile in cookie, fetch it
      if (!userProfile) {
        const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            console.error("Unauthorized: Please login again");
            return;
          }
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();
        if (profileData.success && profileData.data && profileData.data.profile) {
          const profile = profileData.data.profile;
          setCookie("userProfile", JSON.stringify(profile), 7);
          userProfile = profile;
        }
      }

      // Now fetch feed data if profile is available
      if (!userProfile || !userProfile.gender) {
        console.warn("User profile or gender not found, skipping feed fetch");
        return;
      }

      // Determine gender - use filter if set
      let genderFilter = filters.gender;
      if (genderFilter === "Any") {
        genderFilter = null; // Show all genders
      }

      setLoadingFeed(true);

      // Check if any filters are applied
      const hasFilters = filters.ageMin !== null || filters.ageMax !== null || 
                        filters.language !== null || filters.habits !== null || 
                        filters.interests !== null || filters.relationship !== null ||
                        filters.religion !== null || filters.company !== null ||
                        filters.industry !== null ||
                        (filters.gender !== null && filters.gender !== "Any");

      // Get location coordinates only if no filters are applied
      let latitude = null;
      let longitude = null;

      if (!hasFilters) {
        // First, check if user profile has currentLocation stored
        if (userProfile.currentLocation && userProfile.currentLocation.coordinates) {
          const coordinates = userProfile.currentLocation.coordinates;
          // Check if coordinates are valid (not [0, 0])
          if (coordinates.length >= 2 && (coordinates[0] !== 0 || coordinates[1] !== 0)) {
            // Note: coordinates array is typically [longitude, latitude] in GeoJSON format
            longitude = coordinates[0];
            latitude = coordinates[1];
          }
        }
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", "1");
      queryParams.append("limit", "5000");
      
      // Add gender filter if it's set and not "Any"
      if (genderFilter && genderFilter !== "Any" && genderFilter !== "any") {
        queryParams.append("gender", genderFilter);
      }
      
      // Only add location if no filters are applied
      if (!hasFilters && latitude !== null && longitude !== null) {
        // queryParams.append("latitude", latitude.toString());
        // queryParams.append("longitude", longitude.toString());
      }

      // Add filter parameters if they exist
      if (filters.ageMin !== null && filters.ageMin !== undefined) {
        queryParams.append("ageMin", filters.ageMin.toString());
      }
      if (filters.ageMax !== null && filters.ageMax !== undefined) {
        queryParams.append("ageMax", filters.ageMax.toString());
      }
      if (filters.language) {
        queryParams.append("language", filters.language);
      }
      if (filters.habits) {
        queryParams.append("habits", filters.habits);
      }
      if (filters.relationship) {
        queryParams.append("relationship", filters.relationship);
      }
      if (filters.company) {
        queryParams.append("company", filters.company);
      }
      if (filters.industry) {
        queryParams.append("industry", filters.industry);
      }
      if (filters.interests && Array.isArray(filters.interests) && filters.interests.length > 0) {
        queryParams.append("interests", filters.interests.join(","));
      }
      if (filters.religion) {
        queryParams.append("religion", filters.religion);
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
      console.error("Error fetching feed data:", error);
      // Silently fail - don't disrupt user experience
    } finally {
      setLoadingFeed(false);
    }
  };

  // Handle like action
  const handleLike = async (likedUserId) => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Call the like API
      const likeResponse = await fetch(`${API_BASE_URL}/api/connection/like/${likedUserId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!likeResponse.ok) {
        if (likeResponse.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        const errorData = await likeResponse.json();
        throw new Error(errorData.message || "Failed to like user");
      }

      const likeData = await likeResponse.json();
      
      if (likeData.success) {
        // Show success toast notification
        toast.success("Profile liked successfully!");
        // Refetch all feeds after successful like
        await fetchFeedData();
      } else {
        throw new Error(likeData.message || "Failed to like user");
      }
    } catch (error) {
      console.error("Error liking user:", error);
      toast.error(error.message || "Failed to like user");
    }
  };

  // Handle connect/connection request action
  const handleConnect = async (receiverId) => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Call the connection request API
      const connectResponse = await fetch(`${API_BASE_URL}/api/connection/connectionrequest/${receiverId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!connectResponse.ok) {
        if (connectResponse.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        const errorData = await connectResponse.json();
        throw new Error(errorData.message || "Failed to send connection request");
      }

      const connectData = await connectResponse.json();
      
      if (connectData.success) {
        // Show success toast notification
        toast.success("Connection request sent successfully!");
        // Refetch all feeds after successful connection request
        await fetchFeedData();
      } else {
        throw new Error(connectData.message || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error(error.message || "Failed to send connection request");
    }
  };

  // Handle skip action - call API and remove profile from list
  const handleSkip = async (skippedUserId) => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Call the skip API
      const skipResponse = await fetch(`${API_BASE_URL}/api/connection/skip/${skippedUserId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!skipResponse.ok) {
        if (skipResponse.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        const errorData = await skipResponse.json();
        throw new Error(errorData.message || "Failed to skip user");
      }

      const skipData = await skipResponse.json();
      
      if (skipData.success) {
        // Remove the skipped profile from the list
        const newFeedData = feedData.filter(profile => 
          (profile._id || profile.id) !== skippedUserId
        );
        setFeedData(newFeedData);
      } else {
        throw new Error(skipData.message || "Failed to skip user");
      }
    } catch (error) {
      console.error("Error skipping user:", error);
      // Optionally show error message to user
    }
  };

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

        // Now fetch feed data
        await fetchFeedData();
      } catch (error) {
        console.error("Error fetching user profile or feed data:", error);
        // Silently fail - don't disrupt user experience
      }
    };

    fetchUserProfileAndFeed();
  }, [filters]); // Re-fetch when filters change

  const handleApplyFilters = (appliedFilters) => {
    // Convert ageRange to ageMin and ageMax
    const newFilters = {
      ageMin: appliedFilters.ageRange ? appliedFilters.ageRange[0] : null,
      ageMax: appliedFilters.ageRange ? appliedFilters.ageRange[1] : null,
      gender: appliedFilters.gender && appliedFilters.gender !== "Any" ? appliedFilters.gender : null,
      language: appliedFilters.language || null,
      habits: appliedFilters.habits || null,
      interests: appliedFilters.interests && appliedFilters.interests.length > 0 ? appliedFilters.interests : null,
      relationship: appliedFilters.relationship || null,
      religion: appliedFilters.religion || null,
      company: appliedFilters.company || null,
      industry: appliedFilters.industry || null
    };
    
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      ageMin: null,
      ageMax: null,
      gender: null,
      language: null,
      habits: null,
      interests: null,
      relationship: null,
      religion: null,
      company: null,
      industry: null
    });
    setIsFilterOpen(false);
  };

  return (
    <div>
      <Header></Header>
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
      {/* First section */}
      {/* <div className="hero-container">
        <div className="deco-circle deco-circle-1"></div>
        <div className="deco-circle deco-circle-2"></div>
        <div className="deco-dot deco-dot-1"></div>
        <div className="deco-dot deco-dot-2"></div>
        <div className="deco-dot deco-dot-3"></div>

        <div className="hero-content">
          <div className="hero-grid">
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

            
            <div className="hero-right">
              <div className="hero-image-container">
                <img
                  src={heroImage}
                  alt="Professional"
                  className="hero-image"
                />
              </div>
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
              
                <img src={floatchart}></img>
              </div>

              <div className="hero-deco hero-deco-1"></div>
              <div className="hero-deco hero-deco-2"></div>
            </div>
          </div>
        </div>
      </div> */}
      {/* second section */}
      <div className="profile-container">
        <div className="sec-header">
          <div className="sec-header-left">
            {/* <div className="byerul-badge">
              <span className="byerul-text">Byerul Nedsori</span>
            </div> */}
            <h1 className="title">
              Latest <span className="title-highlight">Profile</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              className="filter-btn"
              onClick={() => setIsFilterOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#fff",
                border: "1px solid #EA650A",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#EA650A"
              }}
            >
              <img src={filterIcon} alt="filter" className="filter-icon" style={{ width: "18px", height: "18px" }} />
              Filter
            </button>
            {/* <button className="view-more-btn" onClick={() => navigate("/search")}>View More</button> */}
          </div>
        </div>
        <Usercard feedData={feedData} loading={loadingFeed} onLike={handleLike} onConnect={handleConnect} onSkip={handleSkip}></Usercard>
      </div>

      {/* third section */}
      {/* <div className="tech-platform-container">
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
      </div> */}
   

      <Footer></Footer>
    </div>
  );
}
