import React from "react";
import Header from "../component/Header";
import "../styles/style.css";
import Footer from "../component/Footer"

const Features = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="features-page">
        <div className="features-container">
          <h1 className="features-title">Features</h1>
          <p className="features-subtitle">
            Discover the powerful features that make Connect.in the best platform for networking and connections.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-card-title">Smart Connections</h3>
              <p className="feature-card-description">
                Connect with professionals in your industry and build meaningful relationships.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3 className="feature-card-title">Professional Profiles</h3>
              <p className="feature-card-description">
                Create a comprehensive profile showcasing your skills, experience, and interests.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-card-title">Targeted Matching</h3>
              <p className="feature-card-description">
                Find connections based on industry, location, skills, and shared interests.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-card-title">Direct Messaging</h3>
              <p className="feature-card-description">
                Communicate seamlessly with your connections through our built-in chat system.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3 className="feature-card-title">Exclusive Offers</h3>
              <p className="feature-card-description">
                Access special offers and deals from our partner companies and services.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3 className="feature-card-title">Real-time Notifications</h3>
              <p className="feature-card-description">
                Stay updated with connection requests, messages, and important updates.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Features;
