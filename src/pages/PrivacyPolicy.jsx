import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";

const PrivacyPolicy = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-last-updated">Last Updated: January 2025</p>
          
          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-section-title">1. Introduction</h2>
              <p className="legal-text">
                Welcome to Connect.in. We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                platform and services.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">2. Information We Collect</h2>
              <p className="legal-text">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="legal-list">
                <li>Personal identification information (name, email address, phone number)</li>
                <li>Profile information (age, gender, location, skills, interests, habits)</li>
                <li>Professional information (industry, company, work experience)</li>
                <li>Content you post or share on our platform</li>
                <li>Messages and communications with other users</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">3. How We Use Your Information</h2>
              <p className="legal-text">
                We use the information we collect to:
              </p>
              <ul className="legal-list">
                <li>Provide, maintain, and improve our services</li>
                <li>Facilitate connections between users</li>
                <li>Send you notifications and updates</li>
                <li>Personalize your experience on our platform</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">4. Information Sharing</h2>
              <p className="legal-text">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="legal-list">
                <li>With other users as part of the platform's core functionality</li>
                <li>With service providers who assist us in operating our platform</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">5. Data Security</h2>
              <p className="legal-text">
                We implement appropriate technical and organizational measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
                Internet is 100% secure.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">6. Your Rights</h2>
              <p className="legal-text">
                You have the right to:
              </p>
              <ul className="legal-list">
                <li>Access and update your personal information</li>
                <li>Delete your account and personal information</li>
                <li>Opt-out of certain communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">7. Contact Us</h2>
              <p className="legal-text">
                If you have any questions about this Privacy Policy, please contact us at privacy@connect.in
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
