import React from "react";
import Header from "../component/Header";
import "../styles/style.css";
import Footer from "../component/Footer"

const DownloadApp = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="download-app-page">
        <div className="download-app-container">
          <h1 className="download-app-title">Download Our App</h1>
          <p className="download-app-subtitle">
            Stay connected on the go! Download the Connect.in mobile app for iOS and Android.
          </p>
          
          <div className="download-app-content">
            <div className="download-app-features">
              <h2 className="download-app-section-title">App Features</h2>
              <ul className="download-app-features-list">
                <li>✅ Connect with professionals anytime, anywhere</li>
                <li>✅ Receive instant notifications for messages and requests</li>
                <li>✅ Browse and apply for exclusive offers on the go</li>
                <li>✅ Chat with your connections in real-time</li>
                <li>✅ Update your profile and view others' profiles</li>
                <li>✅ Access all features from your mobile device</li>
              </ul>
            </div>
            
            <div className="download-app-buttons">
              <div className="download-app-button-group">
                <h3 className="download-app-button-title">Download for iOS</h3>
                <button className="download-app-button ios-button">
                  <span className="download-app-button-icon">📱</span>
                  <div className="download-app-button-text">
                    <span className="download-app-button-small">Download on the</span>
                    <span className="download-app-button-large">App Store</span>
                  </div>
                </button>
              </div>
              
              <div className="download-app-button-group">
                <h3 className="download-app-button-title">Download for Android</h3>
                <button className="download-app-button android-button">
                  <span className="download-app-button-icon">🤖</span>
                  <div className="download-app-button-text">
                    <span className="download-app-button-small">Get it on</span>
                    <span className="download-app-button-large">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="download-app-qr">
              <h3 className="download-app-qr-title">Scan QR Code</h3>
              <div className="download-app-qr-placeholder">
                <p>QR Code Placeholder</p>
                <p style={{ fontSize: '12px', color: '#777E90', marginTop: '8px' }}>
                  Scan with your phone to download
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default DownloadApp;
