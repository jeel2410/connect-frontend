import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Sidebar from "../component/Sidebar";
import searchIcon from "../../src/assets/image/serachIcon.png";
import filterIcon from "../../src/assets/image/filterIcon.png";
import messageIcon from "../../src/assets/image/bluemessageIcon.png";
import wrongICon from "../../src/assets/image/wrong.png"
import rightIcon from "../../src/assets/image/right.png"
import { getAvatar, resolveImageUrl } from "../utils/avatarHelper";
import { getCookie, setCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Connection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("active");
  const [activeConnections, setActiveConnections] = useState([]);
  const [filterBusinesses, setFilterBusinesses] = useState(false);

  const getProfileImage = (user) => {
    if (user.isBusinessProfile) {
      return resolveImageUrl(user.businessLogo) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop";
    }
    return resolveImageUrl(user.profileImage || user.image) || getAvatar(user.gender, user.dateOfBirth || user.age);
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
    return user.username || user.city || user.address || "";
  };
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fastConnect, setFastConnect] = useState(false);
  const [loadingFastConnect, setLoadingFastConnect] = useState(false);

  // Connection Groups states
  const [connectionGroups, setConnectionGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");

  // Fetch active connections from API
  const fetchActiveConnections = async (search = "") => {
    try {
      setLoadingActive(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Build URL with search parameter if provided
      const url = search.trim()
        ? `${API_BASE_URL}/api/connection/connections?search=${encodeURIComponent(search.trim())}`
        : `${API_BASE_URL}/api/connection/connections`;

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
          return;
        }
        throw new Error("Failed to fetch active connections");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Handle different possible response structures
        const connections = Array.isArray(data.data)
          ? data.data
          : (data.data.connections || data.data.active || []);

        setActiveConnections(connections);
      } else {
        setActiveConnections([]);
      }
    } catch (error) {
      console.error("Error fetching active connections:", error);
      setActiveConnections([]);
    } finally {
      setLoadingActive(false);
    }
  };

  // Fetch incoming connection requests from API
  const fetchIncomingRequests = async (search = "") => {
    try {
      setLoadingIncoming(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Build URL with search parameter if provided
      const url = search.trim()
        ? `${API_BASE_URL}/api/connection/requests/received?search=${encodeURIComponent(search.trim())}`
        : `${API_BASE_URL}/api/connection/requests/received`;

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
          return;
        }
        throw new Error("Failed to fetch incoming requests");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Handle different possible response structures
        const requests = Array.isArray(data.data)
          ? data.data
          : (data.data.requests || data.data.incoming || data.data.received || []);

        setIncomingRequests(requests);
      } else {
        setIncomingRequests([]);
      }
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      setIncomingRequests([]);
    } finally {
      setLoadingIncoming(false);
    }
  };

  // Fetch pending (sent) connection requests from API
  const fetchPendingRequests = async (search = "") => {
    try {
      setLoadingPending(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Build URL with search parameter if provided
      const url = search.trim()
        ? `${API_BASE_URL}/api/connection/requests/sent?search=${encodeURIComponent(search.trim())}`
        : `${API_BASE_URL}/api/connection/requests/sent`;

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
          return;
        }
        throw new Error("Failed to fetch pending requests");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Handle different possible response structures
        const requests = Array.isArray(data.data)
          ? data.data
          : (data.data.requests || data.data.pending || data.data.sent || []);

        setPendingRequests(requests);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setPendingRequests([]);
    } finally {
      setLoadingPending(false);
    }
  };

  // Fetch user profile to get fastConnect setting
  const fetchUserProfile = async () => {
    try {
      const token = getCookie("authToken");
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.profile) {
          setFastConnect(result.data.profile.fastConnect || false);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile for fastConnect:", error);
    }
  };

  // Handle toggle Fast Connect option
  const handleToggleFastConnect = async (checked) => {
    try {
      setLoadingFastConnect(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Optimistically set fastConnect state
      setFastConnect(checked);

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fastConnect: checked
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update Fast Connect setting");
      }

      const result = await response.json();
      if (result.success && result.data && result.data.profile) {
        setFastConnect(result.data.profile.fastConnect || false);
        // Also update the userProfile cookie
        const userProfile = getCookie("userProfile");
        if (userProfile) {
          try {
            const parsed = JSON.parse(userProfile);
            parsed.fastConnect = result.data.profile.fastConnect;
            setCookie("userProfile", JSON.stringify(parsed), 7);
          } catch (e) {
            console.error("Error parsing/updating userProfile cookie", e);
          }
        }
      }
    } catch (error) {
      console.error("Error updating Fast Connect setting:", error);
      // Revert in case of error
      setFastConnect(!checked);
    } finally {
      setLoadingFastConnect(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const token = getCookie("authToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/connection/groups`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.groups) {
          setConnectionGroups(data.data.groups);
        }
      }
    } catch (err) {
      console.error("Error fetching connection groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setNewGroupName("");
    setSelectedConnections([]);
    setGroupSearchTerm("");
    setIsGroupModalOpen(true);
  };

  const handleOpenEditModal = (group) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setSelectedConnections(group.connections.map(c => c._id || c.id || c));
    setGroupSearchTerm("");
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert("Group name is required");
      return;
    }

    try {
      const token = getCookie("authToken");
      const url = editingGroup
        ? `${API_BASE_URL}/api/connection/groups/${editingGroup._id}`
        : `${API_BASE_URL}/api/connection/groups`;
      const method = editingGroup ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          connections: selectedConnections,
        }),
      });

      if (response.ok) {
        setIsGroupModalOpen(false);
        fetchGroups();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to save group");
      }
    } catch (err) {
      console.error("Error saving group:", err);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      const token = getCookie("authToken");
      const response = await fetch(`${API_BASE_URL}/api/connection/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchGroups();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete group");
      }
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  const toggleConnectionSelection = (connId) => {
    if (selectedConnections.includes(connId)) {
      setSelectedConnections(selectedConnections.filter(id => id !== connId));
    } else {
      setSelectedConnections([...selectedConnections, connId]);
    }
  };

  // Fetch all data when component mounts to show counts on all tabs
  useEffect(() => {
    fetchActiveConnections("");
    fetchPendingRequests("");
    fetchIncomingRequests("");
    fetchUserProfile();
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when tab changes (immediate fetch, no debounce)
  useEffect(() => {
    if (activeTab === "active") {
      fetchActiveConnections(searchTerm);
    } else if (activeTab === "pending") {
      fetchPendingRequests(searchTerm);
    } else if (activeTab === "incoming") {
      fetchIncomingRequests(searchTerm);
    } else if (activeTab === "groups") {
      fetchGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Debounce search - fetch data when search term changes (only for search, not tab changes)
  useEffect(() => {
    // Skip if searchTerm is empty and we just mounted (handled by initial useEffect)
    const timeoutId = setTimeout(() => {
      if (activeTab === "active") {
        fetchActiveConnections(searchTerm);
      } else if (activeTab === "pending") {
        fetchPendingRequests(searchTerm);
      } else if (activeTab === "incoming") {
        fetchIncomingRequests(searchTerm);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
    // Only trigger on searchTerm change, not activeTab change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Refresh all connections when navigating back to this page or when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Refresh all counts when page becomes visible
      if (document.visibilityState === 'visible') {
        fetchActiveConnections(searchTerm);
        fetchPendingRequests(searchTerm);
        fetchIncomingRequests(searchTerm);
        fetchUserProfile();
        fetchGroups();
      }
    };

    // Listen for visibility change event (when user switches tabs/windows or navigates back)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh when location changes (helps catch navigation back from other pages)
    // This runs whenever the location object changes, including navigation back
    // Small delay to ensure we're back on the connection page
    const timeoutId = setTimeout(() => {
      fetchActiveConnections(searchTerm);
      fetchPendingRequests(searchTerm);
      fetchIncomingRequests(searchTerm);
      fetchUserProfile();
      fetchGroups();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location, searchTerm]);

  // Handle reject incoming connection request
  const handleReject = async (requestId) => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Call the reject API
      const rejectResponse = await fetch(`${API_BASE_URL}/api/connection/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!rejectResponse.ok) {
        if (rejectResponse.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        const errorData = await rejectResponse.json();
        throw new Error(errorData.message || "Failed to reject connection request");
      }

      const rejectData = await rejectResponse.json();

      if (rejectData.success) {
        // Refetch incoming requests after successful reject
        await fetchIncomingRequests(searchTerm);
      } else {
        throw new Error(rejectData.message || "Failed to reject connection request");
      }
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      // Optionally show error message to user
    }
  };

  // Handle cancel pending connection request
  const handleCancelPending = async (receiverId) => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Use removeConnection endpoint to cancel pending request
      // This will delete the pending request between the users
      const cancelResponse = await fetch(`${API_BASE_URL}/api/connection/connection/${receiverId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!cancelResponse.ok) {
        if (cancelResponse.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        const errorData = await cancelResponse.json();
        throw new Error(errorData.message || "Failed to cancel connection request");
      }

      const cancelData = await cancelResponse.json();

      if (cancelData.success) {
        // Refetch pending requests after successful cancel
        await fetchPendingRequests(searchTerm);
      } else {
        throw new Error(cancelData.message || "Failed to cancel connection request");
      }
    } catch (error) {
      console.error("Error canceling connection request:", error);
      // Optionally show error message to user
    }
  };

  // Handle accept incoming connection request
  const handleAccept = async (requestId) => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Call the accept API
      const acceptResponse = await fetch(`${API_BASE_URL}/api/connection/requests/${requestId}/accept`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!acceptResponse.ok) {
        if (acceptResponse.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        const errorData = await acceptResponse.json();
        throw new Error(errorData.message || "Failed to accept connection request");
      }

      const acceptData = await acceptResponse.json();

      if (acceptData.success) {
        // Refetch incoming requests after successful accept
        await fetchIncomingRequests(searchTerm);
      } else {
        throw new Error(acceptData.message || "Failed to accept connection request");
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      // Optionally show error message to user
    }
  };

  // Handle message click - fetch chat history and navigate to chat page
  const handleMessage = async (connection) => {
    const userId = connection._id || connection.id;

    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
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
          console.error("Unauthorized: Please login again");
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

  const displayedActiveConnections = filterBusinesses
    ? activeConnections.filter(c => c.isBusinessProfile === true)
    : activeConnections;

  const displayedIncomingRequests = filterBusinesses
    ? incomingRequests.filter(r => r.isBusinessProfile === true)
    : incomingRequests;

  const displayedPendingRequests = filterBusinesses
    ? pendingRequests.filter(r => r.isBusinessProfile === true)
    : pendingRequests;

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        {/* <Sidebar /> */}
        <div className="connections-page-wrapper">
          <div className="title-div">
            <h1 className="inner-page-title"><span>Manage</span><span className="title-highlight">Connections</span></h1>
          </div>
          <div className="connections-page-card">
            <div className="connections-page-header">
              <div className="connections-page-search-filter">
                <div className="connections-page-search">
                  <span className="connections-page-search-icon">
                    <img src={searchIcon} alt="search" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search here"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* <button className="connections-page-filter-btn">
                  Filter
                  <span>
                    <img src={filterIcon} alt="filter" />
                  </span>
                </button> */}
              </div>
            </div>
            <div className="connections-page-tabs" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  className={`connections-page-tab ${activeTab === "active" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("active");
                    fetchActiveConnections(searchTerm);
                  }}
                >
                  Active ({displayedActiveConnections.length})
                </button>
                <button
                  className={`connections-page-tab ${activeTab === "incoming" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("incoming");
                    fetchIncomingRequests(searchTerm);
                  }}
                >
                  Incoming ({displayedIncomingRequests.length})
                </button>
                <button
                  className={`connections-page-tab ${activeTab === "pending" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("pending");
                    fetchPendingRequests(searchTerm);
                  }}
                >
                  Pending ({displayedPendingRequests.length})
                </button>
                <button
                  className={`connections-page-tab ${activeTab === "groups" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("groups");
                    fetchGroups();
                  }}
                >
                  Groups ({connectionGroups.length})
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
            <div className="connections-page-content-wrapper">
              {activeTab === "active" && (
                <div className={`connections-tab-content ${loadingActive ? 'loading' : ''}`}>
                  {loadingActive ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                      Loading active connections...
                    </div>
                  ) : displayedActiveConnections.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "#666"
                    }}>
                      <div style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                        No Active Connections
                      </div>
                      <div style={{ fontSize: "16px", color: "#999" }}>
                        You don't have any active connections yet
                      </div>
                    </div>
                  ) : (
                    <div className="connections-page-grid">
                      {displayedActiveConnections.map((connection) => (
                        <div key={connection._id || connection.id} className="connections-page-item">
                          <div
                            className="connections-page-container"
                            onClick={() => {
                              const userId = connection._id || connection.id || connection.userId;
                              if (userId) {
                                navigate("/userprofile", { state: { userId } });
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              src={getProfileImage(connection)}
                              alt={getProfileName(connection)}
                              className="connections-page-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = connection.isBusinessProfile 
                                  ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop" 
                                  : getAvatar(connection.gender, connection.dateOfBirth || connection.age);
                              }}
                              style={{ objectFit: connection.isBusinessProfile ? 'contain' : 'cover', backgroundColor: connection.isBusinessProfile ? '#fff' : 'transparent' }}
                            />
                            <div className="connection-name-content">
                              <h3>
                                {getProfileName(connection)}
                              </h3>
                              <p>{getProfileSubtitle(connection)}</p>
                            </div>
                          </div>
                          <button
                            className="connections-page-message-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessage(connection);
                            }}
                          >
                            <img src={messageIcon} alt="message" /> Message
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "incoming" && (
                <div className={`connections-tab-content ${loadingIncoming ? 'loading' : ''}`}>
                  {/* Fast Connect Toggle */}
                  <div className="fast-connect-wrapper" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "linear-gradient(135deg, rgba(234, 101, 10, 0.05) 0%, rgba(244, 63, 94, 0.05) 100%)",
                    border: "1px solid rgba(234, 101, 10, 0.15)",
                    borderRadius: "12px",
                    marginBottom: "20px"
                  }}>
                    <div className="fast-connect-info" style={{ marginRight: "20px", textAlign: "left" }}>
                      <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1F2937", fontFamily: "'Basier Square', sans-serif" }}>Fast Connect</h4>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6B7280", fontFamily: "'Basier Square', sans-serif" }}>
                        When enabled, connection requests sent to you are automatically accepted instantly without requiring your approval.
                      </p>
                    </div>
                    <label className="toggle-switch" style={{
                      position: "relative",
                      display: "inline-block",
                      width: "50px",
                      height: "26px",
                      flexShrink: 0
                    }}>
                      <input
                        type="checkbox"
                        checked={fastConnect}
                        disabled={loadingFastConnect}
                        onChange={(e) => handleToggleFastConnect(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="toggle-slider" style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: fastConnect ? "#EA650A" : "#ccc",
                        transition: "0.4s",
                        borderRadius: "34px",
                        boxShadow: fastConnect ? "0 0 8px rgba(234, 101, 10, 0.4)" : "none",
                        opacity: loadingFastConnect ? 0.7 : 1
                      }}>
                        <span className="toggle-circle" style={{
                          position: "absolute",
                          content: '""',
                          height: "18px",
                          width: "18px",
                          left: fastConnect ? "28px" : "4px",
                          bottom: "4px",
                          backgroundColor: "white",
                          transition: "0.4s",
                          borderRadius: "50%"
                        }}></span>
                      </span>
                    </label>
                  </div>

                  {loadingIncoming ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                      Loading incoming requests...
                    </div>
                  ) : displayedIncomingRequests.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "#666"
                    }}>
                      <div style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                        No Incoming Requests
                      </div>
                      <div style={{ fontSize: "16px", color: "#999" }}>
                        You don't have any incoming connection requests
                      </div>
                    </div>
                  ) : (
                    <div className="connections-page-grid">
                      {displayedIncomingRequests.map((request) => (
                        <div key={request.requestId || request._id || request.id} className="connections-page-item incoming-item">
                          <div
                            className="connections-page-container"
                            onClick={() => {
                              const userId = request._id || request.id || request.userId;
                              if (userId) {
                                navigate("/userprofile", { state: { userId } });
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              src={getProfileImage(request)}
                              alt={getProfileName(request)}
                              className="connections-page-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = request.isBusinessProfile 
                                  ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop" 
                                  : getAvatar(request.gender, request.dateOfBirth || request.age);
                              }}
                              style={{ objectFit: request.isBusinessProfile ? 'contain' : 'cover', backgroundColor: request.isBusinessProfile ? '#fff' : 'transparent' }}
                            />
                            <div className="connection-name-content">
                              <h3>{getProfileName(request)}</h3>
                              <p>{getProfileSubtitle(request)}</p>
                            </div>
                          </div>
                          <div className="incoming-actions">
                            <button
                              className="reject-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(request.requestId || request._id || request.id);
                              }}
                            >
                              <img src={wrongICon} alt="Reject"></img> Reject
                            </button>
                            <button
                              className="accept-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(request.requestId || request._id || request.id);
                              }}
                            >
                              <img src={rightIcon} alt="Accept"></img> Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "pending" && (
                <div className={`connections-tab-content ${loadingPending ? 'loading' : ''}`}>
                  {loadingPending ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                      Loading pending requests...
                    </div>
                  ) : displayedPendingRequests.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "#666"
                    }}>
                      <div style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                        No Pending Requests
                      </div>
                      <div style={{ fontSize: "16px", color: "#999" }}>
                        You haven't sent any connection requests yet
                      </div>
                    </div>
                  ) : (
                    <div className="connections-page-grid">
                      {displayedPendingRequests.map((request) => (
                        <div key={request._id || request.id} className="connections-page-item pending-item" style={{ position: "relative" }}>
                          <div
                            className="connections-page-container"
                            onClick={() => {
                              const userId = request._id || request.id || request.userId;
                              if (userId) {
                                navigate("/userprofile", { state: { userId } });
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              src={getProfileImage(request)}
                              alt={getProfileName(request)}
                              className="connections-page-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = request.isBusinessProfile 
                                  ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop" 
                                  : getAvatar(request.gender, request.dateOfBirth || request.age);
                              }}
                              style={{ objectFit: request.isBusinessProfile ? 'contain' : 'cover', backgroundColor: request.isBusinessProfile ? '#fff' : 'transparent' }}
                            />
                            <div className="connection-name-content">
                              <h3>{getProfileName(request)}</h3>
                              <p>{getProfileSubtitle(request)}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const receiverId = request._id || request.id || request.userId;
                              if (receiverId) {
                                handleCancelPending(receiverId);
                              }
                            }}
                            title="Cancel request"
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              background: "#FBEAEA",
                              border: "none",
                              borderRadius: "50%",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: "0"
                            }}
                          >
                            <img src={wrongICon} alt="Cancel" style={{ width: "16px", height: "16px" }}></img>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "groups" && (
                <div className={`connections-tab-content ${loadingGroups ? 'loading' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#09122E' }}>Connection Groups</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Organize your connections into custom segments for targeted post sharing.</p>
                    </div>
                    <button 
                      onClick={handleOpenCreateModal}
                      style={{
                        background: '#EA650A',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s'
                      }}
                    >
                      + Create Group
                    </button>
                  </div>

                  {loadingGroups ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                      Loading connection groups...
                    </div>
                  ) : connectionGroups.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      background: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #E8EDF3',
                      color: "#666"
                    }}>
                      <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                        No Connection Groups Yet
                      </div>
                      <div style={{ fontSize: "14px", color: "#999", marginBottom: '16px' }}>
                        Create a group to share posts with specific connections.
                      </div>
                      <button 
                        onClick={handleOpenCreateModal}
                        style={{
                          background: '#FFF1E6',
                          color: '#EA650A',
                          border: '1px solid #FFD8BE',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Create Your First Group
                      </button>
                    </div>
                  ) : (
                    <div className="connections-page-grid">
                      {connectionGroups.map((group) => (
                        <div key={group._id} className="connections-page-item" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', display: 'flex' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ textAlign: 'left' }}>
                              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E' }}>
                                {group.name}
                              </h3>
                              <span style={{ fontSize: '12px', color: '#777E90', fontWeight: '500' }}>
                                {group.connections?.length || 0} members
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleOpenEditModal(group)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#EA650A',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#EF4444',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Member avatars */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', flexGrow: 1, minHeight: '40px', justifyContent: 'flex-start' }}>
                            {group.connections && group.connections.length > 0 ? (
                              group.connections.map((member) => {
                                const details = member.userDetailId || member;
                                const isBiz = details.isBusinessProfile === true;
                                const avatarImg = isBiz ? (resolveImageUrl(details.businessLogo) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop") : (resolveImageUrl(details.profileImage) || getAvatar(details.gender, details.dateOfBirth));
                                const name = isBiz ? details.businessName : (details.fullName || "User");
                                return (
                                  <img
                                    key={member._id || member.id}
                                    src={avatarImg}
                                    alt={name}
                                    title={name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = isBiz 
                                        ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop" 
                                        : getAvatar(details.gender, details.dateOfBirth);
                                    }}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      objectFit: isBiz ? 'contain' : 'cover',
                                      backgroundColor: isBiz ? '#fff' : 'transparent',
                                      border: isBiz ? '1px solid #e5e7eb' : '2px solid #fff',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                  />
                                );
                              })
                            ) : (
                              <span style={{ fontSize: '12px', color: '#B1B5C3', fontStyle: 'italic' }}>No members in group</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Group Modal */}
            {isGroupModalOpen && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(9, 18, 46, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '20px'
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #E8EDF3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#09122E' }}>
                      {editingGroup ? "Edit Connection Group" : "Create Connection Group"}
                    </h3>
                    <button 
                      onClick={() => setIsGroupModalOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        color: '#777E90',
                        cursor: 'pointer',
                        lineHeight: '1',
                        padding: '4px'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                  
                  <form onSubmit={handleSaveGroup} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                      
                      {/* Group Name Input */}
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#353945', marginBottom: '8px', display: 'block', textAlign: 'left' }}>
                          Group Name <span style={{ color: '#EA650A' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Football buddies, Coworkers"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #DDE2EE',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#09122E',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Connections Select List */}
                      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '200px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#353945', marginBottom: '8px', display: 'block', textAlign: 'left' }}>
                          Select Connections ({selectedConnections.length} selected)
                        </label>
                        
                        {/* Modal Connection Search */}
                        <input
                          type="text"
                          placeholder="Search connections..."
                          value={groupSearchTerm}
                          onChange={(e) => setGroupSearchTerm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid #DDE2EE',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#09122E',
                            outline: 'none',
                            marginBottom: '12px',
                            boxSizing: 'border-box'
                          }}
                        />

                        <div style={{
                          border: '1px solid #E8EDF3',
                          borderRadius: '8px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          padding: '8px'
                        }}>
                          {activeConnections.filter(c => {
                            const fullName = c.fullName || c.name || "";
                            return fullName.toLowerCase().includes(groupSearchTerm.toLowerCase());
                          }).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#777E90', fontSize: '13px' }}>
                              No connections found
                            </div>
                          ) : (
                            activeConnections.filter(c => {
                              const fullName = c.fullName || c.name || "";
                              return fullName.toLowerCase().includes(groupSearchTerm.toLowerCase());
                            }).map((conn) => {
                              const connId = conn._id || conn.id || conn.userId;
                              const isSelected = selectedConnections.includes(connId);
                              const details = conn.userDetailId || conn;
                              const isBiz = details.isBusinessProfile === true;
                              const avatarImg = isBiz ? (resolveImageUrl(details.businessLogo) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop") : (resolveImageUrl(details.profileImage) || getAvatar(details.gender, details.dateOfBirth));
                              const name = isBiz ? details.businessName : (details.fullName || "User");
                              
                              return (
                                <div 
                                  key={connId}
                                  onClick={() => toggleConnectionSelection(connId)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: isSelected ? '#FFF1E6' : 'transparent',
                                    transition: 'background 0.15s',
                                    marginBottom: '4px'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
                                    style={{
                                      accentColor: '#EA650A',
                                      marginRight: '12px',
                                      cursor: 'pointer'
                                    }}
                                  />
                                  <img
                                    src={avatarImg}
                                    alt={name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = isBiz 
                                        ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop" 
                                        : getAvatar(details.gender, details.dateOfBirth);
                                    }}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      objectFit: isBiz ? 'contain' : 'cover',
                                      backgroundColor: isBiz ? '#fff' : 'transparent',
                                      border: isBiz ? '1px solid #e5e7eb' : 'none',
                                      marginRight: '12px'
                                    }}
                                  />
                                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#09122E', textAlign: 'left' }}>
                                    {name}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Modal Footer */}
                    <div style={{
                      padding: '16px 24px',
                      borderTop: '1px solid #E8EDF3',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '12px',
                      background: '#F8F9FB'
                    }}>
                      <button
                        type="button"
                        onClick={() => setIsGroupModalOpen(false)}
                        style={{
                          background: 'none',
                          border: '1px solid #DDE2EE',
                          color: '#353945',
                          borderRadius: '8px',
                          padding: '10px 18px',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          background: '#EA650A',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 18px',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {editingGroup ? "Save Changes" : "Create Group"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Connection;