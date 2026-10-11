import React, { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";
import { Link } from "react-router-dom";

const featuresData = [
  {
    id: "ai-people-discovery",
    title: "AI-Powered People Discovery",
    shortDescription: "Discover relevant people based on your questions, skills, industry, interests and location.",
    icon: "/assets/images/people.svg",
    heroCopy: "Finding the right person can make all the difference. Connect.in helps you discover people who may be relevant to your goals, interests and questions.",
    ctaText: "Discover People",
    ctaLink: "/",
    benefits: [
      { title: "Relevant recommendations", desc: "Explore people based on details such as skills, industry, interests and location." },
      { title: "People who can help", desc: "Find professionals whose experience may relate to the guidance or support you need." },
      { title: "Discover beyond your network", desc: "Come across people you might not otherwise find through your existing connections." },
      { title: "Turn discovery into connections", desc: "Move from finding a relevant person to starting a conversation or building a professional relationship." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "You are a software developer exploring a move into product management. Ask for guidance and discover product professionals who may be able to share useful perspectives.",
    exampleImage: "/assets/images/ask.svg"
  },
  {
    id: "ask-questions",
    title: "Ask Your Connections",
    shortDescription: "Ask questions, seek advice, get recommendations and discover people who may be able to help.",
    icon: "/assets/images/ask.svg",
    heroCopy: "A question can open the door to a useful answer, a fresh perspective or a new connection. Ask lets you reach out to your connections and invite responses from people in your network.",
    ctaText: "Ask a Question",
    ctaLink: "/",
    benefits: [
      { title: "Ask for advice", desc: "Get perspectives on career choices, business challenges, skills and everyday decisions." },
      { title: "Get AI assistance", desc: "Choose an AI response when available to help you explore a question." },
      { title: "Find relevant people", desc: "Discover people whose skills or experience may be useful for your question." },
      { title: "Start conversations", desc: "Use questions to encourage discussion, recommendations and helpful introductions." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "A business owner asks, “Can anyone recommend a reliable digital marketing expert in Chennai?” Connections can share recommendations and the asker can discover relevant professionals.",
    exampleImage: "/assets/images/ask.svg"
  },
  {
    id: "professional-profiles",
    title: "Professional Profiles",
    shortDescription: "Showcase your skills, experience, interests and professional identity.",
    icon: "/assets/images/profile.svg",
    heroCopy: "Your profile introduces you to the Connect.in community. Present your professional background, skills and interests so people can understand what you do and what you care about.",
    ctaText: "Build Your Profile",
    ctaLink: "/",
    benefits: [
      { title: "Showcase your expertise", desc: "Highlight skills, experience and professional strengths." },
      { title: "Express your interests", desc: "Help others understand the topics and industries that matter to you." },
      { title: "Build your presence", desc: "Create a useful professional introduction in one place." },
      { title: "Choose your visibility", desc: "Use the privacy and visibility options available to you to control what you share." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "A freelance designer highlights branding, logo design and digital illustration experience so potential collaborators can better understand their work.",
    exampleImage: "/assets/images/profile.svg"
  },
  {
    id: "business-showcase",
    title: "Business Showcase",
    shortDescription: "Present your business, products and services and connect with potential customers and partners.",
    icon: "/assets/images/business.svg",
    heroCopy: "Give people a clearer picture of your business. Use Connect.in to introduce what you offer, explain your services and build relationships with people who may be interested.",
    ctaText: "Showcase Your Business",
    ctaLink: "/",
    benefits: [
      { title: "Present your business", desc: "Share your business identity and a clear description of what you do." },
      { title: "Show products and services", desc: "Help visitors understand your offerings and areas of expertise." },
      { title: "Reach relevant audiences", desc: "Build awareness among people who may have an interest in your category or services." },
      { title: "Start business conversations", desc: "Use questions and connections to understand needs and explore potential collaborations." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "An interior design business showcases its services and asks connections whether they are planning a home or office renovation, opening the door to relevant conversations.",
    exampleImage: "/assets/images/business.svg"
  },
  {
    id: "jobs-careers",
    title: "Jobs & Career Opportunities",
    shortDescription: "Explore career opportunities and connect with professionals who can help you grow.",
    icon: "/assets/images/jobs.svg",
    heroCopy: "Career growth is about finding opportunities and learning from people. Connect.in brings job discovery together with professional networking and career conversations.",
    ctaText: "Explore Jobs",
    ctaLink: "/",
    benefits: [
      { title: "Explore opportunities", desc: "Find job listings available through Connect.in." },
      { title: "Learn from professionals", desc: "Ask people in your target industry about roles, skills and career paths." },
      { title: "Discover new directions", desc: "Explore roles and industries you may not have considered." },
      { title: "Build your professional presence", desc: "Use your profile to communicate your experience and interests." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "A graduate looking for a data analyst role can explore relevant jobs, ask which skills employers value and connect with experienced data professionals.",
    exampleImage: "/assets/images/jobs.svg"
  },
  {
    id: "share-community-pulse",
    title: "Share & Community Pulse",
    shortDescription: "Share ideas, discover discussions and engage with people who share your interests.",
    icon: "/assets/images/share.svg",
    heroCopy: "Ideas become more useful when people exchange perspectives. Share updates, experiences and insights, and discover conversations taking place around your interests.",
    ctaText: "Explore Community Pulse",
    ctaLink: "/",
    benefits: [
      { title: "Share ideas and updates", desc: "Publish thoughts, experiences, achievements and useful information." },
      { title: "Discover conversations", desc: "Explore discussions and topics that interest you." },
      { title: "Engage with others", desc: "Respond to posts and exchange perspectives with the community." },
      { title: "Build your voice", desc: "Contribute thoughtful content and develop your presence on the platform." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "A marketing professional shares observations about AI in advertising. Other members contribute their experiences, creating a useful discussion and opportunities to connect.",
    exampleImage: "/assets/images/share.svg"
  },
  {
    id: "places-services",
    title: "Discover Places & Services",
    shortDescription: "Find businesses, services and places that may match your needs and location.",
    icon: "/assets/images/places.svg",
    heroCopy: "When you need a place to visit or a service to consider, Connect.in helps you explore listings and discover businesses that may be relevant to your needs.",
    ctaText: "Discover Places",
    ctaLink: "/",
    benefits: [
      { title: "Explore categories", desc: "Browse places and businesses by category where listings are available." },
      { title: "Find local options", desc: "Discover businesses and services in relevant locations." },
      { title: "Ask for recommendations", desc: "Get suggestions from people in your network." },
      { title: "Connect with providers", desc: "Explore business information and reach out where contact options are provided." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "You are planning to renovate your apartment. Explore interior design businesses and ask your connections for recommendations before contacting a provider.",
    exampleImage: "/assets/images/places.svg"
  },
  {
    id: "smart-connections",
    title: "Smart Connections",
    shortDescription: "Build meaningful relationships with professionals, businesses and like-minded people.",
    icon: "/assets/images/connections.svg",
    heroCopy: "Networking is not just about collecting contacts. It is about finding people with shared interests, relevant experience or complementary goals and building relationships over time.",
    ctaText: "Start Connecting",
    ctaLink: "/",
    benefits: [
      { title: "Connect by industry", desc: "Discover professionals working in fields that interest you." },
      { title: "Connect by skills and interests", desc: "Find people with relevant expertise or shared interests." },
      { title: "Expand your network", desc: "Explore people beyond your existing circle." },
      { title: "Create opportunities", desc: "Build relationships that may lead to learning, collaboration or business conversations." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "A startup founder wants to meet technology professionals, marketers and other entrepreneurs. Connect.in can help them discover relevant people and begin building a useful network.",
    exampleImage: "/assets/images/connections.svg"
  },
  {
    id: "exclusive-offers",
    title: "Exclusive Offers",
    shortDescription: "Discover deals, discounts and attractive offers from businesses on Connect.in.",
    icon: "/assets/images/offers.svg",
    heroCopy: "Discover offers from businesses and explore products or services that may be useful to you. Connect.in gives participating businesses another way to present promotions to their audience.",
    ctaText: "Explore Offers",
    ctaLink: "/offer",
    benefits: [
      { title: "Discover deals", desc: "Explore offers and promotions published by participating businesses." },
      { title: "Browse different categories", desc: "Find offers across the categories available on Connect.in." },
      { title: "Discover new businesses", desc: "Learn about products and services you may not have come across before." },
      { title: "Review offer details", desc: "Check the terms and details provided by the business before deciding." }
    ],
    exampleTitle: "A Real-Life Example",
    exampleText: "A member discovers a promotional offer, reviews its benefits and terms, and decides whether it suits their needs before contacting the business.",
    exampleImage: "/assets/images/offers.svg"
  }
];

const Features = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleSelectFeature = (feature) => {
    setSelectedFeature(feature);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearSelection = () => {
    setSelectedFeature(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-container">
      <Header />
      <div className="features-page">
        <div className="features-container">
          {selectedFeature ? (
            /* Detail View for selected Feature */
            <div>
              <div className="features-breadcrumb">
                <button onClick={handleClearSelection}>Home</button>
                <span className="sep">›</span>
                <button onClick={handleClearSelection}>Features</button>
                <span className="sep">›</span>
                <span>{selectedFeature.title}</span>
              </div>

              <section className="features-hero">
                <div>
                  <span className="eyebrow">CONNECT.IN FEATURES</span>
                  <h1>{selectedFeature.title}</h1>
                  <p className="hero-copy">{selectedFeature.heroCopy}</p>
                  <Link to={selectedFeature.ctaLink} className="primary-btn">
                    {selectedFeature.ctaText} <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className="hero-visual">
                  <img src={selectedFeature.icon} alt={selectedFeature.title} />
                </div>
              </section>

              <section className="features-section">
                <h2>How It Helps You</h2>
                <p className="section-lead">Explore practical ways Connect.in can support your goals.</p>
                <div className="benefit-grid">
                  {selectedFeature.benefits.map((benefit, index) => (
                    <article className="benefit-card" key={index}>
                      <div className="benefit-symbol" aria-hidden="true">✓</div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.desc}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="features-section">
                <div className="feature-example">
                  <div>
                    <h2>{selectedFeature.exampleTitle}</h2>
                    <p>{selectedFeature.exampleText}</p>
                    <Link to={selectedFeature.ctaLink} className="primary-btn">
                      {selectedFeature.ctaText} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  <div className="example-visual">
                    <img src={selectedFeature.exampleImage} alt={selectedFeature.title} />
                  </div>
                </div>
              </section>

              <section className="features-section">
                <h2>Explore More Connect.in Features</h2>
                <p className="section-lead">Discover other ways to build your network and find useful opportunities.</p>
                <div className="feature-nav">
                  <button onClick={handleClearSelection} style={{ fontWeight: 600 }}>
                    ← All Features
                  </button>
                  {featuresData
                    .filter((f) => f.id !== selectedFeature.id)
                    .map((f) => (
                      <button key={f.id} onClick={() => handleSelectFeature(f)}>
                        {f.title}
                      </button>
                    ))}
                </div>
              </section>
            </div>
          ) : (
            /* Main 9-Features Grid View */
            <div>
              <div className="features-page-intro">
                <h1 className="features-title">Features</h1>
                <p className="features-subtitle">
                  Discover the features that help you find people, ask questions, share ideas and explore opportunities on Connect.in.
                </p>
              </div>

              <div className="features-grid">
                {featuresData.map((feature) => (
                  <div
                    key={feature.id}
                    className="feature-card"
                    onClick={() => handleSelectFeature(feature)}
                  >
                    <img
                      className="feature-image"
                      src={feature.icon}
                      alt={feature.title}
                    />
                    <h2 className="feature-card-title">{feature.title}</h2>
                    <p className="feature-card-description">{feature.shortDescription}</p>
                    <span className="card-link">
                      Learn more <span aria-hidden="true">→</span>
                    </span>
                  </div>
                ))}
              </div>

              <section className="network-cta-banner">
                <div>
                  <h2>One platform. More ways to connect.</h2>
                  <p>
                    Discover people, exchange ideas, showcase your business and explore opportunities with Connect.in.
                  </p>
                  <Link to="/" className="primary-btn">
                    Explore Ask <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div>
                  <img
                    className="network-cta-image"
                    src="/assets/images/network-cta.svg"
                    alt="Network CTA"
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Features;
