import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import closeIcon from "../../src/assets/image/close_icon.png";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const NotificationModal = ({ isOpen, onClose, onNotificationRead }) => {
  const navigate = useNavigate();
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

  // Handle notification click - delete notification and navigate if it's a like/message notification
  const handleNotificationClick = async (notification) => {
    const notificationId = notification._id || notification.id;
    if (!notificationId) {
      return;
    }

    // Delete notification when clicked/viewed
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
        throw new Error("Failed to delete notification");
      }

      const data = await response.json();

      if (data.success) {
        // Remove notification from local state
        setNotifications(prevNotifications =>
          prevNotifications.filter(notif =>
            (notif._id || notif.id) !== notificationId
          )
        );

        // Refresh unread count
        if (onNotificationRead) {
          onNotificationRead();
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }

    // Navigate based on notification type
    if (notification.type === 'like') {
      // Close the modal
      onClose();
      // Navigate to likes page and auto-select "likes" tab
      navigate('/like', { state: { activeTab: 'likes' } });
    } else if (notification.type === 'message') {
      // Get sender ID from notification
      let senderId = null;
      
      // Check data.senderId first (from notification service)
      if (notification.data?.senderId) {
        senderId = notification.data.senderId;
      }
      // Check fromUser._id (returned by getNotifications service)
      else if (notification.fromUser?._id) {
        senderId = notification.fromUser._id;
      }
      // Check fromUserId._id (if populated directly)
      else if (notification.fromUserId?._id) {
        senderId = notification.fromUserId._id;
      }
      // Check fromUserId as string
      else if (notification.fromUserId) {
        senderId = notification.fromUserId.toString();
      }

      if (senderId) {
        // Close the modal
        onClose();
        
        // Try to fetch chat history, then navigate
        try {
          const token = getCookie("authToken");
          if (token) {
            const response = await fetch(`${API_BASE_URL}/api/chat/history/${senderId}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const data = await response.json();
              // Navigate to chat page with userId and chat history
              navigate("/chat", {
                state: {
                  userId: senderId,
                  chatHistory: data.data || data
                }
              });
            } else {
              // Still navigate even if API fails
              navigate("/chat", {
                state: {
                  userId: senderId
                }
              });
            }
          } else {
            // Navigate without fetching history if no token
            navigate("/chat", {
              state: {
                userId: senderId
              }
            });
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
          // Still navigate to chat page even if API fails
          navigate("/chat", {
            state: {
              userId: senderId
            }
          });
        }
      }
    }
  };

  // Get sender name from notification
  const getSenderName = (notification) => {
    // Check data.senderName first (from notification service)
    if (notification.data?.senderName) {
      return notification.data.senderName;
    }
    // Check fromUser.fullName (returned by getNotifications service)
    if (notification.fromUser?.fullName) {
      return notification.fromUser.fullName;
    }
    // Check fromUserId.fullName (if populated directly)
    if (notification.fromUserId?.fullName) {
      return notification.fromUserId.fullName;
    }
    // Fallback: try to parse from body message (e.g., "John Doe liked your profile")
    if (notification.body) {
      const match = notification.body.match(/^(.+?)\s+liked your profile$/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Format notification message with sender name for like notifications
  const formatNotificationMessage = (notification) => {
    if (notification.type === 'like') {
      const senderName = getSenderName(notification);
      if (senderName) {
        return `${senderName} liked your profile`;
      }
    }
    // Return original message or body
    return notification.message || notification.body || notification.title || "Notification";
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
              {notifications.map((notification) => {
                const isLikeNotification = notification.type === 'like';
                const isMessageNotification = notification.type === 'message';
                const isClickable = isLikeNotification || isMessageNotification;
                
                // Only format message for like notifications, keep original for others
                const notificationMessage = isLikeNotification 
                  ? formatNotificationMessage(notification)
                  : (notification.message || notification.body || notification.title || "Notification");
                
                return (
                  <div 
                    key={notification._id || notification.id} 
                    className={`notification-item ${!notification.isRead ? "unread" : ""} ${isClickable ? "clickable" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                    style={isClickable ? { cursor: 'pointer' } : {}}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title || "Notification"}
                      </div>
                      <div className="notification-message">
                        {notificationMessage}
                      </div>
                      <div className="notification-time">
                        {formatDate(notification.createdAt || notification.created_at || notification.timestamp)}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="notification-dot"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationModal;

