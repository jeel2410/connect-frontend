import React, { useState } from "react";
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
import profile7 from "../../src/assets/image/profile/profile7.png"
import profile8 from "../../src/assets/image/profile/profile8.png"

const Connection = () => {
  const [activeTab, setActiveTab] = useState("active");

  const activeConnections = [
    {
      id: 1,
      name: "Darlene Robertson",
      username: "beautifulbutterfly101",
      image:profile1
    },
    {
      id: 2,
      name: "Jacob Jones",
      username: "whitespace427",
      image:profile3
    },
    {
      id: 3,
      name: "Albert Flores",
      username: "happysmile5354",
      image:profile5
    },
    {
      id: 4,
      name: "Marvin McKinney",
      username: "tinyleopard720",
      image: profile6
    },
    {
      id: 5,
      name: "Jerome Bell",
      username: "lazymeercat616",
      image: profile2
    },
    {
      id: 6,
      name: "Esther Howard",
      username: "brownfish258",
      image: profile4
    },
  ];

  const incomingRequests = [
    {
      id: 1,
      name: "Darlene Robertson",
      username: "beautifulbutterfly101",
      image: profile1
    },
    {
      id: 2,
      name: "Jacob Jones",
      username: "whitespace497",
      image: profile3
    },
    {
      id: 3,
      name: "Albert Flores",
      username: "happysnake594",
      image: profile5
    },
    {
      id: 4,
      name: "Marvin McKinney",
      username: "tinyleopard720",
      image:profile6
    },
    {
      id: 5,
      name: "Jerome Bell",
      username: "lazymeercat616",
      image:profile2
    },
  ];

  const pendingRequests = [
    {
      id: 1,
      name: "Savannah Nguyen",
      username: "angryswan732",
      image:profile1
    },
    {
      id: 2,
      name: "Annette Black",
      username: "beautifullion765",
      image:profile2
    },
    {
      id: 3,
      name: "Ronald Richards",
      username: "yellowmouse215",
      image: profile3
    },
  ];

  const handleReject = (id) => {
    console.log("Rejected:", id);
  };

  const handleAccept = (id) => {
    console.log("Accepted:", id);
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
              <div className="connections-page-grid">
                {activeConnections.map((connection) => (
                  <div key={connection.id} className="connections-page-item">
                    <div className="connections-page-container">
                      <img
                        src={connection.image}
                        alt={connection.name}
                        className="connections-page-avatar"
                      />
                      <div className="connection-name-content">
                        <h3>{connection.name}</h3>
                        <p>{connection.username}</p>
                      </div>
                    </div>
                    <button
                      className="connections-page-message-btn"
                      onClick={() => handleMessage(connection.id)}
                    >
                      <img src={messageIcon} alt="message" /> Message
                    </button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "incoming" && (
              <div className="connections-page-grid">
                {incomingRequests.map((request) => (
                  <div key={request.id} className="connections-page-item incoming-item">
                    <div className="connections-page-container">
                      <img
                        src={request.image}
                        alt={request.name}
                        className="connections-page-avatar"
                      />
                      <div className="connection-name-content">
                        <h3>{request.name}</h3>
                        <p>{request.username}</p>
                      </div>
                    </div>
                    <div className="incoming-actions">
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(request.id)}
                      >
                        <img src={wrongICon}></img> Reject
                      </button>
                      <button
                        className="accept-btn"
                        onClick={() => handleAccept(request.id)}
                      >
                        <img src={rightIcon}></img> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "pending" && (
              <div className="connections-page-grid">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="connections-page-item pending-item">
                    <div className="connections-page-container">
                      <img
                        src={request.image}
                        alt={request.name}
                        className="connections-page-avatar"
                      />
                      <div className="connection-name-content">
                        <h3>{request.name}</h3>
                        <p>{request.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
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