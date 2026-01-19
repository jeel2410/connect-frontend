import React, { useState, useEffect } from 'react';
import "../../styles/style.css"
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const Step6 = ({ data, updateData, errors, touched }) => {
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState("");

  // Fetch skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        setSkillsError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/skill`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch skills");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.skills) {
          setSkills(result.data.skills);
        } else {
          setSkills([]);
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
        setSkillsError("Failed to load skills");
        setSkills([]);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const toggleSkill = (skillName) => {
    const currentSkill = data.skill || [];
    const newSkill = currentSkill.includes(skillName)
      ? currentSkill.filter(s => s !== skillName)
      : [...currentSkill, skillName];
    updateData('skill', newSkill);
    updateData('_touched_skill', true);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">What's your Skills?</h2> 
      <p className="step-description">Let others know about your habits</p> 
       
      <div className="form-group">
        <div className="habits-container">
          {loadingSkills ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading skills...
            </div>
          ) : skillsError ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
              {skillsError}
            </div>
          ) : skills.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No skills available
            </div>
          ) : (
            skills.map((skill) => (
              <button
                key={skill._id}
                type="button"
                className={`habit-tag ${(data.skill || []).includes(skill.name) ? 'selected' : ''}`}
                onClick={() => toggleSkill(skill.name)}
              >
                {skill.name.charAt(0).toUpperCase() + skill.name.slice(1)}
              </button>
            ))
          )}
        </div>
      </div>
      {touched?.skill && errors?.skill && (
        <div className="field-error-message">{errors.skill}</div>
      )}
    </div> 
  ); 
};

export default Step6;