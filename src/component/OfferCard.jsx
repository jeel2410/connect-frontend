import React, { useState, useEffect } from "react";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

export default function OfferCard({ searchQuery = "" }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState({}); // Track active tab for each card: { cardId: 'features' | 'eligibility' }

  // Fetch cards from API
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError("");
        const token = getCookie("authToken");
        
        // Build query string with search parameter if provided
        const queryParams = new URLSearchParams();
        if (searchQuery && searchQuery.trim()) {
          queryParams.append("search", searchQuery.trim());
        }
        
        const url = `${API_BASE_URL}/api/list/cards${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch cards");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.cards) {
          setCards(result.data.cards);
        } else {
          setCards([]);
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
        setError("Failed to load cards. Please try again.");
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [searchQuery]);

  // Map card data to display format
  const mapCardToOffer = (card) => {
    // Extract bank name from card name (e.g., "HDFC Bank Classic Credit Card" -> "HDFC Bank")
    const nameParts = card.name.split(" ");
    const bankName = nameParts.length > 2 ? `${nameParts[0]} ${nameParts[1]}` : nameParts[0];
    const cardName = nameParts.slice(2).join(" ") || card.name;
    
    return {
      id: card._id,
      bank: bankName || card.name,
      img: card.logo_image || null,
      card: cardName || card.description || "",
      features: card.features || [],
      eligibles: card.eligibles || [],
      url: card.url || "#",
    };
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        Loading cards...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
        {error}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        No cards available
      </div>
    );
  }

  const offers = cards.map(mapCardToOffer);
  return (
    <div>
      <div className="offers-page-grid">
        {offers.map((offer) => (
          <div key={offer.id} className="offers-page-card">
            <div className="offers-page-card-header">
              <div className="offers-page-bank-info">
                {offer.img && (
                  <div className="offers-page-bank-icon">
                    <img 
                      src={offer.img} 
                      alt={offer.bank}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "center"
                      }}
                    />
                  </div>
                )}
                <div>
                  <h3>{offer.bank}</h3>
                  <p>{offer.card}</p>
                </div>
              </div>
              <a 
                href={offer.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="offers-page-apply-btn"
              >
                Apply Now
              </a>
            </div>

            <div className="offer-page-badge-contant">
              <button 
                className={`offers-page-discount-badge ${activeTab[offer.id] !== 'eligibility' ? 'active' : ''}`}
                onClick={() => setActiveTab(prev => ({ ...prev, [offer.id]: 'features' }))}
              >
                features & benefits
              </button>

              {offer.eligibles && offer.eligibles.length > 0 && (
                <div className="offers-page-eligibility">
                  <span 
                    className={`offers-page-eligibility-link ${activeTab[offer.id] === 'eligibility' ? 'active' : ''}`}
                    onClick={() => setActiveTab(prev => ({ ...prev, [offer.id]: 'eligibility' }))}
                    style={{ cursor: 'pointer' }}
                  >
                    Eligibility & Documents
                  </span>
                </div>
              )}
            </div>

            {/* Display Features or Eligibilities based on active tab */}
            {activeTab[offer.id] === 'eligibility' && offer.eligibles && offer.eligibles.length > 0 ? (
              <div className="offers-page-features">
                <h4>Eligibility & Documents</h4>
                <ul>
                  {offer.eligibles.map((eligible, index) => (
                    <li key={index}>{eligible}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="offers-page-features">
                <h4>Key Features</h4>
                <ul>
                  {offer.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
