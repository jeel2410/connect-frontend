
import React from 'react';
import "../../styles/style.css"

const FormNavigation = ({ currentStep, totalSteps, onNext, onPrevious, onSubmit }) => {
  return (
   <div className={`form-navigation ${currentStep === totalSteps ? "single-btn" : ""}`}>
      {currentStep > 1 && (
        <button onClick={onPrevious} className="btn btn-secondary">
          Back
        </button>
      )}
      {currentStep < totalSteps ? (
        <button onClick={onNext} className="btn btn-primary">
          Next
        </button>
      ) : (
        <button onClick={onSubmit} className="btn btn-submit">
          Submit
        </button>
      )}
    </div>
  );
};

export default FormNavigation