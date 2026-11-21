import React from 'react';
import "../../styles/style.css";

const defaultIndividualTitles = [
  "Tell us about yourself",
  "Known Languages",
  "Chooses Hobbies",
  "Topics of Interest",
  "Add your Skills",
  "Add your Sports",
  "Select your Industry and Employer",
  "Upload Profile Photo"
];

const defaultBusinessTitles = [
  "Tell us about your business",
  "How can people reach you?",
  "Website & Social Links"
];

const ProgressSteps = ({ currentStep, totalSteps, isBusiness = false, stepTitles }) => {
  const titles = stepTitles || (isBusiness || totalSteps === 3 ? defaultBusinessTitles : defaultIndividualTitles);

  return (
    <div className="progress-steps">
      {[...Array(totalSteps)].map((_, index) => {
        const stepNum = index + 1;
        const title = titles[index] || `Step ${stepNum}`;
        return (
          <div
            key={index}
            className="step-item"
            title={title}
          >
            <div
              className={`step-circle ${
                stepNum === currentStep ? 'active' : 
                stepNum < currentStep ? 'completed' : ''
              }`}
              title={title}
              alt={title}
              aria-label={title}
            >
              { String(stepNum).padStart(2, '0')}
            </div>
            {index < totalSteps - 1 && (
              <div className={`step-line ${stepNum < currentStep ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressSteps;
