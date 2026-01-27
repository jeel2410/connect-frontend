import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Sidebar from "../component/Sidebar";
import searchIcon from "../../src/assets/image/serachIcon.png";
import outlineHeart from "../../src/assets/image/outline_icon.png"
import blackHeart from "../../src/assets/image/black_icon.png"
import heartIcon from "../../src/assets/image/favourite_Icon.png";
import profile1 from "../../src/assets/image/profile/profile1.png"
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Likes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("myFavorite");
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [whoLikedMe, setWhoLikedMe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWhoLikedMe, setLoadingWhoLikedMe] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

      // Build query parameters
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
        // Handle different possible response structures
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
        // Handle different possible response structures
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

  // Fetch liked profiles on component mount, when search changes, or when tab changes
  useEffect(() => {
    if (activeTab === "myFavorite") {
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchLikedProfiles(searchQuery);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    } else if (activeTab === "likes") {
      // Fetch who liked me when "Likes" tab is active
      fetchWhoLikedMe();
    }
  }, [searchQuery, activeTab, fetchLikedProfiles, fetchWhoLikedMe]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <Sidebar />
        <div className="likes-page-wrapper">
          <div className="likes-page-card">
            <div className="likes-page-header">
              <h1>Likes</h1>
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
            <div className="likes-page-tabs">
              <button
                className={`likes-page-tab ${activeTab === "myFavorite" ? "active" : ""}`}
                onClick={() => setActiveTab("myFavorite")}
              >
                <img src={blackHeart} alt="My Favorite"></img> My Favorite
              </button>
              <button
                className={`likes-page-tab ${activeTab === "likes" ? "active" : ""}`}
                onClick={() => setActiveTab("likes")}
              >
                 <img src={outlineHeart} alt="Likes"></img>  Likes
              </button>
            </div>
            {activeTab === "myFavorite" && (
              <>
                {loading && likedProfiles.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Loading profiles...
                  </div>
                ) : likedProfiles.length === 0 ? (
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
                    {likedProfiles.map((user) => (
                      <div key={user._id || user.id} className="like-card">
                        <button
                          className="heart-btn-container"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Optionally handle unlike functionality here
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
                            src={user.profileImage || user.image || profile1}
                            alt={user.fullName || user.name || "User"}
                            className="like-avatar"
                          />
                          <div className="like-info">
                            <h3>{user.fullName || user.name || "Unknown"}</h3>
                            <p>{user.city || user.address || "Location not available"}</p>
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
                {loadingWhoLikedMe && whoLikedMe.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Loading profiles...
                  </div>
                ) : whoLikedMe.length === 0 ? (
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
                    {whoLikedMe.map((user) => (
                      <div key={user._id || user.id} className="like-card">
                        <button
                          className="heart-btn-container"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Optionally handle like back functionality here
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
                            src={user.profileImage || user.image || profile1}
                            alt={user.fullName || user.name || "User"}
                            className="like-avatar"
                          />
                          <div className="like-info">
                            <h3>{user.fullName || user.name || "Unknown"}</h3>
                            <p>{user.city || user.address || "Location not available"}</p>
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