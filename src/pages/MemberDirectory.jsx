import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../component/Header";
import Footer from "../component/Footer";
import API_BASE_URL from "../utils/config";
import { resolveImageUrl, getAvatar } from "../utils/avatarHelper";
import "../styles/style.css";

const ALPHABETS = [
  "ALL",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "#"
];

const MemberDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentLetter = searchParams.get("letter") || "A";
  const currentType = searchParams.get("type") || "all";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [countsByLetter, setCountsByLetter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `Member Directory (${currentLetter}) | Connect.in`;
  }, [currentLetter]);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams();
        if (currentLetter) query.append("letter", currentLetter);
        if (currentType && currentType !== "all") query.append("type", currentType);
        if (currentPage) query.append("page", currentPage);
        if (initialSearch) query.append("search", initialSearch);
        query.append("limit", "24");

        const response = await fetch(`${API_BASE_URL}/api/user/directory?${query.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch member directory");
        }
        const data = await response.json();
        if (data.success && data.data) {
          setMembers(data.data.members || []);
          setTotal(data.data.total || 0);
          setTotalPages(data.data.totalPages || 1);
          if (data.data.countsByLetter) {
            setCountsByLetter(data.data.countsByLetter);
          }
        }
      } catch (err) {
        console.error("Error loading directory:", err);
        setError("Unable to load directory at this time. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDirectory();
  }, [currentLetter, currentType, currentPage, initialSearch]);

  const handleLetterClick = (letter) => {
    const params = new URLSearchParams(searchParams);
    params.set("letter", letter);
    params.set("page", "1");
    setSearchParams(params);
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleTypeChange = (type) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", type);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 240, behavior: "smooth" });
  };

  return (
    <div className="page-container">
      <Header />
      <div className="directory-page">
        <div className="directory-container">
          <div className="features-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <span>Member Directory</span>
          </div>

          <div className="directory-header">
            <h1 className="directory-title">Member Directory</h1>
            <p className="directory-subtitle">
              Browse verified professionals and businesses across India on Connect.in from A to Z.
            </p>
          </div>

          {/* Alphabet Selector A - Z */}
          <nav className="alphabet-bar" aria-label="Alphabetical directory">
            {ALPHABETS.map((letter) => {
              const count = letter === "ALL" ? null : countsByLetter[letter];
              const isActive = currentLetter.toUpperCase() === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  className={`alphabet-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleLetterClick(letter)}
                  aria-label={`Show members starting with ${letter}`}
                >
                  <span>{letter}</span>
                  {typeof count === "number" && count > 0 && (
                    <span className="alphabet-count">{count}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Type Tabs & Search */}
          <div className="directory-controls">
            <div className="directory-tabs">
              <button
                type="button"
                className={`directory-tab ${currentType === "all" ? "active" : ""}`}
                onClick={() => handleTypeChange("all")}
              >
                All Members
              </button>
              <button
                type="button"
                className={`directory-tab ${currentType === "individual" ? "active" : ""}`}
                onClick={() => handleTypeChange("individual")}
              >
                Professionals
              </button>
              <button
                type="button"
                className={`directory-tab ${currentType === "business" ? "active" : ""}`}
                onClick={() => handleTypeChange("business")}
              >
                Businesses
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="directory-search-box">
              <input
                type="text"
                placeholder="Search by name, skill, or company..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="directory-search-input"
              />
              <button
                type="submit"
                style={{
                  background: "none",
                  border: "none",
                  color: "#d95510",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px"
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Status summary */}
          <div style={{ marginBottom: "20px", color: "#667085", fontSize: "14px" }}>
            Showing {members.length} {members.length === 1 ? "result" : "results"}
            {currentLetter !== "ALL" && (
              <span> starting with <strong>"{currentLetter}"</strong></span>
            )}
            {total > 0 && <span> (Total: {total})</span>}
          </div>

          {/* Members Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#667085" }}>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
                Loading directory members...
              </div>
            </div>
          ) : error ? (
            <div className="directory-empty">
              <p>{error}</p>
            </div>
          ) : members.length === 0 ? (
            <div className="directory-empty">
              <h3>No members found starting with "{currentLetter}"</h3>
              <p>Try exploring another alphabet letter or browse all members.</p>
              <button
                type="button"
                onClick={() => handleLetterClick("ALL")}
                className="primary-btn"
                style={{ marginTop: "16px" }}
              >
                Browse All Members
              </button>
            </div>
          ) : (
            <div className="directory-grid">
              {members.map((member) => {
                const isBiz = member.isBusinessProfile;
                const avatarUrl = isBiz
                  ? resolveImageUrl(member.profileImage) || "/assets/images/business.svg"
                  : resolveImageUrl(member.profileImage) || getAvatar(member.gender, member.dateOfBirth);

                const isHexId = (val) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val.trim());

                let individualSubtitle = "Professional";
                if (member.industry && !isHexId(member.industry)) {
                  individualSubtitle = member.industry;
                } else if (member.position && !isHexId(member.position)) {
                  individualSubtitle = member.company && !isHexId(member.company)
                    ? `${member.position} at ${member.company}`
                    : member.position;
                } else if (member.company && !isHexId(member.company)) {
                  individualSubtitle = member.company;
                }

                const subtitle = isBiz
                  ? member.businessTagline || member.categoryName || member.businessDescription || "Business"
                  : individualSubtitle;

                return (
                  <article key={member._id} className="member-directory-card">
                    <div className="member-card-header">
                      <img
                        src={avatarUrl}
                        alt={member.name}
                        className="member-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/images/profile.svg";
                        }}
                      />
                      <div className="member-info">
                        <h2 className="member-name" title={member.name}>
                          {member.name}
                        </h2>
                        <span
                          className={`member-badge ${
                            isBiz ? "badge-business" : "badge-individual"
                          }`}
                        >
                          {isBiz ? (member.verified ? "Verified Business" : "Business") : "Member"}
                        </span>
                      </div>
                    </div>

                    <p className="member-tagline">{subtitle}</p>

                    {member.cityName && (
                      <div className="member-meta-row">
                        <span aria-hidden="true">📍</span>
                        <span>{member.cityName}</span>
                        {member.categoryName && (
                          <>
                            <span>•</span>
                            <span>{member.categoryName}</span>
                          </>
                        )}
                      </div>
                    )}

                    {member.skills && member.skills.length > 0 && (
                      <div className="member-skills">
                        {member.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="member-skill-pill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Standard anchor tag link so Google and users can navigate to public profile */}
                    <a
                      href={`/profile/${member._id}`}
                      className="directory-view-profile-btn"
                    >
                      View Profile <span aria-hidden="true">→</span>
                    </a>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="directory-pagination" aria-label="Directory pagination">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                ← Previous
              </button>
              <span style={{ fontSize: "14px", color: "#667085", fontWeight: 600 }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MemberDirectory;
