import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";

const TermsOfUse = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1 className="legal-title">Terms of Use</h1>
          <p className="legal-last-updated">Last Updated: January 2025</p>
          
          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-section-title">1. Acceptance of Terms</h2>
              <p className="legal-text">
                By accessing and using Connect.in, you accept and agree to be bound by the terms and provision of this 
                agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">2. Use License</h2>
              <p className="legal-text">
                Permission is granted to temporarily use Connect.in for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="legal-list">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on Connect.in</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">3. User Accounts</h2>
              <p className="legal-text">
                To access certain features of our platform, you must register for an account. You agree to:
              </p>
              <ul className="legal-list">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for activities that occur under your account</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">4. User Conduct</h2>
              <p className="legal-text">
                You agree not to use the platform to:
              </p>
              <ul className="legal-list">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in spam, phishing, or other fraudulent activities</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">5. Content Ownership</h2>
              <p className="legal-text">
                You retain ownership of any content you post on Connect.in. By posting content, you grant us a worldwide, 
                non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the 
                operation of our platform.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">6. Termination</h2>
              <p className="legal-text">
                We may terminate or suspend your account and access to the platform immediately, without prior notice, for 
                conduct that we believe violates these Terms of Use or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">7. Limitation of Liability</h2>
              <p className="legal-text">
                Connect.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use of or inability to use the platform.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">8. Contact Information</h2>
              <p className="legal-text">
                If you have any questions about these Terms of Use, please contact us at legal@connect.in
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
