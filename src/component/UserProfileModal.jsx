import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAvatar, resolveImageUrl } from "../utils/avatarHelper"
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
  const [cityName, setCityName] = useState("");
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

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

        if (data.success && data.data) {
          const profile = data.data.profile || data.data;
          setProfileData(profile);
          setIsLiked(profile.isLiked || profile.likedByMe || false);
          setIsConnected(profile.isConnected || profile.alreadyConnect || false);
          setHasPendingRequest(profile.hasSentRequest || profile.sendRequest || false);
          if (profile.cityName) {
            setCityName(profile.cityName);
          }
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

  useEffect(() => {
    const fetchIndustryAndCompanies = async () => {
      if (!profileData) return;

      const bgElement = document.querySelector('.user-profile-bg');
      const overlayElement = document.querySelector('.user-profile-overlay');
      if (bgElement) {
        const coverImg = profileData.isBusinessProfile ? profileData.businessCoverImage : profileData.coverImage;
        if (coverImg) {
          bgElement.style.backgroundImage = `url(${resolveImageUrl(coverImg)})`;
          bgElement.style.backgroundSize = 'cover';
          bgElement.style.backgroundPosition = 'center';
          if (overlayElement) {
            overlayElement.style.display = 'none';
          }
        } else {
          bgElement.style.backgroundImage = '';
          bgElement.style.backgroundSize = '';
          bgElement.style.backgroundPosition = '';
          if (overlayElement) {
            overlayElement.style.display = '';
          }
        }
      }

      try {
        const token = getCookie("authToken");
        if (!token) return;

        if (profileData.city && !cityName) {
          if (typeof profileData.city === 'object' && profileData.city.name) {
            setCityName(profileData.city.name);
          } else if (profileData.city && typeof profileData.city === 'string') {
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
                if (city) {
                  setCityName(city.name);
                } else {
                  setCityName(profileData.city);
                }
              }
            }
          }
        }

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
              if (industry) {
                setIndustryName(industry.name);
              } else {
                setIndustryName(profileData.industry);
              }
            }
          }
        }

        if (profileData.company && profileData.industry) {
          const companiesResponse = await fetch(`${API_BASE_URL}/api/list/companies?industryId=${profileData.industry}`, {
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
              if (company) {
                setCompanyName(company.name);
              } else {
                setCompanyName(profileData.company);
              }
            }
          } else {
            setCompanyName(profileData.company);
          }
        } else if (profileData.company) {
          setCompanyName(profileData.company);
        }
      } catch (err) {
        console.error("Error fetching industry/companies:", err);
        if (profileData.industry) {
          setIndustryName(prev => prev || profileData.industry);
        }
        if (profileData.company) {
          setCompanyName(prev => prev || profileData.company);
        }
      }
    };

    fetchIndustryAndCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData, cityName]);

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
        if (data.data?.isConnected) {
          const name = profileData?.businessName || profileData?.fullName || "the profile";
          toast.success(`You are now connected to ${name}`);
        } else {
          toast.success("Connection request sent successfully!");
        }
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
      toast.error(error.message || "Failed to send connection request");
    } finally {
      setSendingConnect(false);
    }
  };

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
        throw new Error(data.message || "Failed to remove connection");
      }
    } catch (error) {
      console.error("Error removing connection:", error);
      setError(error.message || "Failed to remove connection");
    } finally {
      setSendingConnect(false);
    }
  };

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
        setIsLiked(!isLiked);
        if (isLiked) {
          toast.success("Profile unliked successfully");
        } else {
          toast.success("Profile liked successfully!");
        }
      } else {
        throw new Error(data.message || `Failed to ${isLiked ? 'unlike' : 'like'} user`);
      }
    } catch (error) {
      console.error(`Error ${isLiked ? 'unliking' : 'liking'} user:`, error);
      setError(error.message || `Failed to ${isLiked ? 'unlike' : 'like'} user`);
      toast.error(error.message || `Failed to ${isLiked ? 'unlike' : 'like'} user`);
    } finally {
      setSendingLike(false);
    }
  };

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

      navigate("/chat", {
        state: {
          userId: userId,
          chatHistory: data.data || data
        }
      });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      navigate("/chat", {
        state: {
          userId: userId
        }
      });
    }
  };

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

  const isBusiness = profileData.isBusinessProfile === true;
  const age = isBusiness ? null : calculateAge(profileData.dateOfBirth);
  const interests = isBusiness ? [] : (profileData.interests || []);
  const habits = isBusiness ? [] : (profileData.habits || []);
  const skills = isBusiness ? [] : (profileData.skills || []);

  const businessPlaceholderLogo = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop";
  const defaultAvatar = isBusiness ? businessPlaceholderLogo : getAvatar(profileData.gender, age || profileData.dateOfBirth);

  const displayLogo = isBusiness ? (resolveImageUrl(profileData.businessLogo) || businessPlaceholderLogo) : (resolveImageUrl(profileData.profileImage) || defaultAvatar);
  const displayName = isBusiness ? profileData.businessName : (profileData.fullName || "User");
  const displayTagline = isBusiness ? profileData.businessTagline : null;

  return (
    <div>
      <div className="user-profile-top-section">
        <div className="user-profile-avatar-section">
          <img
            src={displayLogo}
            alt={displayName}
            className="user-profile-avatar"
            onClick={() => setIsImagePopupOpen(true)}
            style={{ cursor: 'pointer', objectFit: isBusiness ? 'contain' : 'cover', backgroundColor: isBusiness ? '#fff' : 'transparent', border: isBusiness ? '1px solid #e5e7eb' : 'none' }}
          />
          <div className="user-profile-name-location">
            <h2>{displayName}</h2>
            {displayTagline && (
              <p style={{ fontStyle: "italic", fontSize: "14px", color: "#6b7280", margin: "4px 0" }}>{displayTagline}</p>
            )}
            <p>
              {cityName || profileData.cityName
                ? `${cityName || profileData.cityName}${profileData.pincode ? ` - ${profileData.pincode}` : ""}`
                : "Not provided"}
            </p>
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
            title={isLiked ? 'Unlike this' : 'Like this'}
            style={{ opacity: sendingLike ? 0.6 : 1 }}
          >
            <img src={isLiked ? heartfillIcon : heartOutlineIcon} alt={isLiked ? "Unlike" : "Like"}></img>
          </button>
          {!isConnected && (
            <button
              className="user-profile-social-btn blackc-btn"
              onClick={handleConnect}
              disabled={sendingConnect || hasPendingRequest}
              title={
                hasPendingRequest
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
                alt={hasPendingRequest ? "Pending" : "Connect"}
              ></img>
            </button>
          )}
          {isConnected && (
            <>
              <button
                className="user-profile-social-btn message-btn"
                onClick={handleMessage}
                title="Send message"
              >
                <img src={messageIcon} alt="Message"></img>
              </button>
              <button
                className="user-profile-social-btn remove-connection-btn"
                onClick={handleRemoveConnection}
                disabled={sendingConnect}
                title="Remove connection"
                style={{ opacity: sendingConnect ? 0.6 : 1 }}
              >
                <img
                  src={blackcIcon}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "50%",
                    padding: "5px",
                    transform: "rotate(45deg)"
                  }}
                  alt="Remove Connection"
                />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="user-profile-card">
        <div className="user-profile-card-content">
          {isBusiness ? (
            <>
              {profileData.businessDescription && (
                <div className="user-profile-detail-section" style={{ marginBottom: "24px" }}>
                  <h3 className="user-profile-section-title">About the Business</h3>
                  <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    {profileData.businessDescription}
                  </p>
                </div>
              )}

              <div className="user-profile-details-grid">
                <div className="user-profile-detail-item">
                  <label>Business Category</label>
                  <p>{profileData.businessCategoryName || "Not provided"}</p>
                </div>
                <div className="user-profile-detail-item">
                  <label>Contact Person</label>
                  <p>{profileData.contactPerson || "Not provided"}</p>
                </div>
                {profileData.website && (
                  <div className="user-profile-detail-item">
                    <label>Website</label>
                    <p>
                      <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#EA650A", textDecoration: "underline", fontWeight: "600" }}>
                        {profileData.website}
                      </a>
                    </p>
                  </div>
                )}
                {profileData.facebook && (
                  <div className="user-profile-detail-item">
                    <label>Facebook</label>
                    <p><a href={profileData.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "#EA650A", fontWeight: "600" }}>View Profile</a></p>
                  </div>
                )}
                {profileData.instagram && (
                  <div className="user-profile-detail-item">
                    <label>Instagram</label>
                    <p><a href={profileData.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "#EA650A", fontWeight: "600" }}>View Profile</a></p>
                  </div>
                )}
                {profileData.linkedIn && (
                  <div className="user-profile-detail-item">
                    <label>LinkedIn</label>
                    <p><a href={profileData.linkedIn} target="_blank" rel="noopener noreferrer" style={{ color: "#EA650A", fontWeight: "600" }}>View Profile</a></p>
                  </div>
                )}
                {profileData.youtube && (
                  <div className="user-profile-detail-item">
                    <label>YouTube</label>
                    <p><a href={profileData.youtube} target="_blank" rel="noopener noreferrer" style={{ color: "#EA650A", fontWeight: "600" }}>View Channel</a></p>
                  </div>
                )}
                {profileData.twitter && (
                  <div className="user-profile-detail-item">
                    <label>Twitter</label>
                    <p><a href={profileData.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "#EA650A", fontWeight: "600" }}>View Profile</a></p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
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
              {skills.length > 0 && (
                <div className="user-profile-detail-section">
                  <h3 className="user-profile-section-title">Skills</h3>
                  <div className="user-profile-pill-group">
                    {skills.map((skill, index) => (
                      <span key={index} className="user-profile-pill">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="user-profile-details-grid">
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
                  <p>
                    {Array.isArray(profileData.preferredLanguage)
                      ? profileData.preferredLanguage.join(", ") || "Not provided"
                      : profileData.preferredLanguage
                        ? profileData.preferredLanguage.split(",").map(l => l.trim()).join(", ")
                        : "Not provided"}
                  </p>
                </div>
                {profileData.position && (
                  <div className="user-profile-detail-item">
                    <label>Position</label>
                    <p>{profileData.position}</p>
                  </div>
                )}
                {industryName && (
                  <div className="user-profile-detail-item">
                    <label>Industry</label>
                    <p>{industryName}</p>
                  </div>
                )}
                <div className="user-profile-detail-item">
                  <label>Company</label>
                  <p>{companyName || "NA"}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isImagePopupOpen && (
        <div className="image-popup-overlay" onClick={() => setIsImagePopupOpen(false)}>
          <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-popup-close-btn"
              onClick={() => setIsImagePopupOpen(false)}
              title="Close"
            >
              <img src={closeIcon} alt="Close" />
            </button>
            <img
              src={displayLogo}
              alt={displayName}
              className="image-popup-img"
              style={{ objectFit: isBusiness ? 'contain' : 'cover', backgroundColor: isBusiness ? '#fff' : 'transparent' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
