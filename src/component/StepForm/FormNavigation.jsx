import React from 'react';
import "../../styles/style.css"

const FormNavigation = ({ currentStep, totalSteps, onNext, onPrevious, onSubmit, loading, isNextDisabled, showSkip, onSkip }) => {
  return (
    <div className="form-navigation-wrapper">
      <div className={`form-navigation ${currentStep === totalSteps ? "single-btn" : ""}`}>
        {currentStep > 1 && (
          <button onClick={onPrevious} className="btn btn-secondary" disabled={loading}>
            Back
          </button>
        )}
        {currentStep < totalSteps ? (
          <button
            onClick={onNext}
            className="btn btn-primary"
            disabled={loading || isNextDisabled}
            title={isNextDisabled ? "Please verify your email address to proceed" : ""}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              "Next"
            )}
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
      {/* {showSkip && (
        <div className="skip-dashboard-container" style={{ width: "100%", textAlign: "center", marginTop: "4px", marginBottom: "16px" }}>
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#1A56DB",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'Inter', sans-serif",
              textDecoration: "underline",
              padding: "6px 12px"
            }}
          >
            Skip to Dashboard
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      )} */}
    </div>
  );
};

export default FormNavigation;