import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Sidebar from "../component/Sidebar";
import searchIcon from "../../src/assets/image/serachIcon.png";
import outlineHeart from "../../src/assets/image/outline_icon.png"
import blackHeart from "../../src/assets/image/black_icon.png"
import heartIcon from "../../src/assets/image/favourite_Icon.png";
import { getAvatar } from "../utils/avatarHelper";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Likes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("myFavorite");
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [whoLikedMe, setWhoLikedMe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWhoLikedMe, setLoadingWhoLikedMe] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBusinesses, setFilterBusinesses] = useState(false);

  // Fetch liked profiles from API
  const fetchLikedProfiles = useCallback(async (search = "") => {
    try {
      setLoading(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (search && search.trim() !== "") {
        queryParams.append("search", search.trim());
      }

      const url = `${API_BASE_URL}/api/connection/likes${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized: Please login again");
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch liked profiles");
      }

      const data = await response.json();

      if (data.success && data.data) {
        const profiles = Array.isArray(data.data)
          ? data.data
          : (data.data.liked || data.data.profiles || data.data.likes || []);

        setLikedProfiles(profiles);
      } else {
        setLikedProfiles([]);
      }
    } catch (error) {
      console.error("Error fetching liked profiles:", error);
      setLikedProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch "who liked me" profiles from API
  const fetchWhoLikedMe = useCallback(async () => {
    try {
      setLoadingWhoLikedMe(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        setLoadingWhoLikedMe(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/connection/who-liked-me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized: Please login again");
          setLoadingWhoLikedMe(false);
          return;
        }
        throw new Error("Failed to fetch who liked me");
      }

      const data = await response.json();

      if (data.success && data.data) {
        const profiles = Array.isArray(data.data)
          ? data.data
          : (data.data.liked || data.data.profiles || data.data.likes || data.data.whoLikedMe || []);

        setWhoLikedMe(profiles);
      } else {
        setWhoLikedMe([]);
      }
    } catch (error) {
      console.error("Error fetching who liked me:", error);
      setWhoLikedMe([]);
    } finally {
      setLoadingWhoLikedMe(false);
    }
  }, []);

  // Handle navigation state from notification click
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch liked profiles on component mount, when search changes, or when tab changes
  useEffect(() => {
    if (activeTab === "myFavorite") {
      const timeoutId = setTimeout(() => {
        fetchLikedProfiles(searchQuery);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (activeTab === "likes") {
      fetchWhoLikedMe();
    }
  }, [searchQuery, activeTab, fetchLikedProfiles, fetchWhoLikedMe]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getProfileImage = (user) => {
    if (user.isBusinessProfile) {
      return user.businessLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop";
    }
    return user.profileImage || user.image || getAvatar(user.gender, user.dateOfBirth || user.age);
  };

  const getProfileName = (user) => {
    if (user.isBusinessProfile) {
      return user.businessName || "Unknown Business";
    }
    return user.fullName || user.name || "Unknown";
  };

  const getProfileSubtitle = (user) => {
    if (user.isBusinessProfile) {
      return user.businessCategoryName || user.businessCategory || "Business";
    }
    return user.city || user.address || "Location not available";
  };

  const displayedLikedProfiles = filterBusinesses
    ? likedProfiles.filter(p => p.isBusinessProfile === true)
    : likedProfiles;

  const displayedWhoLikedMe = filterBusinesses
    ? whoLikedMe.filter(p => p.isBusinessProfile === true)
    : whoLikedMe;

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <div className="likes-page-wrapper">
          <div className="title-div">
            <h1 className="inner-page-title"><span>Profile</span><span className="title-highlight">Likes</span></h1>
          </div>
          <div className="likes-page-card">
            <div className="likes-page-header">
              {activeTab === "myFavorite" && (
                <div className="likes-page-search">
                  <span className="likes-page-search-icon">
                    <img src={searchIcon} alt="search" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search here"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              )}
            </div>
            
            <div className="likes-page-tabs" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className={`likes-page-tab ${activeTab === "likes" ? "active" : ""}`}
                  onClick={() => setActiveTab("likes")}
                >
                  <img src={outlineHeart} alt="Likes"></img>  Liked you
                </button>
                <button
                  className={`likes-page-tab ${activeTab === "myFavorite" ? "active" : ""}`}
                  onClick={() => setActiveTab("myFavorite")}
                >
                  <img src={blackHeart} alt="You Liked"></img> You Liked
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "16px" }}>
                <input
                  type="checkbox"
                  id="filterBusinesses"
                  checked={filterBusinesses}
                  onChange={(e) => setFilterBusinesses(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#EA650A", cursor: "pointer" }}
                />
                <label htmlFor="filterBusinesses" style={{ fontSize: "14px", fontWeight: "600", color: "#4b5563", cursor: "pointer" }}>
                  Filter by Businesses
                </label>
              </div>
            </div>

            {activeTab === "myFavorite" && (
              <>
                {loading && displayedLikedProfiles.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Loading profiles...
                  </div>
                ) : displayedLikedProfiles.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#666"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                      No Liked Profiles Found
                    </div>
                    <div style={{ fontSize: "16px", color: "#999" }}>
                      {searchQuery ? "Try a different search term" : "You haven't liked any profiles yet"}
                    </div>
                  </div>
                ) : (
                  <div className="likes-grid">
                    {displayedLikedProfiles.map((user) => (
                      <div key={user._id || user.id} className="like-card">
                        <button
                          className="heart-btn-container"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <img
                            src={heartIcon}
                            alt="favorite"
                          />
                        </button>
                        <div
                          className="like-profile-content"
                          onClick={() => {
                            const userId = user._id || user.id || user.userId;
                            if (userId) {
                              navigate("/userprofile", { state: { userId } });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={getProfileImage(user)}
                            alt={getProfileName(user)}
                            className="like-avatar"
                            style={{ objectFit: user.isBusinessProfile ? 'contain' : 'cover', backgroundColor: user.isBusinessProfile ? '#fff' : 'transparent' }}
                          />
                          <div className="like-info">
                            <h3>{getProfileName(user)}</h3>
                            <p>{getProfileSubtitle(user)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === "likes" && (
              <>
                {loadingWhoLikedMe && displayedWhoLikedMe.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Loading profiles...
                  </div>
                ) : displayedWhoLikedMe.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#666"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                      No One Liked You Yet
                    </div>
                    <div style={{ fontSize: "16px", color: "#999" }}>
                      Start exploring profiles to get likes!
                    </div>
                  </div>
                ) : (
                  <div className="likes-grid">
                    {displayedWhoLikedMe.map((user) => (
                      <div key={user._id || user.id} className="like-card">
                        <button
                          className="heart-btn-container"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <img
                            src={heartIcon}
                            alt="favorite"
                          />
                        </button>
                        <div
                          className="like-profile-content"
                          onClick={() => {
                            const userId = user._id || user.id || user.userId;
                            if (userId) {
                              navigate("/userprofile", { state: { userId } });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={getProfileImage(user)}
                            alt={getProfileName(user)}
                            className="like-avatar"
                            style={{ objectFit: user.isBusinessProfile ? 'contain' : 'cover', backgroundColor: user.isBusinessProfile ? '#fff' : 'transparent' }}
                          />
                          <div className="like-info">
                            <h3>{getProfileName(user)}</h3>
                            <p>{getProfileSubtitle(user)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Likes;