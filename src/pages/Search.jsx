import React, { useState, useEffect } from "react";

import "../../src/styles/style.css";
import Header from "../component/Header"
import filterIcon from "../../src/assets/image/filter.png"
import Usercard from "../component/Usercard";
import leftarrow from "../../src/assets/image/leftarrow (1).png"
import rightarrow from "../../src/assets/image/rightarrow.png"
import FilterModal from "../component/FilterModal";
import Footer from "../component/Footer";
import { getCookie, getUserProfile } from "../utils/auth";
import API_BASE_URL from "../utils/config";


const Search = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [filters, setFilters] = useState({
    ageMin: null,
    ageMax: null,
    gender: null,
    language: null,
    habits: null,
    relationship: null
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Function to fetch feed data (extracted for reuse after like)
  const fetchFeedData = async () => {
      try {
        // Check if user is authenticated
        const token = getCookie("authToken");
        if (!token) {
          return; // User not authenticated, skip API call
        }

        // Get user profile to determine gender
        const userProfile = getUserProfile();
        if (!userProfile || !userProfile.gender) {
          console.warn("User profile or gender not found");
          return;
        }

        // Determine gender - use filter if set, otherwise use opposite gender
        let genderFilter = filters.gender;
        if (!genderFilter || genderFilter === "Any") {
          const userGender = userProfile.gender;
          genderFilter = userGender === "Male" ? "Female" : userGender === "Female" ? "Male" : null;
        }
        
        if (!genderFilter) {
          console.warn("Unable to determine gender");
          return;
        }

        setLoadingFeed(true);

        // Check if any filters are applied
        const hasFilters = filters.ageMin !== null || filters.ageMax !== null || 
                          filters.language !== null || filters.habits !== null || 
                          filters.relationship !== null || 
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
              } catch (error) {
                // Continue without location - will only pass gender
              }
            }
          }
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append("gender", genderFilter);
        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", "20");
        
        // Only add location if no filters are applied
        if (!hasFilters && latitude !== null && longitude !== null) {
          queryParams.append("latitude", latitude.toString());
          queryParams.append("longitude", longitude.toString());
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

        const feedDataResponse = await feedResponse.json();

        // Check if response is successful and has feed data
        if (feedDataResponse.success && feedDataResponse.data) {
          const profiles = feedDataResponse.data.profiles || [];
          const paginationData = feedDataResponse.data.pagination || {};
          
          setFeedData(profiles);
          setPagination({
            currentPage: paginationData.currentPage || currentPage,
            limit: paginationData.limit || 20,
            totalCount: paginationData.totalCount || 0,
            totalPages: paginationData.totalPages || 1,
            hasNextPage: paginationData.hasNextPage || false,
            hasPrevPage: paginationData.hasPrevPage || false
          });
        }
      } catch (error) {
        console.error("Error fetching feed data:", error);
        // Silently fail - don't disrupt user experience
      } finally {
        setLoadingFeed(false);
      }
  };

  // Fetch feed data with pagination
  useEffect(() => {
    fetchFeedData();
  }, [currentPage, filters]); // Re-fetch when page or filters change

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
        // Refetch all feeds after successful like
        await fetchFeedData();
      } else {
        throw new Error(likeData.message || "Failed to like user");
      }
    } catch (error) {
      console.error("Error liking user:", error);
      // Optionally show error message to user
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
        // Refetch all feeds after successful connection request
        await fetchFeedData();
      } else {
        throw new Error(connectData.message || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      // Optionally show error message to user
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
        // Refetch feed data after successful skip
        await fetchFeedData();
      } else {
        throw new Error(skipData.message || "Failed to skip user");
      }
    } catch (error) {
      console.error("Error skipping user:", error);
      // Optionally show error message to user
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApplyFilters = (appliedFilters) => {
    // Convert ageRange to ageMin and ageMax
    const newFilters = {
      ageMin: appliedFilters.ageRange ? appliedFilters.ageRange[0] : null,
      ageMax: appliedFilters.ageRange ? appliedFilters.ageRange[1] : null,
      gender: appliedFilters.gender && appliedFilters.gender !== "Any" ? appliedFilters.gender : null,
      language: appliedFilters.language || null,
      habits: appliedFilters.habits || null,
      relationship: appliedFilters.relationship || null
    };
    
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters are applied
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      ageMin: null,
      ageMax: null,
      gender: null,
      language: null,
      habits: null,
      relationship: null
    });
    setCurrentPage(1); // Reset to first page when filters are cleared
    setIsFilterOpen(false);
  };

  return (
    <>
    <Header></Header>
      <div className="app-container">
        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        <header className="header-search">
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
                    <select className="search-select">
                      <option>Software Developer</option>
                      <option>Designer</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>

                  <div className="search-button-wrapper">
                    <button className="search-button">
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
        </header>

        <main className="main-content">
          <div className="content-header">
            <h1 className="page-title">
              <span className="highlight">{pagination.totalCount}</span> User Available Now
            </h1>
            <button
              className="filter-btn"
              onClick={() => setIsFilterOpen(true)}
            >
               <img src={filterIcon} alt="filter" className="filter-icon" />
              Filter
            </button>
          </div>
          <Usercard feedData={feedData} loading={loadingFeed} onLike={handleLike} onConnect={handleConnect} onSkip={handleSkip}></Usercard>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-arrow"
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage}
              >
               <img src={leftarrow} alt="Previous page"></img>
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-number ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-arrow"
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
              >
               <img src={rightarrow} alt="Next page"></img>
              </button>
            </div>
          )}
        </main>
      </div>
    <Footer></Footer>
    </>
  );
};

export default Search;
