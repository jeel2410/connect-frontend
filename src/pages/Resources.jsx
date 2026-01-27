import React from "react";
import Header from "../component/Header";
import "../styles/style.css";
import Footer from "../component/Footer";

const Resources = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="resources-page">
        <div className="resources-container">
          <h1 className="resources-title">Resources</h1>
          <p className="resources-subtitle">
            Access helpful resources to enhance your networking experience and professional growth.
          </p>
          
          <div className="resources-grid">
            <div className="resource-card">
              <h3 className="resource-card-title">Getting Started Guide</h3>
              <p className="resource-card-description">
                Learn how to set up your profile, make connections, and get the most out of Connect.in.
              </p>
              <button className="resource-card-button">Read Guide</button>
            </div>
            
            <div className="resource-card">
              <h3 className="resource-card-title">Networking Tips</h3>
              <p className="resource-card-description">
                Best practices for building meaningful professional relationships and expanding your network.
              </p>
              <button className="resource-card-button">View Tips</button>
            </div>
            
            <div className="resource-card">
              <h3 className="resource-card-title">Profile Optimization</h3>
              <p className="resource-card-description">
                Tips and tricks to make your profile stand out and attract the right connections.
              </p>
              <button className="resource-card-button">Learn More</button>
            </div>
            
            <div className="resource-card">
              <h3 className="resource-card-title">Privacy & Security</h3>
              <p className="resource-card-description">
                Understand how we protect your data and maintain your privacy on our platform.
              </p>
              <button className="resource-card-button">Read Policy</button>
            </div>
            
            <div className="resource-card">
              <h3 className="resource-card-title">FAQ</h3>
              <p className="resource-card-description">
                Find answers to commonly asked questions about using Connect.in and its features.
              </p>
              <button className="resource-card-button">View FAQ</button>
            </div>
            
            <div className="resource-card">
              <h3 className="resource-card-title">Contact Support</h3>
              <p className="resource-card-description">
                Need help? Reach out to our support team for assistance with any questions or issues.
              </p>
              <button className="resource-card-button">Contact Us</button>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Resources;
