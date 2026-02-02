import React, { useState, useEffect } from 'react';
import { Home, Mail, Linkedin, Twitter } from 'lucide-react';
import "../styles/style.css"
import logo from "../../src/assets/image/connect_black_logo.png"
import facebookIcon from "../../src/assets/image/social/facebook.png"
import twitterIcon from "../../src/assets/image/social/twitter.png"
import instagramIcon from "../../src/assets/image/social/instagram.png"
import linkedIcon from "../../src/assets/image/social/linkedin.png"
import { hasToken } from "../utils/auth";

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
  <footer className="footer-container">
  <div className="footer-content new-footer-layout">
    <div className="footer-logo">
      <img src={logo}></img>
    </div>
    <nav className="footer-nav center-nav">
      {isLoggedIn ? (
        <>
          <a href="/" className="footer-link">Home</a>
          <a href="/offer" className="footer-link">Offers</a>
        </>
      ) : (
        <>
          <a href="/features" className="footer-link">Features</a>
          <a href="/resources" className="footer-link">Resources</a>
          <a href="/download-app" className="footer-link">Download App</a>
        </>
      )}
    </nav>
    <div className="footer-bottom-row">
      <div className="left-section">
        <p className="copyright">
         copyright © 2026 <span className="highlight">Connect.in</span> All Rights Reserved
        </p>
       
      </div>
      <div className="legal-links">
          <a href="/privacy-policy" className="legal-link">Privacy Policy</a>
          <span className="separator">•</span>
          <a href="/terms-of-use" className="legal-link">Terms of Use</a>
          <span className="separator">•</span>
          <a href="/about-us" className="legal-link">About Us</a>
          <span className="separator">•</span>
          <a href="/cookie-policy" className="legal-link">Cookie Policy</a>
          <span className="separator">•</span>
          <a href="/inquiry" className="legal-link">Inquiry</a>
        </div>
      <div className="footer-social">
        <a className="social-icon"><img src={facebookIcon}></img></a>
        <a className="social-icon"><img src={twitterIcon}></img></a>
        <a className="social-icon"><img src={instagramIcon}></img></a>
         <a className="social-icon"><img src={linkedIcon}></img></a>
      </div>
    </div>

  </div>
</footer>

  );
};

export default Footer;