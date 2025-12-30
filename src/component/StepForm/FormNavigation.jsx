import React from 'react';
import "../../styles/style.css"

const FormNavigation = ({ currentStep, totalSteps, onNext, onPrevious, onSubmit, loading }) => {
  return (
   <div className={`form-navigation ${currentStep === totalSteps ? "single-btn" : ""}`}>
      {currentStep > 1 && (
        <button onClick={onPrevious} className="btn btn-secondary" disabled={loading}>
          Back
        </button>
      )}
      {currentStep < totalSteps ? (
        <button onClick={onNext} className="btn btn-primary" disabled={loading}>
          Next
        </button>
      ) : (
        <button onClick={onSubmit} className="btn btn-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      )}
    </div>
  );
};

export default FormNavigation