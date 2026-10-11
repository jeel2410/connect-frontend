import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";
import { Link } from "react-router-dom";

const privacySections = [
  {
    title: "1. Information We May Collect",
    content:
      "Depending on the features you use, information may include account and contact details, profile information, skills and interests, questions and posts you submit, business or job listing details, communications with support, and technical information such as device, browser, log and usage data."
  },
  {
    title: "2. How We Use Information",
    content:
      "Information may be used to create and manage accounts, display profiles and content according to visibility settings, provide people recommendations and platform features, respond to support requests, maintain security, prevent abuse, improve performance and meet legal obligations."
  },
  {
    title: "3. Profile Visibility and Public Content",
    content:
      "Some information may be visible to other members or the public depending on your settings and where you post it. Public pages may be discovered or cached by search engines and other services. Changing visibility or deleting content may not immediately remove copies held by third parties."
  },
  {
    title: "4. Questions, Recommendations and AI",
    content:
      "If you use AI-assisted features, relevant prompt or content information may be processed to generate a response or recommendation. Do not include sensitive personal information in questions unless the feature expressly supports it and you understand the consequences."
  },
  {
    title: "5. Cookies and Similar Technologies",
    content:
      "Connect.in may use essential cookies or similar technologies to support sign-in, security and preferences, and may use analytics or other technologies to enhance user experience."
  },
  {
    title: "6. When Information May Be Shared",
    content:
      "Information may be shared with other users according to your choices, service providers that help operate Connect.in, relevant parties when you choose to interact with them, or authorities where disclosure is legally required."
  },
  {
    title: "7. Retention and Security",
    content:
      "We implement appropriate technical and organisational safeguards to protect your personal information against unauthorised access, alteration or disclosure. Retention periods depend on account activity, legal requirements and operational needs."
  },
  {
    title: "8. Your Choices and Rights",
    content:
      "Depending on applicable law, you may be able to access or correct information, adjust profile visibility, request deletion, withdraw consent where processing relies on consent, or raise a privacy concern."
  },
  {
    title: "9. Children",
    content:
      "Connect.in is intended for users who meet the minimum legal age requirements for online networking. We do not knowingly collect personal information from individuals under the minimum age."
  },
  {
    title: "10. International Processing and Third-Party Links",
    content:
      "If information is processed or stored across regions, appropriate data protection arrangements apply. Connect.in may link to third-party websites or services; their privacy practices are governed by their own policies."
  },
  {
    title: "11. Changes to This Policy",
    content:
      "We may update this Policy as the platform or applicable requirements change. We will provide notice of material updates through the platform or on this page."
  },
  {
    title: "12. Contact the Privacy Team",
    content:
      "For questions about privacy practices or data rights, contact us at privacy@connect.in or submit an inquiry."
  }
];

const PrivacyPolicy = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="features-page">
        <div className="features-container">
          <div className="features-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <span>Privacy Policy</span>
          </div>

          <section className="features-hero">
            <div>
              <span className="eyebrow">CONNECT.IN PRIVACY</span>
              <h1>Privacy Policy</h1>
              <p className="hero-copy">
                This Policy explains how Connect.in may collect, use, disclose, store and protect information when you use the platform. Please review this policy to understand our data and privacy practices.
              </p>
              <p style={{ fontSize: "13px", color: "#7b8492" }}>
                Last updated: January 2025
              </p>
            </div>
            <div className="hero-visual">
              <img
                src="/assets/images/privacy-security.svg"
                alt="Illustration representing privacy and security"
              />
            </div>
          </section>

          <section className="features-section">
            {privacySections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: "28px" }}>
                <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "#071b43" }}>
                  {sec.title}
                </h2>
                <p className="section-lead" style={{ lineHeight: "1.7", color: "#596579" }}>
                  {sec.content}
                </p>
              </div>
            ))}

            <div className="feature-example" style={{ marginTop: "40px" }}>
              <div>
                <h2>Review Account Settings</h2>
                <p>
                  You can manage your visibility, profile preferences, and communication options anytime within your Connect.in account settings.
                </p>
                <Link to="/inquiry" className="primary-btn">
                  Contact Privacy Team <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="example-visual">
                <img
                  src="/assets/images/profile-optimization.svg"
                  alt="Illustration representing reviewing account settings"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
