import React from 'react';
import "../../styles/style.css"

const Step6 = ({ data, updateData }) => {
   const skillOption = [
     'Darlene Roberston',
     'Robert Fox',
     'Guy Hawkins',
     'Darrell Steward',
     'Albert',
     'Ronald Richards',
  ];

  const toggleSkill = (skill) => {
    const currentSkill = data.skill || [];
    const newSkill = currentSkill.includes(skill)
      ? currentSkill.filter(s => s !== skill)
      : [...currentSkill, skill];
    updateData('skill', newSkill);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">What's your interest?</h2> 
      <p className="step-description">Let others know about your habits</p> 
       
      <div className="form-group">
        <div className="habits-container">
          {skillOption.map((skill, index) => (
            <button
              key={index}
              type="button"
              className={`habit-tag ${(data.skill || []).includes(skill) ? 'selected' : ''}`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div> 
  ); 
};

export default Step6;