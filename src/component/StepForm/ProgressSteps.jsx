import React from 'react';
import "../../styles/style.css"

const ProgressSteps = ({ currentStep, totalSteps }) => {
  return (
    <div className="progress-steps">
      {[...Array(totalSteps)].map((_, index) => (
        <div key={index} className="step-item">
          <div className={`step-circle ${
            index + 1 === currentStep ? 'active' : 
            index + 1 < currentStep ? 'completed' : ''
          }`}>
            { String(index + 1).padStart(2, '0')}
          </div>
          {index < totalSteps - 1 && (
            <div className={`step-line ${index + 1 < currentStep ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;