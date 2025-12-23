import React, { useState } from "react";
import "../../src/styles/style.css"
import ProgressSteps from "../../src/component/StepForm/ProgressSteps";
import FormNavigation from "../../src/component/StepForm/FormNavigation";
import Step1 from "../../src/component/StepForm/Step1"
import Step2 from "../../src/component/StepForm/Step2";
import Step3 from "../../src/component/StepForm/Step3";

import Step4 from "../../src/component/StepForm/Step4";
import Step5 from "../../src/component/StepForm/Step5";
import Step6 from "../../src/component/StepForm/Step6";
import Step7 from "../../src/component/StepForm/Step7";
import AuthImage from "../component/AuthImage";
import logo from "../../src/assets/image/connect_logo.png";

const Profileverification = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const totalSteps = 7;

  const updateData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Form submitted successfully!");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 data={formData} updateData={updateData} />;
      case 2:
        return <Step2 data={formData} updateData={updateData} />;
      case 3:
        return <Step3 data={formData} updateData={updateData} />;
      case 4:
        return <Step4 data={formData} updateData={updateData} />;
      case 5:
        return <Step5 data={formData} updateData={updateData} />;
      case 6:
        return <Step6 data={formData} updateData={updateData} />;
      case 7:
        return <Step7 data={formData} />;
      default:
        return;
    }
  };

  return (
    <div className="verification-wrapper">
      <AuthImage></AuthImage>

      <div className="right-side">
        <div className="container">
          <div className="form-card">
            <div className="form-header">
              <img src={logo} className="logo-image"></img>
              <ProgressSteps
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            </div>

            <div className="form-content">{renderStep()}</div>

            <FormNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={nextStep}
              onPrevious={prevStep}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profileverification;
