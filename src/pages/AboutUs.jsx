import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";

const AboutUs = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1 className="legal-title">About Us</h1>
          
          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-section-title">Our Mission</h2>
              <p className="legal-text">
                At Connect.in, we believe in the power of meaningful connections. Our mission is to create a platform 
                that brings professionals together, fostering relationships that drive personal and professional growth. 
                We strive to make networking accessible, authentic, and impactful for everyone.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">Who We Are</h2>
              <p className="legal-text">
                Connect.in is developed and operated by Connect.in Developers Pvt. Ltd., a company dedicated to building 
                innovative solutions that connect people. We are passionate about creating technology that makes it easier 
                for professionals to find and connect with like-minded individuals in their industry and beyond.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">What We Do</h2>
              <p className="legal-text">
                Our platform provides a comprehensive networking solution that includes:
              </p>
              <ul className="legal-list">
                <li>Professional profile creation and management</li>
                <li>Smart matching based on industry, skills, and interests</li>
                <li>Direct messaging and communication tools</li>
                <li>Exclusive offers and deals from partner companies</li>
                <li>Real-time notifications and updates</li>
                <li>Mobile applications for iOS and Android</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">Our Values</h2>
              <p className="legal-text">
                We are guided by the following core values:
              </p>
              <ul className="legal-list">
                <li><strong>Authenticity:</strong> We believe in genuine connections and authentic interactions</li>
                <li><strong>Privacy:</strong> We are committed to protecting your personal information and privacy</li>
                <li><strong>Innovation:</strong> We continuously improve our platform with new features and technologies</li>
                <li><strong>Inclusivity:</strong> We welcome professionals from all industries and backgrounds</li>
                <li><strong>Transparency:</strong> We are open and honest about how we operate and use your data</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">Our Team</h2>
              <p className="legal-text">
                Our team consists of talented developers, designers, and professionals who are passionate about creating 
                the best networking experience possible. We work tirelessly to ensure that Connect.in remains a safe, 
                user-friendly, and valuable platform for all our users.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">Contact Us</h2>
              <p className="legal-text">
                We'd love to hear from you! If you have any questions, suggestions, or feedback, please don't hesitate 
                to reach out to us at contact@connect.in
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
