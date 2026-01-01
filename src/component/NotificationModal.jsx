import React, { useState, useEffect } from "react";
import closeIcon from "../../src/assets/image/close_icon.png";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const NotificationModal = ({ isOpen, onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
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
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Handle different possible response structures
        const notificationList = Array.isArray(data.data) 
          ? data.data 
          : (data.data.notifications || data.data.list || []);
        
        setNotifications(notificationList);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleNotificationClick = async (notification) => {
    // If already read, don't do anything
    if (notification.isRead) {
      return;
    }

    const notificationId = notification._id || notification.id;
    if (!notificationId) {
      return;
    }

    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
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
        throw new Error("Failed to mark notification as read");
      }

      const data = await response.json();

      if (data.success) {
        // Update local state to mark notification as read
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            (notif._id || notif.id) === notificationId
              ? { ...notif, isRead: true }
              : notif
          )
        );

        // Refresh unread count
        if (onNotificationRead) {
          onNotificationRead();
        }
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Format date/time for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-dropdown-overlay" onClick={onClose}></div>
      <div className="notification-dropdown">
        <div className="notification-dropdown-header">
          <h2>Notifications</h2>
          <button className="close-btn" onClick={onClose}>
            <img src={closeIcon} alt="Close"></img>
          </button>
        </div>

        <div className="notification-dropdown-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              Loading notifications...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#DC2626" }}>
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px", 
              color: "#666" 
            }}>
              <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                No Notifications
              </div>
              <div style={{ fontSize: "14px", color: "#999" }}>
                You don't have any notifications yet
              </div>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div 
                  key={notification._id || notification.id} 
                  className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title || notification.message || "Notification"}
                    </div>
                    {notification.message && notification.title && (
                      <div className="notification-message">
                        {notification.message}
                      </div>
                    )}
                    <div className="notification-time">
                      {formatDate(notification.createdAt || notification.created_at || notification.timestamp)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="notification-dot"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationModal;

