import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Bell, Menu, User, X, LogOut, LayoutDashboard } from "lucide-react";
import logo from "../assets/image/connect_logo.png"
import locationIcon from "../assets/image/location.png";
import notification from "../assets/image/Notification.png";
import userIcon from "../assets/image/user_icon.png"
import NotificationModal from "./NotificationModal";
import { getCookie, logout, isAdmin, getUserProfile, hasToken } from "../utils/auth";
import API_BASE_URL from "../utils/config";
import "../styles/style.css"

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userCity, setUserCity] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const profileMenuRef = useRef(null);

  const handleProfileClick = () => {
    navigate("/profile");
    setProfileMenuOpen(false);
  };

  const handleAdminClick = () => {
    navigate("/admin");
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNotificationClick = () => {
    setNotificationModalOpen(true);
  };

  const handleProfileMenuToggle = () => {
    // Refresh admin status when opening menu
    if (!profileMenuOpen) {
      setUserIsAdmin(isAdmin());
    }
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleSignOut = () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error("Failed to fetch unread count");
      }

      const data = await response.json();

      if (data.success && data.data !== undefined) {
        // Handle different possible response structures
        const count = typeof data.data === "number"
          ? data.data
          : (data.data.count || data.data.unreadCount || 0);

        setUnreadCount(count);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(hasToken());
    };

    checkLoginStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case of same-tab login/logout
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Check if user is admin and fetch user city
  useEffect(() => {
    if (!isLoggedIn) {
      return; // Don't fetch if user is not logged in
    }

    setUserIsAdmin(isAdmin());

    // Fetch user city from profile
    const fetchUserCity = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) {
          return;
        }

        // Always fetch from API to get the latest city name
        // (Backend returns city as a name string, not ID)
        const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data && profileData.data.profile) {
            const profile = profileData.data.profile;

            // Set user name
            if (profile.fullName) {
              setUserName(profile.fullName);
            } else {
              // Fallback to cookie if fullName not in API response
              const userProfile = getUserProfile();
              if (userProfile && userProfile.fullName) {
                setUserName(userProfile.fullName);
              } else {
                setUserName("User");
              }
            }

            // Keep city logic for potential future use
            const city = profile.city;
            if (city) {
              // Check if city is an ID (ObjectId format) or a name
              // ObjectIds are 24 character hex strings
              const isObjectId = /^[0-9a-fA-F]{24}$/.test(city);
              if (isObjectId) {
                // If it's an ID, try to get from cookie as fallback, or show loading
                const userProfile = getUserProfile();
                if (userProfile && userProfile.city && !/^[0-9a-fA-F]{24}$/.test(userProfile.city)) {
                  setUserCity(userProfile.city);
                } else {
                  setUserCity("Loading...");
                }
              } else {
                // It's a name, use it directly
                setUserCity(city);
              }
            }
          }
        } else {
          // If API fails, try cookie as fallback
          const userProfile = getUserProfile();
          if (userProfile) {
            if (userProfile.fullName) {
              setUserName(userProfile.fullName);
            } else {
              setUserName("User");
            }
            if (userProfile.city) {
              const isObjectId = /^[0-9a-fA-F]{24}$/.test(userProfile.city);
              if (!isObjectId) {
                setUserCity(userProfile.city);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // Fallback to cookie if API fails
        const userProfile = getUserProfile();
        if (userProfile) {
          if (userProfile.fullName) {
            setUserName(userProfile.fullName);
          } else {
            setUserName("User");
          }
          if (userProfile.city) {
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(userProfile.city);
            if (!isObjectId) {
              setUserCity(userProfile.city);
            }
          }
        }
      }
    };

    fetchUserCity();

    // Refresh city when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserCity();
      }
    };

    // Listen for profile update events
    const handleProfileUpdate = () => {
      fetchUserCity();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [isLoggedIn]);

  // Fetch unread count on mount and when notification modal closes
  useEffect(() => {
    if (!isLoggedIn) {
      return; // Don't fetch if user is not logged in
    }
    fetchUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!notificationModalOpen) {
      // Refresh count when modal closes
      fetchUnreadCount();
    }
  }, [notificationModalOpen]);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="Connect Logo"></img>
        </div>

        {/* Desktop Navigation */}
        <div className="header-right">
          <nav className="nav">
            {isLoggedIn ? (
              <>
                <a href="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                  Home
                </a>
                <a href="/connection" className={`nav-link ${location.pathname === "/connection" ? "active" : ""}`}>
                  Connections
                </a>
                <a href="/like" className={`nav-link ${location.pathname === "/like" ? "active" : ""}`}>
                  Likes
                </a>
                <a href="/chat" className={`nav-link ${location.pathname === "/chat" ? "active" : ""}`}>
                  Chat
                </a>
                <a href="/offer" className={`nav-link ${location.pathname === "/offer" ? "active" : ""}`}>
                  Offers
                </a>
              </>
            ) : (
              <>
                <a href="/features" className="nav-link">
                  Features
                </a>
                <a href="/resources" className="nav-link">
                  Resources
                </a>
                <a href="/download-app" className="nav-link">
                  Download App
                </a>
              </>
            )}
          </nav>
          {isLoggedIn && (
            <>
              <div className="location-btn" style={{ cursor: "default" }}>
                {/* <div className="location-round">
                   <img src={locationIcon} alt="Location"></img>
                </div> */}
                <button className="profile-btn">
                  <img src={userIcon} alt="User"></img>
                </button>
                <span>{userName || "Loading..."}</span>
              </div>
              <div className="notification-wrapper">
                <button className="icon-btn notification-btn" onClick={handleNotificationClick}>
                  <img src={notification} alt="Notifications"></img>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                  )}
                </button>
                <NotificationModal
                  isOpen={notificationModalOpen}
                  onClose={() => setNotificationModalOpen(false)}
                  onNotificationRead={fetchUnreadCount}
                />
              </div>
              <div className="profile-wrapper" ref={profileMenuRef}>
                <button className="profile-section" onClick={handleProfileMenuToggle}>
                  <Menu size={20} color="#777E90" />
                  {/* <button className="profile-btn">
                   <img src={userIcon} alt="User"></img>
                </button> */}
                </button>
                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <button className="profile-dropdown-item" onClick={handleProfileClick}>
                      <User size={18} color="#09122E" />
                      <span>My Profile</span>
                    </button>
                    {userIsAdmin && (
                      <button className="profile-dropdown-item" onClick={handleAdminClick}>
                        <LayoutDashboard size={18} color="#09122E" />
                        <span>Admin</span>
                      </button>
                    )}
                    <button className="profile-dropdown-item" onClick={handleSignOut}>
                      <LogOut size={18} color="#DC2626" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} color="#16171B" /> : <Menu size={24} color="#16171B" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <img src={logo} alt="Connect Logo" className="mobile-logo"></img>
              <button
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} color="#16171B" />
              </button>
            </div>

            <nav className="mobile-nav">
              {isLoggedIn ? (
                <>
                  <a href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </a>
                  <a href="/connection" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Connections
                  </a>
                  <a href="/like" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Likes
                  </a>
                  <a href="/chat" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Chat
                  </a>
                  <a href="/offer" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Offers
                  </a>
                </>
              ) : (
                <>
                  <a href="/features" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Features
                  </a>
                  <a href="/resources" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Resources
                  </a>
                  <a href="/download-app" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Download App
                  </a>
                </>
              )}
            </nav>

            {isLoggedIn && (
              <div className="mobile-menu-actions">
                <div className="mobile-location-btn" style={{ cursor: "default" }}>
                  {/* <div className="location-round">
                    <img src={locationIcon} alt="Location"></img>
                  </div> */}
                  {/* <button className="mobile-profile-btn" onClick={handleProfileClick}> */}
                    <img src={userIcon} alt="User"></img>
                  {/* </button> */}
                  <span>{userName || "Loading..."}</span>
                </div>
                <div className="mobile-action-buttons">
                  <div className="notification-wrapper">
                    <button className="mobile-icon-btn notification-btn" onClick={handleNotificationClick}>
                      <img src={notification} alt="Notifications"></img>
                      {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                      )}
                    </button>
                    <NotificationModal
                      isOpen={notificationModalOpen}
                      onClose={() => setNotificationModalOpen(false)}
                      onNotificationRead={fetchUnreadCount}
                    />
                  </div>
                  <div className="mobile-profile-menu">
                    <button className="mobile-profile-btn" onClick={handleProfileClick}>
                      <img src={userIcon} alt="User"></img>
                    </button>
                    {userIsAdmin && (
                      <button className="mobile-admin-btn" onClick={handleAdminClick}>
                        <LayoutDashboard size={18} color="#09122E" />
                        <span>Admin</span>
                      </button>
                    )}
                    <button className="mobile-signout-btn" onClick={handleSignOut}>
                      <LogOut size={18} color="#DC2626" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
