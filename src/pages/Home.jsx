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
import searchIcon from "../../src/assets/image/serachIcon.png";

export default function Home() {
  const navigate = useNavigate();
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [likedProfiles, setLikedProfiles] = useState(new Set());
  const [connectedProfiles, setConnectedProfiles] = useState(new Set());
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [popupOffer, setPopupOffer] = useState(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
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
    industry: null,
    sports: null
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

      // Check if any filters are applied or search is active
      const hasFilters = filters.ageMin !== null || filters.ageMax !== null ||
        filters.language !== null || (filters.habits && filters.habits.length > 0) ||
        (filters.interests && filters.interests.length > 0) || filters.relationship !== null ||
        filters.religion !== null || filters.company !== null ||
        filters.industry !== null || (filters.sports && filters.sports.length > 0) ||
        (filters.gender !== null && filters.gender !== "Any") ||
        (isSearchActive && searchQuery.trim() !== "");

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
      if (filters.habits && Array.isArray(filters.habits) && filters.habits.length > 0) {
        queryParams.append("habits", filters.habits.join(","));
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
      if (filters.sports && Array.isArray(filters.sports) && filters.sports.length > 0) {
        queryParams.append("sports", filters.sports.join(","));
      }

      // Add search parameter if search is active
      if (isSearchActive && searchQuery.trim() !== "") {
        queryParams.append("search", searchQuery.trim());
        // When searching, don't apply city filter - search across all cities
        // This is handled by not passing userCityId to the backend when search is active
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
        // Handle different possible response structsetFeedDataures
        const feed = Array.isArray(feedData.data) ? feedData.data : (feedData.data.profiles || feedData.data.feed || []);
        setFeedData(feed);

        // Pre-populate liked / connected sets from API flags so button states
        // are correct immediately on page load / reload.
        const newLiked = new Set(
          feed.filter(p => p.isLiked).map(p => String(p._id || p.id))
        );
        const newConnected = new Set(
          feed.filter(p => p.isConnected).map(p => String(p._id || p.id))
        );
        setLikedProfiles(newLiked);
        setConnectedProfiles(newConnected);
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

      const isCurrentlyLiked = likedProfiles.has(String(likedUserId));
      const method = isCurrentlyLiked ? "DELETE" : "POST";

      // Toggle like/unlike API (same behavior as UserProfileModal)
      const likeResponse = await fetch(`${API_BASE_URL}/api/connection/like/${likedUserId}`, {
        method,
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
        throw new Error(errorData.message || `Failed to ${isCurrentlyLiked ? "unlike" : "like"} user`);
      }

      const likeData = await likeResponse.json();

      if (likeData.success) {
        setLikedProfiles(prev => {
          const updated = new Set(prev);
          if (isCurrentlyLiked) {
            updated.delete(String(likedUserId));
          } else {
            updated.add(String(likedUserId));
          }
          return updated;
        });
        toast.success(isCurrentlyLiked ? "Profile unliked successfully" : "Profile liked successfully!");
      } else {
        throw new Error(likeData.message || `Failed to ${isCurrentlyLiked ? "unlike" : "like"} user`);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(error.message || "Failed to update like");
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
        // Mark profile as connected without removing it from feed
        setConnectedProfiles(prev => new Set([...prev, String(receiverId)]));
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
  }, [filters, isSearchActive, searchQuery]); // Re-fetch when filters or search change

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim() === "") {
      if (isSearchActive) {
        setIsSearchActive(false);
        // Clear search and refetch
        setFilters(prev => ({ ...prev }));
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsSearchActive(true);
      // Trigger fetch by updating filters
      setFilters(prev => ({ ...prev }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleApplyFilters = (appliedFilters) => {
    // Convert ageRange to ageMin and ageMax
    const newFilters = {
      ageMin: appliedFilters.ageRange ? appliedFilters.ageRange[0] : null,
      ageMax: appliedFilters.ageRange ? appliedFilters.ageRange[1] : null,
      gender: appliedFilters.gender && appliedFilters.gender !== "Any" ? appliedFilters.gender : null,
      language: appliedFilters.language || null,
      habits: appliedFilters.habits && appliedFilters.habits.length > 0 ? appliedFilters.habits : null,
      interests: appliedFilters.interests && appliedFilters.interests.length > 0 ? appliedFilters.interests : null,
      relationship: appliedFilters.relationship || null,
      religion: appliedFilters.religion || null,
      company: appliedFilters.company || null,
      industry: appliedFilters.industry || null,
      sports: appliedFilters.sports && appliedFilters.sports.length > 0 ? appliedFilters.sports : null
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
      industry: null,
      sports: null
    });
    setIsFilterOpen(false);
  };

  useEffect(() => {
    const checkPopupOffer = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/list/popup-offer`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.showPopup && result.data.offer) {
            setPopupOffer(result.data.offer);
            setShowOfferPopup(true);
          }
        }
      } catch (err) {
        console.error("Error checking popup offer:", err);
      }
    };

    checkPopupOffer();
  }, []);

  const handlePopupCheckNow = async (cardId) => {
    try {
      const token = getCookie("authToken");
      await fetch(`${API_BASE_URL}/api/list/cards/${cardId}/click`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.error("Error tracking popup click:", err);
    }
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

      {/* second section */}
      <div className="profile-container">
        <div className="sec-header">
          <div className="sec-header-left">

            <h1 className="title">
              Profiles <span className="title-highlight">Near You</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "nowrap", justifyContent: "flex-end", minWidth: 0 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", flex: "0 1 280px", width: "100%", maxWidth: "280px", minWidth: 0 }}>
              <img
                src={searchIcon}
                alt="search"
                style={{
                  position: "absolute",
                  left: "12px",
                  width: "18px",
                  height: "18px",
                  zIndex: 1,
                  pointerEvents: "none"
                }}
              />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (value.trim() !== "") {
                    setIsSearchActive(true);
                  } else {
                    setIsSearchActive(false);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") {
                    setIsSearchActive(true);
                    // Trigger search by updating filters dependency
                    setFilters(prev => ({ ...prev }));
                  }
                }}
                onBlur={() => {
                  // Trigger search when user leaves the input field
                  if (searchQuery.trim() !== "") {
                    setIsSearchActive(true);
                    setFilters(prev => ({ ...prev }));
                  }
                }}
                style={{
                  padding: "10px 20px 10px 40px",
                  border: "1px solid #EA650A",
                  borderRadius: "8px",
                  fontSize: "14px",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  outline: "none",
                  backgroundColor: "#fff"
                }}
              />
              {isSearchActive && searchQuery.trim() !== "" && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchActive(false);
                    setFilters(prev => ({ ...prev }));
                  }}
                  style={{
                    position: "absolute",
                    right: "8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#999",
                    padding: "0",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <button
              className="filter-btn"
              onClick={() => setIsFilterOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                flexShrink: 0,
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
        <Usercard
          feedData={feedData}
          loading={loadingFeed}
          onLike={handleLike}
          onConnect={handleConnect}
          onSkip={handleSkip}
          likedProfiles={likedProfiles}
          connectedProfiles={connectedProfiles}
        ></Usercard>
      </div>




      <Footer></Footer>

      {/* Daily Offer Popup */}
      {showOfferPopup && popupOffer && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          backdropFilter: "blur(5px)"
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "450px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            padding: "24px",
            position: "relative",
            animation: "slideUp 0.3s ease-out",
            overflow: "hidden"
          }}>
            <button 
              onClick={() => setShowOfferPopup(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(0,0,0,0.05)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#666",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(0,0,0,0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(0,0,0,0.05)"}
            >
              <X size={18} />
            </button>

            {popupOffer.offer_image ? (
              <div style={{
                width: "100%",
                height: "200px",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "16px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img 
                  src={popupOffer.offer_image} 
                  alt={popupOffer.name} 
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </div>
            ) : popupOffer.logo_image ? (
              <div style={{
                width: "100%",
                height: "150px",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "16px",
                backgroundColor: "#fff8f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ffe0d0"
              }}>
                <img 
                  src={popupOffer.logo_image} 
                  alt={popupOffer.name} 
                  style={{
                    maxWidth: "120px",
                    maxHeight: "120px",
                    objectFit: "contain"
                  }}
                />
              </div>
            ) : null}

            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#333",
              margin: "0 0 8px 0",
              textAlign: "center"
            }}>{popupOffer.name}</h3>

            {popupOffer.description && (
              <p style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 16px 0",
                textAlign: "center",
                lineHeight: "1.4"
              }}>{popupOffer.description}</p>
            )}

            {popupOffer.features && popupOffer.features.length > 0 && (
              <div style={{
                backgroundColor: "#f9f9f9",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
                maxHeight: "150px",
                overflowY: "auto"
              }}>
                <h4 style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#ea650a",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: "0 0 8px 0"
                }}>Key Features</h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "13px",
                  color: "#444",
                  lineHeight: "1.6"
                }}>
                  {popupOffer.features.map((feature, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px"
            }}>
              <button
                onClick={() => setShowOfferPopup(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  color: "#666",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#fff"}
              >
                Dismiss
              </button>
              
              <a
                href={popupOffer.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handlePopupCheckNow(popupOffer._id);
                  setShowOfferPopup(false);
                }}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#ea650a",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(234, 101, 10, 0.25)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#d35400";
                  e.target.style.boxShadow = "0 6px 16px rgba(234, 101, 10, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#ea650a";
                  e.target.style.boxShadow = "0 4px 12px rgba(234, 101, 10, 0.25)";
                }}
              >
                Check Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
