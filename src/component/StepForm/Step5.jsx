import React, { useState, useEffect } from 'react';
import "../../styles/style.css"
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const Step5 = ({ data, updateData, errors, touched }) => {
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState("");

  // Fetch interests from API
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoadingInterests(true);
        setInterestsError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/interest`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch interests");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.interests) {
          setInterests(result.data.interests);
        } else {
          setInterests([]);
        }
      } catch (err) {
        console.error("Error fetching interests:", err);
        setInterestsError("Failed to load interests");
        setInterests([]);
      } finally {
        setLoadingInterests(false);
      }
    };

    fetchInterests();
  }, []);

  const toggleInterest = (interestName) => {
    const currentInterest = data.interest || [];
    const newInterest = currentInterest.includes(interestName)
      ? currentInterest.filter(i => i !== interestName)
      : [...currentInterest, interestName];
    updateData('interest', newInterest);
    updateData('_touched_interest', true);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">What's your interest?</h2> 
      <p className="step-description">Let others know about your habits</p> 
       
      <div className="form-group">
        <div className="habits-container">
          {loadingInterests ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading interests...
            </div>
          ) : interestsError ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
              {interestsError}
            </div>
          ) : interests.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No interests available
            </div>
          ) : (
            interests.map((interest) => (
              <button
                key={interest._id}
                type="button"
                className={`habit-tag ${(data.interest || []).includes(interest.name) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest.name)}
              >
                {interest.name.charAt(0).toUpperCase() + interest.name.slice(1)}
              </button>
            ))
          )}
        </div>
      </div>
      {touched?.interest && errors?.interest && (
        <div className="field-error-message">{errors.interest}</div>
      )}
    </div> 
  ); 
};

export default Step5;