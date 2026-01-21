import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userProfile from "../assets/image/userProfile.png"
import closeIcon from "../assets/image/close.png"
import heartfillIcon from "../assets/image/fill_heart.png"
import heartOutlineIcon from "../assets/image/outline_icon.png"
import blackcIcon from "../assets/image/black_c.png"
import messageIcon from "../assets/image/message.png"
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

export default function UserProfileModal({ userId }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingConnect, setSendingConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [sendingLike, setSendingLike] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [industryName, setIndustryName] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        const token = getCookie("authToken");
        if (!token) {
          setError("Please login to view profile");
          setLoading(false);
          return;
        }

        // Call the API to get user profile by ID
        const response = await fetch(`${API_BASE_URL}/api/user/profile/${userId}`, {
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

        const data = await response.json();

        // Check if response is successful and has profile data
        if (data.success && data.data) {
          // Handle different possible response structures
          const profile = data.data.profile || data.data;
          setProfileData(profile);
          // Set isLiked status from the profile response
          setIsLiked(profile.isLiked || profile.likedByMe || false);
          // Set connection status - simple: connected or not
          setIsConnected(profile.isConnected || profile.alreadyConnect || false);
          // Check if there's a pending request
          setHasPendingRequest(profile.hasSentRequest || profile.sendRequest || false);
        } else {
          setError("Profile data not found");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message || "Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch industry and company names when profileData is loaded
  useEffect(() => {
    const fetchIndustryAndCompanies = async () => {
      if (!profileData) return;

      try {
        const token = getCookie("authToken");
        if (!token) return;

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
  }, [profileData?.industry, profileData?.company]);

  // Handle connect - send connection request
  const handleConnect = async () => {
    if (!userId || sendingConnect || isConnected || hasPendingRequest) {
      return;
    }

    try {
      setSendingConnect(true);
      const token = getCookie("authToken");
      if (!token) {
        setError("Please login to connect");
        return;
      }

      // Call the connection request API
      const response = await fetch(`${API_BASE_URL}/api/connection/connectionrequest/${userId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized: Please login again");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to connect");
      }

      const data = await response.json();
      
      if (data.success) {
        // After sending request, check if it was auto-accepted or refresh profile
        // For now, just refresh the profile to get updated status
        const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data) {
            const profile = profileData.data.profile || profileData.data;
            setIsConnected(profile.isConnected || profile.alreadyConnect || false);
            setHasPendingRequest(profile.hasSentRequest || profile.sendRequest || false);
          }
        }
      } else {
        throw new Error(data.message || "Failed to connect");
      }
    } catch (error) {
      console.error("Error connecting:", error);
      setError(error.message || "Failed to connect");
    } finally {
      setSendingConnect(false);
    }
  };

  // Handle remove connection
  const handleRemoveConnection = async () => {
    if (!userId || sendingConnect || !isConnected) {
      return;
    }

    try {
      setSendingConnect(true);
      const token = getCookie("authToken");
      if (!token) {
        setError("Please login to remove connection");
        return;
      }

      // Call the remove connection API
      const response = await fetch(`${API_BASE_URL}/api/connection/connection/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized: Please login again");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove connection");
      }

      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
      } else {
        throw new Error(data.message || "Failed to remove connection");
      }
    } catch (error) {
      console.error("Error removing connection:", error);
      setError(error.message || "Failed to remove connection");
    } finally {
      setSendingConnect(false);
    }
  };

  // Handle like/unlike user (toggle)
  const handleLike = async () => {
    if (!userId || sendingLike) {
      return;
    }

    try {
      setSendingLike(true);
      const token = getCookie("authToken");
      if (!token) {
        setError("Please login to like user");
        return;
      }

      // If already liked, call DELETE to unlike, otherwise call POST to like
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(`${API_BASE_URL}/api/connection/like/${userId}`, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized: Please login again");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isLiked ? 'unlike' : 'like'} user`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Toggle the like status
        setIsLiked(!isLiked);
      } else {
        throw new Error(data.message || `Failed to ${isLiked ? 'unlike' : 'like'} user`);
      }
    } catch (error) {
      console.error(`Error ${isLiked ? 'unliking' : 'liking'} user:`, error);
      setError(error.message || `Failed to ${isLiked ? 'unlike' : 'like'} user`);
    } finally {
      setSendingLike(false);
    }
  };

  // Handle message click - navigate to chat
  const handleMessage = async () => {
    if (!userId) {
      return;
    }

    try {
      const token = getCookie("authToken");
      if (!token) {
        setError("Please login to send messages");
        return;
      }

      // Call the chat history API
      const response = await fetch(`${API_BASE_URL}/api/chat/history/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized: Please login again");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch chat history");
      }

      const data = await response.json();
      
      // Navigate to chat page with userId and chat history data
      navigate("/chat", {
        state: {
          userId: userId,
          chatHistory: data.data || data
        }
      });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // Still navigate to chat page even if API fails
      navigate("/chat", {
        state: {
          userId: userId
        }
      });
    }
  };

  // Handle close button - navigate back
  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#DC2626" }}>
        <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
        No profile data available
      </div>
    );
  }

  const age = calculateAge(profileData.dateOfBirth);
  const interests = profileData.interests || [];
  const habits = profileData.habits || [];

  return (
    <div>
      <div className="user-profile-top-section">
        <div className="user-profile-avatar-section">
          <img
            src={profileData.profileImage || userProfile}
            alt={profileData.fullName || "Profile"}
            className="user-profile-avatar"
          />
          <div className="user-profile-name-location">
            <h2>{profileData.fullName || "User"}</h2>
            <p>{profileData.city || "Not provided"}</p>
          </div>
        </div>
        <div className="user-profile-social-btns">
          <button 
            className="user-profile-social-btn close-btn"
            onClick={handleClose}
            title="Close"
          >
            <img src={closeIcon} alt="Close"></img>
          </button>
          <button 
            className="user-profile-social-btn heartfill-btn"
            onClick={handleLike}
            disabled={sendingLike}
            title={isLiked ? 'Unlike this user' : 'Like this user'}
            style={{ opacity: sendingLike ? 0.6 : 1 }}
          >
            <img src={isLiked ? heartfillIcon : heartOutlineIcon} alt={isLiked ? "Unlike" : "Like"}></img>
          </button>
          <button 
            className="user-profile-social-btn blackc-btn"
            onClick={isConnected ? handleRemoveConnection : handleConnect}
            disabled={sendingConnect || hasPendingRequest}
            title={
              isConnected 
                ? 'Remove connection' 
                : hasPendingRequest 
                ? 'Connection request pending' 
                : 'Connect'
            }
          >
            <img
              src={blackcIcon}
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "5px",
                opacity: (sendingConnect || hasPendingRequest) ? 0.6 : 1
              }}
              alt={isConnected ? "Disconnect" : hasPendingRequest ? "Pending" : "Connect"}
            ></img>
          </button>
          <button 
            className="user-profile-social-btn message-btn"
            onClick={handleMessage}
            title="Send message"
          >
            <img src={messageIcon} alt="Message"></img>
          </button>
        </div>
      </div>
      <div className="user-profile-card">
        <div className="user-profile-card-content">
          {interests.length > 0 && (
            <div className="user-profile-detail-section">
              <h3 className="user-profile-section-title">Interest</h3>
              <div className="user-profile-pill-group">
                {interests.map((interest, index) => (
                  <span key={index} className="user-profile-pill">{interest}</span>
                ))}
              </div>
            </div>
          )}
          {habits.length > 0 && (
            <div className="user-profile-detail-section">
              <h3 className="user-profile-section-title">Habits</h3>
              <div className="user-profile-pill-group">
                {habits.map((habit, index) => (
                  <span key={index} className="user-profile-pill">{habit}</span>
                ))}
              </div>
            </div>
          )}
          <div className="user-profile-details-grid">
            {/* <div className="user-profile-detail-item">
              <label>Mobile Number</label>
              <p>{profileData.phoneNumber || "Not provided"}</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Email ID</label>
              <p>{profileData.email || "Not provided"}</p>
            </div> */}
            {age && (
              <div className="user-profile-detail-item">
                <label>Age</label>
                <p>{age}</p>
              </div>
            )}
            <div className="user-profile-detail-item">
              <label>Gender</label>
              <p>{profileData.gender || "Not provided"}</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Date of Birth</label>
              <p>{formatDate(profileData.dateOfBirth)}</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Religion</label>
              <p>{profileData.religion || "Not provided"}</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Status</label>
              <p>{profileData.status || "Not provided"}</p>
            </div>
            <div className="user-profile-detail-item">
              <label>Languages</label>
              <p>{profileData.preferredLanguage || "Not provided"}</p>
            </div>
            {industryName && (
              <div className="user-profile-detail-item">
                <label>Industry</label>
                <p>{industryName}</p>
              </div>
            )}
          </div>

          {companyName && (
            <div className="user-profile-detail-item">
              <label>Company</label>
              <p>{companyName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
