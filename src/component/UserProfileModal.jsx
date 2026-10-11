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
  const [positionName, setPositionName] = useState("");
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
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/user/profile/${userId}`, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          if (response.status === 401 && token) {
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
          if (profile.industry && !/^[0-9a-fA-F]{24}$/.test(String(profile.industry).trim())) {
            setIndustryName(profile.industry);
          }
          if (profile.position && !/^[0-9a-fA-F]{24}$/.test(String(profile.position).trim())) {
            setPositionName(profile.position);
          }
          if (profile.company && !/^[0-9a-fA-F]{24}$/.test(String(profile.company).trim())) {
            setCompanyName(profile.company);
          }
          const displayName = profile.isBusinessProfile ? (profile.businessName || profile.fullName) : profile.fullName;
          if (displayName) {
            document.title = `${displayName} | Connect.in`;
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
      if (!profileData || profileData.isPrivate) return;

      const bgElement = document.querySelector('.user-profile-bg');
      const overlayElement = document.querySelector('.user-profile-overlay');
      if (bgElement) {
        const coverImg = profileData.isBusinessProfile ? profileData.businessCoverImage : profileData.coverImage;
        if (coverImg) {
          const resolvedCover = resolveImageUrl(coverImg);
          const img = new Image();
          img.src = resolvedCover;
          img.onload = () => {
            bgElement.style.backgroundImage = `url(${resolvedCover})`;
            bgElement.style.backgroundSize = 'cover';
            bgElement.style.backgroundPosition = 'center';
            if (overlayElement) {
              overlayElement.style.display = 'none';
            }
          };
          img.onerror = () => {
            bgElement.style.backgroundImage = '';
            bgElement.style.backgroundSize = '';
            bgElement.style.backgroundPosition = '';
            if (overlayElement) {
              overlayElement.style.display = '';
            }
          };
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
        const listHeaders = {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };

        if (profileData.city && !cityName) {
          if (typeof profileData.city === 'object' && profileData.city.name) {
            setCityName(profileData.city.name);
          } else if (profileData.city && typeof profileData.city === 'string') {
            const citiesResponse = await fetch(`${API_BASE_URL}/api/list/city`, {
              method: "GET",
              headers: listHeaders,
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
          if (!/^[0-9a-fA-F]{24}$/.test(String(profileData.industry).trim())) {
            setIndustryName(profileData.industry);
          } else {
            const industriesResponse = await fetch(`${API_BASE_URL}/api/list/industries`, {
              method: "GET",
              headers: listHeaders,
            });
            if (industriesResponse.ok) {
              const industriesResult = await industriesResponse.json();
              if (industriesResult.success && industriesResult.data && industriesResult.data.industries) {
                const industry = industriesResult.data.industries.find(ind => ind._id === profileData.industry);
                if (industry) {
                  setIndustryName(industry.name);
                }
              }
            }
          }
        }

        if (profileData.company && profileData.industry) {
          const companiesResponse = await fetch(`${API_BASE_URL}/api/list/companies?industryId=${profileData.industry}`, {
            method: "GET",
            headers: listHeaders,
          });
          if (companiesResponse.ok) {
            const companiesResult = await companiesResponse.json();
            if (companiesResult.success && companiesResult.data && companiesResult.data.companies) {
              const company = companiesResult.data.companies.find(c => c._id === profileData.company);
              if (company) {
                setCompanyName(company.name);
              } else if (!/^[0-9a-fA-F]{24}$/.test(String(profileData.company))) {
                setCompanyName(profileData.company);
              }
            }
          } else if (!/^[0-9a-fA-F]{24}$/.test(String(profileData.company))) {
            setCompanyName(profileData.company);
          }
        } else if (profileData.company && !/^[0-9a-fA-F]{24}$/.test(String(profileData.company))) {
          setCompanyName(profileData.company);
        }

        if (profileData.position) {
          if (!/^[0-9a-fA-F]{24}$/.test(String(profileData.position).trim())) {
            setPositionName(profileData.position);
          } else {
            const positionsResponse = await fetch(`${API_BASE_URL}/api/list/positions`, {
              method: "GET",
              headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                "Content-Type": "application/json",
              },
            });
            if (positionsResponse.ok) {
              const positionsResult = await positionsResponse.json();
              if (positionsResult.success && positionsResult.data && positionsResult.data.positions) {
                const pos = positionsResult.data.positions.find(p => p._id === profileData.position);
                if (pos) {
                  setPositionName(pos.name);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching industry/companies/positions:", err);
        if (profileData.industry && !/^[0-9a-fA-F]{24}$/.test(String(profileData.industry))) {
          setIndustryName(prev => prev || profileData.industry);
        }
        if (profileData.company && !/^[0-9a-fA-F]{24}$/.test(String(profileData.company))) {
          setCompanyName(prev => prev || profileData.company);
        }
        if (profileData.position && !/^[0-9a-fA-F]{24}$/.test(String(profileData.position))) {
          setPositionName(prev => prev || profileData.position);
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
        toast.info("Please sign up or log in to connect with members");
        navigate("/Register");
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
        toast.info("Please sign up or log in to like profiles");
        navigate("/Register");
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
        toast.info("Please sign up or log in to message members");
        navigate("/Register");
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

  if (profileData.isPrivate) {
    const isBusiness = profileData.isBusinessProfile === true;
    const displayName = isBusiness ? (profileData.businessName || profileData.fullName || "Member") : (profileData.fullName || "Member");
    const defaultAvatar = getAvatar(profileData.gender, 25);
    const displayLogo = isBusiness ? (resolveImageUrl(profileData.businessLogo) || defaultAvatar) : (resolveImageUrl(profileData.profileImage) || defaultAvatar);

    return (
      <div style={{ maxWidth: "560px", margin: "40px auto", padding: "40px 24px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", textAlign: "center", position: "relative" }}>
        <button
          onClick={handleClose}
          style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}
          title="Close"
        >
          <img src={closeIcon} alt="Close" style={{ width: "16px", height: "16px" }} />
        </button>

        <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 20px" }}>
          <img
            src={displayLogo}
            alt={displayName}
            style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "3px solid #F3F4F6", filter: "blur(0.5px)" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          <div style={{ position: "absolute", bottom: "0", right: "0", width: "32px", height: "32px", background: "#EA650A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 2px 8px rgba(234, 101, 10, 0.4)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>{displayName}</h2>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FEF3C7", color: "#92400E", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", marginBottom: "16px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          This Profile is Private
        </div>

        <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.6", maxWidth: "420px", margin: "0 auto 24px" }}>
          This user has chosen to keep their profile private. Profile details, activities, and contact information are not accessible to the public.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/Login")}
            style={{
              padding: "10px 24px",
              background: "#EA650A",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(234, 101, 10, 0.25)"
            }}
          >
            Log In to View
          </button>
          <button
            onClick={() => navigate("/Register")}
            style={{
              padding: "10px 24px",
              background: "#fff",
              color: "#EA650A",
              border: "1.5px solid #EA650A",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Create an Account
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate("/directory")}
            style={{
              background: "none",
              border: "none",
              color: "#6B7280",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Explore Member Directory
          </button>
        </div>
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
  const isVerifiedBusiness = isBusiness && (profileData.verified === true || profileData.businessApprovalStatus === 'approved');

  return (
    <div>
      <div className="user-profile-top-section">
        <div className="user-profile-avatar-section">
          <img
            src={displayLogo}
            alt={displayName}
            className="user-profile-avatar"
            onClick={() => setIsImagePopupOpen(true)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
            style={{ cursor: 'pointer', objectFit: isBusiness ? 'contain' : 'cover', backgroundColor: isBusiness ? '#fff' : 'transparent', border: isBusiness ? '1px solid #e5e7eb' : 'none' }}
          />
          <div className="user-profile-name-location">
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {displayName}
              {isVerifiedBusiness && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981" title="Verified">
                  <path d="M12 2l2.4 2.4 3.4-.6.8 3.3 3 1.7-1.2 3.2 1.2 3.2-3 1.7-.8 3.3-3.4-.6L12 22l-2.4-2.4-3.4.6-.8-3.3-3-1.7 1.2-3.2-1.2-3.2 3-1.7.8-3.3 3.4.6z" />
                  <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              )}
            </h2>
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
                {(positionName || (profileData.position && !/^[0-9a-fA-F]{24}$/.test(String(profileData.position).trim()))) && (
                  <div className="user-profile-detail-item">
                    <label>Position</label>
                    <p>{positionName || profileData.position}</p>
                  </div>
                )}
                {(industryName || (profileData.industry && !/^[0-9a-fA-F]{24}$/.test(String(profileData.industry).trim()))) && (
                  <div className="user-profile-detail-item">
                    <label>Industry</label>
                    <p>{industryName || profileData.industry}</p>
                  </div>
                )}
                <div className="user-profile-detail-item">
                  <label>Company</label>
                  <p>{companyName && !/^[0-9a-fA-F]{24}$/.test(String(companyName).trim()) ? companyName : "NA"}</p>
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
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
              style={{ objectFit: isBusiness ? 'contain' : 'cover', backgroundColor: isBusiness ? '#fff' : 'transparent' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
