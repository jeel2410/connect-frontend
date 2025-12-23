import React, { useState } from "react";
import { MapPin, Bell, Menu, User, X } from "lucide-react";
import logo from "../assets/image/connect_logo.png"
import location from "../assets/image/location.png";
import notification from "../assets/image/Notification.png";
import userIcon from "../assets/image/user_icon.png"
import "../styles/style.css"

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="Connect Logo"></img>
        </div>
        
        {/* Desktop Navigation */}
        <div className="header-right">
          <nav className="nav">
            <a href="/" className="nav-link active">
              Home
            </a>
            <a href="/offer" className="nav-link">
              Offers
            </a>
          </nav>
          <button className="location-btn">
            <div className="location-round">
               <img src={location} alt="Location"></img>
            </div>
            <span>Ahmedabad, Gujarat</span>
            <svg className="chevron" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button className="icon-btn">
            <img src={notification} alt="Notifications"></img>
          </button>
          <button className="profile-section">
            <Menu size={20} color="#777E90"/>
            <button className="profile-btn">
             <img src={userIcon} alt="User"></img>
          </button>
          </button>
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
              <a href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </a>
              <a href="/offer" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Offers
              </a>
            </nav>

            <div className="mobile-menu-actions">
              <button className="mobile-location-btn">
                <div className="location-round">
                  <img src={location} alt="Location"></img>
                </div>
                <span>Ahmedabad, Gujarat</span>
              </button>
              <div className="mobile-action-buttons">
                <button className="mobile-icon-btn">
                  <img src={notification} alt="Notifications"></img>
                </button>
                <button className="mobile-profile-btn">
                  <img src={userIcon} alt="User"></img>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
