import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";

const CookiePolicy = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1 className="legal-title">Cookie Policy</h1>
          <p className="legal-last-updated">Last Updated: January 2025</p>
          
          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-section-title">1. What Are Cookies</h2>
              <p className="legal-text">
                Cookies are small text files that are placed on your device when you visit a website. They are widely 
                used to make websites work more efficiently and provide information to the website owners. Cookies allow 
                a website to recognize your device and remember information about your visit.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">2. How We Use Cookies</h2>
              <p className="legal-text">
                Connect.in uses cookies to enhance your experience on our platform. We use cookies for the following purposes:
              </p>
              <ul className="legal-list">
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</li>
                <li><strong>Authentication Cookies:</strong> These cookies help us remember your login status and keep you logged in as you navigate through our platform.</li>
                <li><strong>Preference Cookies:</strong> These cookies remember your preferences and settings to provide you with a personalized experience.</li>
                <li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                <li><strong>Functional Cookies:</strong> These cookies enable enhanced functionality and personalization, such as remembering your language preferences.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">3. Types of Cookies We Use</h2>
              <p className="legal-text">
                We use both session cookies and persistent cookies:
              </p>
              <ul className="legal-list">
                <li><strong>Session Cookies:</strong> These are temporary cookies that are deleted when you close your browser. They are used to maintain your session while you navigate our platform.</li>
                <li><strong>Persistent Cookies:</strong> These cookies remain on your device for a set period or until you delete them. They help us remember your preferences and improve your experience.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">4. Third-Party Cookies</h2>
              <p className="legal-text">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics 
                of the platform, deliver advertisements, and so on. These third-party cookies are governed by the 
                respective privacy policies of those third parties.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">5. Managing Cookies</h2>
              <p className="legal-text">
                You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you 
                can usually modify your browser settings to decline cookies if you prefer. However, if you choose to 
                disable cookies, some features of our platform may not function properly.
              </p>
              <p className="legal-text">
                You can manage cookies through your browser settings. Each browser is different, so check the "Help" 
                menu of your browser to learn how to change your cookie preferences.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">6. Updates to This Policy</h2>
              <p className="legal-text">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
                new Cookie Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">7. Contact Us</h2>
              <p className="legal-text">
                If you have any questions about our use of cookies, please contact us at privacy@connect.in
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
