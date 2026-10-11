import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";
import { Link } from "react-router-dom";

const termsSections = [
  {
    title: "1. About Connect.in",
    content:
      "Connect.in provides features that may include professional profiles, people discovery, questions and answers, sharing, business showcases, job listings, place listings and offers. Available features may change over time."
  },
  {
    title: "2. Your Account",
    content:
      "You are responsible for providing accurate information, keeping your sign-in credentials secure and activity carried out through your account. Do not impersonate another person or create an account using information you are not authorised to use."
  },
  {
    title: "3. Your Content",
    content:
      "You are responsible for the content you submit, including profile details, questions, answers, posts, images, business information and offers. You must have the rights and permissions needed to publish that content. Do not post unlawful, misleading, abusive, infringing, fraudulent or otherwise harmful material."
  },
  {
    title: "4. Public and Private Information",
    content:
      "Use the available visibility settings carefully. Content marked public, or submitted to a public area, may be viewable by people outside your immediate network and may be indexed by search engines. Do not publish information you intend to keep private."
  },
  {
    title: "5. Acceptable Use",
    content:
      "Do not use Connect.in to spam users, scrape information without permission, interfere with the service, bypass security controls, distribute malware, misrepresent offers or misuse another member's information. We may restrict content or accounts where reasonably necessary to protect users, the platform or compliance with law."
  },
  {
    title: "6. Questions and AI Assistance",
    content:
      "Questions, member responses and AI-generated responses are provided for general informational purposes. They may be incomplete or inaccurate and should be reviewed independently. Do not rely on them as a substitute for professional, medical, legal, financial or other specialist advice."
  },
  {
    title: "7. Businesses, Jobs and Offers",
    content:
      "Information about businesses, vacancies, places, products and promotions may be submitted by users or third parties. Verify important details directly with the relevant provider. Connect.in does not guarantee the accuracy, availability, quality or suitability of third-party listings or offers unless expressly stated."
  },
  {
    title: "8. Intellectual Property",
    content:
      "Connect.in and its branding, design and platform materials are protected by applicable intellectual-property laws. You retain rights you hold in your content, while granting Connect.in the limited permissions needed to host, display and operate that content as part of the service."
  },
  {
    title: "9. Availability and Changes",
    content:
      "We may update, suspend or discontinue features and may revise these Terms. Where required by law, we will provide notice of material changes. Continued use after revised Terms take effect may constitute acceptance where permitted by law."
  },
  {
    title: "10. Disclaimers and Liability",
    content:
      "To the extent permitted by applicable law, the service is provided on an “as available” basis. Nothing in these Terms excludes rights or liabilities that cannot legally be excluded."
  },
  {
    title: "11. Suspension or Termination",
    content:
      "You may stop using Connect.in at any time. We may restrict or terminate access for violations of these Terms, security concerns or legal requirements, subject to applicable law."
  },
  {
    title: "12. Contact and Governing Law",
    content:
      "For questions about these Terms, contact us at legal@connect.in or through our inquiry channel."
  }
];

const TermsOfUse = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="features-page">
        <div className="features-container">
          <div className="features-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <span>Terms of Use</span>
          </div>

          <section className="features-hero">
            <div>
              <span className="eyebrow">CONNECT.IN LEGAL</span>
              <h1>Terms of Use</h1>
              <p className="hero-copy">
                These Terms explain the basic rules for accessing and using Connect.in. By using the platform, you agree to follow applicable laws and these Terms. Please review them before using the service.
              </p>
              <p style={{ fontSize: "13px", color: "#7b8492" }}>
                Last updated: January 2025
              </p>
            </div>
            <div className="hero-visual">
              <img
                src="/assets/images/privacy-security.svg"
                alt="Illustration representing safe and responsible use"
              />
            </div>
          </section>

          <section className="features-section">
            {termsSections.map((sec, idx) => (
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
                <h2>Important Notice</h2>
                <p>
                  Ensure you review these terms periodically to stay informed about rules and guidelines for Connect.in.
                </p>
                <Link to="/inquiry" className="primary-btn">
                  Contact Support <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="example-visual">
                <img
                  src="/assets/images/getting-started.svg"
                  alt="Illustration representing terms checklist"
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

export default TermsOfUse;
