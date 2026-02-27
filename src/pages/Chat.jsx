import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/style.css'
import Header from '../component/Header'
import Footer from '../component/Footer'
import Sidebar from '../component/Sidebar'
import searchIcon from '../assets/image/serachIcon.png'
import profile1 from '../assets/image/profile/profile1.png'
import sendIcon from "../assets/image/sendIcon.png"
import { getCookie, getUserProfile } from '../utils/auth'
import API_BASE_URL from '../utils/config'

export default function Chat() {
  const location = useLocation()
  const navigate = useNavigate()
  const incomingUserId = location.state?.userId || null
  const incomingChatHistory = location.state?.chatHistory || null
  
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserProfile, setSelectedUserProfile] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const [chatList, setChatList] = useState([])
  const [loadingChatList, setLoadingChatList] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef(null)

  // Get current user ID from profile API
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) {
          return;
        }

        // Fetch current user profile to get the correct ID
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.profile) {
            const profile = data.data.profile;
            // Use originalid as primary field for comparison
            const userId = profile.originalid || profile._id || profile.id;
            if (userId) {
              const userIdString = String(userId);
              setCurrentUserId(userIdString);
            }
          }
        } else {
          // If API fails, try cookie
          const userProfile = getUserProfile();
          if (userProfile) {
            // Use originalid as primary field for comparison
            const userId = userProfile.originalid || userProfile._id || userProfile.id;
            if (userId) {
              const userIdString = String(userId);
              setCurrentUserId(userIdString);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching current user profile:", error);
        // Fallback to cookie
        const userProfile = getUserProfile();
        if (userProfile) {
          // Use originalid as primary field for comparison
          const userId = userProfile.originalid || userProfile._id || userProfile.id;
          if (userId) {
            const userIdString = String(userId);
            setCurrentUserId(userIdString);
          }
        }
      }
    };

    fetchCurrentUserProfile();
  }, []);

  // Fetch user profile when userId is provided
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!incomingUserId) return;

      try {
        setLoading(true);
        const token = getCookie("authToken");
        if (!token) {
          console.error("User not authenticated");
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile/${incomingUserId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            console.error("Unauthorized: Please login again");
            return;
          }
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();
        
        if (profileData.success && profileData.data) {
          const profile = profileData.data.profile || profileData.data;
          setSelectedUserProfile(profile);
          setSelectedUserId(incomingUserId);
          
          // Set chat messages if chat history is available
          if (incomingChatHistory) {
            // Handle different possible chat history structures
            // Could be: array, { messages: [...] }, or { data: { messages: [...] } }
            let messages = [];
            if (Array.isArray(incomingChatHistory)) {
              messages = incomingChatHistory;
            } else if (incomingChatHistory.data && incomingChatHistory.data.messages) {
              messages = incomingChatHistory.data.messages;
            } else {
              messages = incomingChatHistory.messages || incomingChatHistory.chatHistory || [];
            }
            
            // Sort messages by createdAt (oldest first, so latest appears at bottom)
            const sortedMessages = messages.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.created_at || 0);
              const dateB = new Date(b.createdAt || b.created_at || 0);
              return dateA - dateB;
            });
            setChatMessages(sortedMessages);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [incomingUserId, incomingChatHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Function to fetch chat list
  const fetchChatList = async (search = "") => {
    try {
      setLoadingChatList(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Build URL with search query parameter if provided
      let url = `${API_BASE_URL}/api/chat/list`;
      if (search && search.trim()) {
        url += `?search=${encodeURIComponent(search.trim())}`;
      }

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
        throw new Error("Failed to fetch chat list");
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.chats) {
        setChatList(data.data.chats);
      }
    } catch (error) {
      console.error("Error fetching chat list:", error);
    } finally {
      setLoadingChatList(false);
    }
  };

  // Fetch chat list on component mount
  useEffect(() => {
    fetchChatList();
  }, []);

  // Debounce search and fetch chat list when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchChatList(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle chat selection
  const handleChatSelect = async (chatUserId) => {
    if (chatUserId === selectedUserId) return; // Already selected

    try {
      setLoading(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile/${chatUserId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        throw new Error("Failed to fetch user profile");
      }

      const profileData = await profileResponse.json();
      
      if (profileData.success && profileData.data) {
        const profile = profileData.data.profile || profileData.data;
        setSelectedUserProfile(profile);
        setSelectedUserId(chatUserId);
        
        // Fetch chat history for this user
        await fetchChatHistory(chatUserId);
      }
    } catch (error) {
      console.error("Error selecting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch chat history
  const fetchChatHistory = async (userId) => {
    try {
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
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
          console.error("Unauthorized: Please login again");
          return;
        }
        throw new Error("Failed to fetch chat history");
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Handle different possible chat history structures
        // Based on API response: { success: true, data: { messages: [...] } }
        const messages = Array.isArray(data.data) 
          ? data.data 
          : (data.data.messages || data.data.chatHistory || data.messages || []);
        
        // Sort messages by createdAt (oldest first, so latest appears at bottom)
        const sortedMessages = messages.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          return dateA - dateB;
        });
        setChatMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Function to send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUserId || sending) {
      return;
    }

    try {
      setSending(true);
      const token = getCookie("authToken");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      // Call the send message API
      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedUserId,
          message: messageInput.trim()
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized: Please login again");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();
      
      if (data.success) {
        // Clear input after sending
        setMessageInput("");
        
        // Refetch chat history to get updated messages
        await fetchChatHistory(selectedUserId);
        
        // Refetch chat list to update last message and time
        await fetchChatList();
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error message to user
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        {/* <Sidebar /> */}
        <div className="chat-page-wrapper">
          <div className="chat-container">
          <div className="chat-sidebar">
            <div className="chat-header">
              <h1>Chat</h1>
            </div>
            
            <div className="chat-search">
              <img src={searchIcon} alt="Search" className="search-icon" />
              <input 
                type="text" 
                placeholder="Search here." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="chat-contacts">
              {loadingChatList ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
                  Loading chats...
                </div>
              ) : chatList.length > 0 ? (
                chatList.map((chat) => {
                  // Format last message time
                  const formatTime = (dateString) => {
                    if (!dateString) return "";
                    const date = new Date(dateString);
                    const now = new Date();
                    const diffInHours = (now - date) / (1000 * 60 * 60);
                    
                    if (diffInHours < 24) {
                      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    } else if (diffInHours < 48) {
                      return "Yesterday";
                    } else {
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                  };

                  const isSelected = chat._id === selectedUserId;
                  
                  return (
                    <div
                      key={chat._id}
                      className={`chat-contact-item ${isSelected ? 'active' : ''}`}
                      onClick={() => handleChatSelect(chat._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="contact-avatar">
                        <img 
                          src={chat.profileImage || profile1} 
                          alt={chat.fullName || "User"} 
                        />
                        {chat.unseenCount > 0 && (
                          <span className="unread-badge">{chat.unseenCount}</span>
                        )}
                      </div>
                      <div className="contact-info">
                        <div className="contact-name">
                          {chat.fullName || "User"}
                        </div>
                        <div className="contact-message">
                          {chat.lastMessage || "No messages yet"}
                        </div>
                      </div>
                      <div className="contact-time">
                        {formatTime(chat.lastMessageTime)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#999", fontSize: "14px" }}>
                  No chats yet. Start a conversation!
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Messages */}
          <div className="chat-main">
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
                Loading chat...
              </div>
            ) : selectedUserProfile ? (
              <>
                <div className="chat-main-header">
                  <div className="chat-main-avatar">
                    <img 
                      src={selectedUserProfile.profileImage || profile1} 
                      alt={selectedUserProfile.fullName || "User"} 
                    />
                  </div>
                  <div className="chat-main-name">
                    {selectedUserProfile.fullName || "User"}
                  </div>
                </div>

                <div className="chat-messages">
                  {chatMessages.length > 0 ? (
                    <>
                      {chatMessages.map((message, index) => {
                        // Get current user ID - prioritize originalid from profile
                        const userProfile = getUserProfile();
                        const currentUserFromState = String(currentUserId || '');
                        // Use originalid as primary field for comparison
                        const currentUserFromCookie = String(userProfile?.originalid || userProfile?._id || userProfile?.id || '');
                        const currentUser = currentUserFromState || currentUserFromCookie;
                        
                        // Get sender and receiver IDs from message
                        const messageSenderId = String(message.senderId || message.sender?._id || message.sender || '').trim();
                        const messageReceiverId = String(message.receiverId || message.receiver?._id || message.receiver || '').trim();
                        const currentUserTrimmed = String(currentUser || '').trim();
                        
                        // If current user is the sender (senderId matches currentUserId originalid), show on right (sent)
                        // If current user is the receiver (receiverId matches currentUserId originalid), show on left (received)
                        const isFromMe = currentUserTrimmed !== '' && 
                                        messageSenderId !== '' && 
                                        messageSenderId === currentUserTrimmed;
                        
                        return (
                          <div
                            key={message._id || message.id || index}
                            className={`message-bubble ${isFromMe ? 'sent' : 'received'}`}
                          >
                            <div className="message-text">{message.message || message.text || message.content}</div>
                            <div className="message-time">
                              {message.createdAt 
                                ? new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                : (message.time || '')
                              }
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>

                <div className="chat-input-container">
                  <div className="chat-input-wrapper">
                    <input
                      type="text"
                      placeholder="Your messages..."
                      className="chat-input"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                    />
                    <button 
                      className="chat-send-btn"
                      onClick={handleSendMessage}
                      disabled={sending || !messageInput.trim()}
                    >
                      <img src={sendIcon} alt="Send"></img>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
                <div style={{ fontSize: "18px", marginBottom: "12px" }}>
                  Select a user to start chatting
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
