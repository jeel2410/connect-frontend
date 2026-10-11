import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";
import { Link } from "react-router-dom";

const DownloadApp = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="download-app-page">
        <div className="download-app-container">
          <div className="features-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <span>Download App</span>
          </div>

          <section className="features-hero">
            <div>
              <span className="eyebrow">CONNECT.IN MOBILE APP</span>
              <h1>Connect with people and opportunities, wherever you are.</h1>
              <p className="hero-copy">
                We’re working on the Connect.in mobile app for Android and Apple iOS. Soon, you’ll be able to discover relevant people, ask your connections questions, share ideas and explore professional and business opportunities from your phone.
              </p>
              <div className="download-badge-group">
                <span className="download-badge">
                  <span aria-hidden="true">▣</span> Android <span className="badge-tag">COMING SOON</span>
                </span>
                <span className="download-badge">
                  <span aria-hidden="true">▣</span> Apple iOS <span className="badge-tag">COMING SOON</span>
                </span>
              </div>
              <p className="download-subnote">
                The app is not available to download yet. Please check back for launch updates.
              </p>
            </div>
            <div className="hero-visual">
              <img
                src="/assets/images/download-app.svg"
                alt="Illustration of the upcoming Connect.in mobile app"
              />
            </div>
          </section>

          <section className="features-section">
            <h2>Connect.in, designed for your everyday network</h2>
            <p className="section-lead">
              The planned mobile experience will bring key Connect.in activities closer to you.
            </p>
            <div className="benefit-grid">
              <article className="benefit-card">
                <div className="benefit-symbol" aria-hidden="true">◎</div>
                <h3>Discover people</h3>
                <p>
                  Explore profiles and find people with relevant skills, interests and professional backgrounds.
                </p>
              </article>
              <article className="benefit-card">
                <div className="benefit-symbol" aria-hidden="true">?</div>
                <h3>Ask your connections</h3>
                <p>
                  Ask questions, exchange knowledge and learn from your network.
                </p>
              </article>
              <article className="benefit-card">
                <div className="benefit-symbol" aria-hidden="true">↗</div>
                <h3>Share ideas and updates</h3>
                <p>
                  Keep up with conversations, useful information and updates from your network.
                </p>
              </article>
              <article className="benefit-card">
                <div className="benefit-symbol" aria-hidden="true">◇</div>
                <h3>Explore opportunities</h3>
                <p>
                  Discover business showcases, jobs, places and offers available through Connect.in.
                </p>
              </article>
            </div>
          </section>

          <section className="features-section">
            <div className="feature-example">
              <div>
                <h2>Coming soon on Android and iOS</h2>
                <p>
                  We’re preparing the mobile experience. Until the app launches, you can continue exploring Connect.in through the website.
                </p>
                <Link to="/" className="primary-btn">
                  Explore Connect.in <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="example-visual">
                <img
                  src="/assets/images/download-app.svg"
                  alt="Connect.in app preview illustration"
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

export default DownloadApp;
