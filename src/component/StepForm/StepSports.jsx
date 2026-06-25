import React, { useState, useEffect } from 'react';
import "../../styles/style.css"
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const StepSports = ({ data, updateData, errors, touched }) => {
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const [sportsError, setSportsError] = useState("");

  // Fetch sports from API
  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoadingSports(true);
        setSportsError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/sport`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch sports");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.sports) {
          setSports(result.data.sports);
        } else {
          setSports([]);
        }
      } catch (err) {
        console.error("Error fetching sports:", err);
        setSportsError("Failed to load sports");
        setSports([]);
      } finally {
        setLoadingSports(false);
      }
    };

    fetchSports();
  }, []);

  const toggleSport = (sportName) => {
    const currentSports = data.sports || [];
    const newSports = currentSports.includes(sportName)
      ? currentSports.filter(s => s !== sportName)
      : [...currentSports, sportName];
    updateData('sports', newSports);
    updateData('_touched_sports', true);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">Add your Sports</h2> 
      <p className="step-description">Select the sports you play or follow to find like-minded people.</p> 
       
      <div className="form-group">
        <div className="habits-container">
          {loadingSports ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading sports...
            </div>
          ) : sportsError ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
              {sportsError}
            </div>
          ) : sports.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No sports available
            </div>
          ) : (
            sports.map((sport) => (
              <button
                key={sport._id}
                type="button"
                className={`habit-tag ${(data.sports || []).includes(sport.name) ? 'selected' : ''}`}
                onClick={() => toggleSport(sport.name)}
              >
                {sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
              </button>
            ))
          )}
        </div>
      </div>
      {touched?.sports && errors?.sports && (
        <div className="field-error-message">{errors.sports}</div>
      )}
    </div> 
  ); 
};

export default StepSports;
