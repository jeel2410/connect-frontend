import React, { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";
import { Link } from "react-router-dom";

const resourcesData = [
  {
    id: "getting-started",
    title: "Getting Started Guide",
    shortDescription: "A simple guide to setting up your Connect.in presence, exploring features and making your first connections.",
    icon: "/assets/images/getting-started.svg",
    buttonText: "Read Guide",
    heroTitle: "Welcome to Connect.in",
    heroCopy: "Start by setting up your profile and exploring the features that fit your goals. Connect.in can help you discover people, ask questions, share ideas, showcase a business and explore opportunities.",
    ctaText: "Discover Connect.in",
    ctaLink: "/",
    benefitsLead: "A simple guide to setting up your Connect.in presence, exploring features and making your first connections.",
    benefits: [
      { title: "Complete your profile", desc: "Add the information you want to share, such as your professional background, skills and interests." },
      { title: "Explore the platform", desc: "Visit People, Businesses, Jobs, Places and Ask to understand what is available to you." },
      { title: "Make relevant connections", desc: "Search for people and use recommendations where available to discover relevant members." },
      { title: "Take part in conversations", desc: "Ask a question, share a useful idea or respond to a discussion." }
    ],
    exampleTitle: "Example",
    exampleText: "A new member who wants to grow their professional network can add relevant skills to their profile, explore people in their industry and ask the community for career advice.",
    exampleImage: "/assets/images/getting-started.svg"
  },
  {
    id: "networking-tips",
    title: "Networking Tips",
    shortDescription: "Practical ideas for building useful professional relationships, participating in conversations and growing your network.",
    icon: "/assets/images/networking-tips.svg",
    buttonText: "View Tips",
    heroTitle: "Build Relationships, Not Just Contacts",
    heroCopy: "Effective networking starts with curiosity and mutual value. Use Connect.in to meet people with shared interests, learn from their experience and build relationships over time.",
    ctaText: "Discover Connect.in",
    ctaLink: "/",
    benefitsLead: "Practical ideas for building useful professional relationships, participating in conversations and growing your network.",
    benefits: [
      { title: "Be clear about your goals", desc: "Know whether you want to learn, find collaborators, explore a career move or grow a business." },
      { title: "Make your introduction useful", desc: "Explain what you do and the topics or skills you are interested in." },
      { title: "Ask thoughtful questions", desc: "Specific questions make it easier for people to offer relevant advice and recommendations." },
      { title: "Follow up respectfully", desc: "Thank people for useful responses and continue the conversation when there is a genuine reason." }
    ],
    exampleTitle: "Example",
    exampleText: "Instead of sending a generic connection request, a product designer might ask another designer about a tool or career challenge they have experience with, creating a more meaningful starting point.",
    exampleImage: "/assets/images/networking-tips.svg"
  },
  {
    id: "profile-optimization",
    title: "Profile Optimization",
    shortDescription: "Improve your Connect.in profile so people can understand your experience, skills and interests more clearly.",
    icon: "/assets/images/profile-optimization.svg",
    buttonText: "Optimize Profile",
    heroTitle: "Make Your Profile Clear and Useful",
    heroCopy: "A strong profile quickly tells people who you are, what you do and what kinds of connections may be relevant. Keep the information accurate, specific and up to date.",
    ctaText: "Discover Connect.in",
    ctaLink: "/",
    benefitsLead: "Improve your Connect.in profile so people can understand your experience, skills and interests more clearly.",
    benefits: [
      { title: "Use a clear introduction", desc: "Describe your role, area of expertise or professional interests in plain language." },
      { title: "Highlight relevant skills", desc: "Choose skills that reflect your actual experience and goals." },
      { title: "Add meaningful detail", desc: "Include useful context about projects, industries or interests where appropriate." },
      { title: "Review visibility settings", desc: "Check what is public and what is visible only to members or approved connections." }
    ],
    exampleTitle: "Example",
    exampleText: "A freelance developer can make their profile more useful by clearly listing their technologies, project focus and preferred types of collaboration, while keeping personal contact details private.",
    exampleImage: "/assets/images/profile-optimization.svg"
  },
  {
    id: "privacy-security",
    title: "Privacy & Security",
    shortDescription: "Understand profile visibility and practical steps for keeping your Connect.in account and information secure.",
    icon: "/assets/images/privacy-security.svg",
    buttonText: "Read Guide",
    heroTitle: "Stay in Control of Your Information",
    heroCopy: "Your online presence should reflect what you are comfortable sharing. Review the privacy controls available on Connect.in and be thoughtful about the information you publish.",
    ctaText: "Discover Connect.in",
    ctaLink: "/",
    benefitsLead: "Understand profile visibility and practical steps for keeping your Connect.in account and information secure.",
    benefits: [
      { title: "Review profile visibility", desc: "Understand whether your profile or content is private, member-visible or publicly discoverable." },
      { title: "Share only what is needed", desc: "Avoid posting sensitive personal information in profiles, questions or public discussions." },
      { title: "Protect account access", desc: "Use a strong, unique password where applicable and never share login codes." },
      { title: "Think before posting", desc: "Questions and posts intended for public viewing may be visible beyond your immediate connections." }
    ],
    exampleTitle: "Example",
    exampleText: "Before publishing a professional profile, review which fields will be visible publicly and remove private details such as personal phone numbers if they are not meant to be shared.",
    exampleImage: "/assets/images/privacy-security.svg"
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    shortDescription: "Find answers to common questions about Connect.in profiles, Ask, people discovery, businesses and visibility.",
    icon: "/assets/images/faq.svg",
    buttonText: "View FAQ",
    heroTitle: "Frequently Asked Questions",
    heroCopy: "Here are answers to common questions about using Connect.in. Feature availability and settings can vary, so check the options shown in your account.",
    ctaText: "Discover Connect.in",
    ctaLink: "/",
    benefitsLead: "Find answers to common questions about Connect.in profiles, Ask, people discovery, businesses and visibility.",
    benefits: [
      { title: "What is Connect.in?", desc: "Connect.in is a platform for discovering people, asking questions, sharing ideas and exploring professional and business opportunities." },
      { title: "How does Ask work?", desc: "Ask lets you pose questions to your connections. AI assistance may be available when the relevant option is enabled." },
      { title: "Can I control profile visibility?", desc: "Use the privacy and visibility settings available in your account. Do not assume a private profile is publicly searchable." },
      { title: "How can a business use Connect.in?", desc: "Businesses can present their business information and offerings and connect with relevant people where those features are available." }
    ],
    exampleTitle: "Example",
    exampleText: "If you cannot find a setting or feature, check the options in your account or contact Connect.in support for assistance.",
    exampleImage: "/assets/images/faq.svg"
  },
  {
    id: "contact-support",
    title: "Contact Support",
    shortDescription: "Need help with Connect.in? Find guidance on getting assistance with account access, profiles or platform features.",
    icon: "/assets/images/contact-support.svg",
    buttonText: "Get Help",
    heroTitle: "We're Here to Help",
    heroCopy: "If you have a question about using Connect.in or encounter a problem, use the official support channel provided on the Connect.in website or in your account.",
    ctaText: "Submit Inquiry",
    ctaLink: "/inquiry",
    benefitsLead: "Need help with Connect.in? Find guidance on getting assistance with account access, profiles or platform features.",
    benefits: [
      { title: "Describe the issue clearly", desc: "Explain what you were trying to do and what happened instead." },
      { title: "Include relevant details", desc: "Mention the page or feature involved and any visible error message." },
      { title: "Protect your account", desc: "Never include your password, one-time codes or other secret credentials in a support request." },
      { title: "Allow time for a response", desc: "Keep a note of your enquiry so you can follow up if needed." }
    ],
    exampleTitle: "Example",
    exampleText: "If a page is not loading, mention the page name, your device/browser and the steps that reproduce the problem. Avoid including sensitive account details.",
    exampleImage: "/assets/images/contact-support.svg"
  }
];

const Resources = () => {
  const [selectedResource, setSelectedResource] = useState(null);

  const handleSelectResource = (resource) => {
    setSelectedResource(resource);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearSelection = () => {
    setSelectedResource(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-container">
      <Header />
      <div className="resources-page">
        <div className="resources-container">
          {selectedResource ? (
            /* Resource Detail View */
            <div>
              <div className="resource-breadcrumb">
                <button onClick={handleClearSelection}>Home</button>
                <span className="sep">›</span>
                <button onClick={handleClearSelection}>Resources</button>
                <span className="sep">›</span>
                <span>{selectedResource.title}</span>
              </div>

              <section className="features-hero">
                <div>
                  <span className="eyebrow">CONNECT.IN RESOURCES</span>
                  <h1>{selectedResource.heroTitle}</h1>
                  <p className="hero-copy">{selectedResource.heroCopy}</p>
                  <Link to={selectedResource.ctaLink} className="primary-btn">
                    {selectedResource.ctaText} <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className="hero-visual">
                  <img src={selectedResource.icon} alt={selectedResource.title} />
                </div>
              </section>

              <section className="features-section">
                <h2>What You Need to Know</h2>
                <p className="section-lead">{selectedResource.benefitsLead}</p>
                <div className="benefit-grid">
                  {selectedResource.benefits.map((benefit, index) => (
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
                    <h2>{selectedResource.exampleTitle}</h2>
                    <p>{selectedResource.exampleText}</p>
                    <button onClick={handleClearSelection} className="resource-btn">
                      Back to Resources <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <div className="example-visual">
                    <img src={selectedResource.exampleImage} alt={selectedResource.title} />
                  </div>
                </div>
              </section>

              <section className="features-section">
                <h2>Explore Other Resources</h2>
                <div className="resource-links">
                  <button onClick={handleClearSelection} style={{ fontWeight: 600 }}>
                    ← All Resources
                  </button>
                  {resourcesData
                    .filter((r) => r.id !== selectedResource.id)
                    .map((r) => (
                      <button key={r.id} onClick={() => handleSelectResource(r)}>
                        {r.title}
                      </button>
                    ))}
                </div>
              </section>
            </div>
          ) : (
            /* Main Resources Grid View */
            <div>
              <div className="resources-page-intro">
                <h1 className="resources-title">Resources</h1>
                <p className="resources-subtitle">
                  Helpful guides and answers to help you get more from Connect.in, build your network and use the platform with confidence.
                </p>
              </div>

              <div className="resources-grid">
                {resourcesData.map((resource) => (
                  <div
                    key={resource.id}
                    className="resource-card"
                    onClick={() => handleSelectResource(resource)}
                  >
                    <img
                      className="resource-icon"
                      src={resource.icon}
                      alt={resource.title}
                      width="82"
                      height="64"
                    />
                    <h2 className="resource-card-title">{resource.title}</h2>
                    <p className="resource-card-description">{resource.shortDescription}</p>
                    <button className="resource-btn">
                      {resource.buttonText} <span aria-hidden="true">→</span>
                    </button>
                  </div>
                ))}
              </div>

              <section className="network-cta-banner">
                <div>
                  <h2>Need help finding your way?</h2>
                  <p>
                    Explore the guides above or contact the official Connect.in support channel for assistance with your account or a platform feature.
                  </p>
                  <Link to="/inquiry" className="primary-btn">
                    Get Support <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div>
                  <img
                    className="network-cta-image"
                    src="/assets/images/contact-support.svg"
                    alt="Contact Support"
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

export default Resources;
