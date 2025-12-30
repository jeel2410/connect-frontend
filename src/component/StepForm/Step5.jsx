import React from 'react';
import "../../styles/style.css"

const Step5 = ({ data, updateData, errors, touched }) => {
   const interestOption = [
     'Shopping',
     'Music',
     'Books',
     'Coffee',
     'Football',
     'Piano',
     'Submarining',
     'Science and tech'
  ];

  const toggleInterest = (interest) => {
    const currentInterest = data.interest || [];
    const newInterest = currentInterest.includes(interest)
      ? currentInterest.filter(i => i !== interest)
      : [...currentInterest, interest];
    updateData('interest', newInterest);
    updateData('_touched_interest', true);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">What's your interest?</h2> 
      <p className="step-description">Let others know about your habits</p> 
       
      <div className="form-group">
        <div className="habits-container">
          {interestOption.map((interest, index) => (
            <button
              key={index}
              type="button"
              className={`habit-tag ${(data.interest || []).includes(interest) ? 'selected' : ''}`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
      {touched?.interest && errors?.interest && (
        <div className="field-error-message">{errors.interest}</div>
      )}
    </div> 
  ); 
};

export default Step5;