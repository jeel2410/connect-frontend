import React, { useState, useEffect } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Sidebar from "../component/Sidebar";
import searchIcon from "../../src/assets/image/serachIcon.png";
import filterIcon from "../../src/assets/image/filterIcon.png";
import messageIcon from "../../src/assets/image/bluemessageIcon.png";
import wrongICon from "../../src/assets/image/wrong.png"
import rightIcon from "../../src/assets/image/right.png"
import profile1 from "../../src/assets/image/profile/profile1.png"
import profile2 from "../../src/assets/image/profile/profile2.png"
import profile3 from "../../src/assets/image/profile/profile3.png"
import profile4 from "../../src/assets/image/profile/profile4.png"
import profile5 from "../../src/assets/image/profile/profile5.png"
import profile6 from "../../src/assets/image/profile/profile6.png"
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Connection = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [activeConnections, setActiveConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingIncoming, setLoadingIncoming] = useState(false);

  // Fetch active connections from API
  const fetchActiveConnections = async () => {
    try {
      setLoadingActive(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/connection/connections`, {
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
  const fetchIncomingRequests = async () => {
    try {
      setLoadingIncoming(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/connection/requests/received`, {
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
  const fetchPendingRequests = async () => {
    try {
      setLoadingPending(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/connection/requests/sent`, {
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

  // Fetch data when component mounts or when tab changes
  useEffect(() => {
    if (activeTab === "active") {
      fetchActiveConnections();
    } else if (activeTab === "pending") {
      fetchPendingRequests();
    } else if (activeTab === "incoming") {
      fetchIncomingRequests();
    }
  }, [activeTab]);

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
        await fetchIncomingRequests();
      } else {
        throw new Error(rejectData.message || "Failed to reject connection request");
      }
    } catch (error) {
      console.error("Error rejecting connection request:", error);
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
        await fetchIncomingRequests();
      } else {
        throw new Error(acceptData.message || "Failed to accept connection request");
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      // Optionally show error message to user
    }
  };

  const handleMessage = (id) => {
    console.log("Message:", id);
  };

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <Sidebar />
        <div className="connections-page-wrapper">
          <div className="connections-page-card">
            <div className="connections-page-header">
              <h1>Connections</h1>
              <div className="connections-page-search-filter">
                <div className="connections-page-search">
                  <span className="connections-page-search-icon">
                    <img src={searchIcon} alt="search" />
                  </span>
                  <input type="text" placeholder="Search here" />
                </div>
                <button className="connections-page-filter-btn">
                  Filter
                  <span>
                    <img src={filterIcon} alt="filter" />
                  </span>
                </button>
              </div>
            </div>
            <div className="connections-page-tabs">
              <button
                className={`connections-page-tab ${activeTab === "active" ? "active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                Active({activeConnections.length})
              </button>
              <button
                className={`connections-page-tab ${activeTab === "incoming" ? "active" : ""}`}
                onClick={() => setActiveTab("incoming")}
              >
                Incoming ({incomingRequests.length})
              </button>
              <button
                className={`connections-page-tab ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending({pendingRequests.length})
              </button>
            </div>
            {activeTab === "active" && (
              <>
                {loadingActive ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Loading active connections...
                  </div>
                ) : activeConnections.length === 0 ? (
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
                    {activeConnections.map((connection) => (
                      <div key={connection._id || connection.id} className="connections-page-item">
                        <div className="connections-page-container">
                          <img
                            src={connection.profileImage || connection.image || profile1}
                            alt={connection.fullName || connection.name || "User"}
                            className="connections-page-avatar"
                          />
                          <div className="connection-name-content">
                            <h3>{connection.fullName || connection.name || "Unknown"}</h3>
                            <p>{connection.username || connection.city || connection.address || ""}</p>
                          </div>
                        </div>
                        <button
                          className="connections-page-message-btn"
                          onClick={() => handleMessage(connection._id || connection.id)}
                        >
                          <img src={messageIcon} alt="message" /> Message
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === "incoming" && (
              <>
                {loadingIncoming ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Loading incoming requests...
                  </div>
                ) : incomingRequests.length === 0 ? (
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
                    {incomingRequests.map((request) => (
                      <div key={request.requestId || request._id || request.id} className="connections-page-item incoming-item">
                        <div className="connections-page-container">
                          <img
                            src={request.profileImage || request.image || profile1}
                            alt={request.fullName || request.name || "User"}
                            className="connections-page-avatar"
                          />
                          <div className="connection-name-content">
                            <h3>{request.fullName || request.name || "Unknown"}</h3>
                            <p>{request.username || request.city || request.address || ""}</p>
                          </div>
                        </div>
                        <div className="incoming-actions">
                          <button
                            className="reject-btn"
                            onClick={() => handleReject(request.requestId || request._id || request.id)}
                          >
                            <img src={wrongICon} alt="Reject"></img> Reject
                          </button>
                          <button
                            className="accept-btn"
                            onClick={() => handleAccept(request.requestId || request._id || request.id)}
                          >
                            <img src={rightIcon} alt="Accept"></img> Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === "pending" && (
              <>
                {loadingPending ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    Loading pending requests...
                  </div>
                ) : pendingRequests.length === 0 ? (
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
                    {pendingRequests.map((request) => (
                      <div key={request._id || request.id} className="connections-page-item pending-item">
                        <div className="connections-page-container">
                          <img
                            src={request.profileImage || request.image || profile1}
                            alt={request.fullName || request.name || "User"}
                            className="connections-page-avatar"
                          />
                          <div className="connection-name-content">
                            <h3>{request.fullName || request.name || "Unknown"}</h3>
                            <p>{request.username || request.city || request.address || ""}</p>
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

export default Connection;