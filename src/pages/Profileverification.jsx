import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
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
import { getCookie, setCookie, isAuthenticated } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Profileverification = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const totalSteps = 7;

  // Redirect if profile is already complete
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get phone number from location state or localStorage
  const phoneNumber = location.state?.phoneNumber || localStorage.getItem("phoneNumber") || "";

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    mobileNumber: Yup.string().required("Mobile number is required"),
    fullName: Yup.string().required("Full name is required").min(2, "Full name must be at least 2 characters"),
    city: Yup.string().required("City is required"),
    religion: Yup.string().required("Religion is required"),
    maritalStatus: Yup.string().required("Status is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    gender: Yup.string().required("Gender is required"),
    birthDate: Yup.string()
      .required("Date of birth is required")
      .test("age-18", "You must be at least 18 years old", function(value) {
        if (!value) return false;
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 18;
      }),
    language: Yup.string().required("Preferred language is required"),
    habits: Yup.array(),
    interest: Yup.array(),
    skill: Yup.array(),
    photo: Yup.mixed()
      .required("Profile image is required")
      .test("fileSize", "File size must be less than 5MB", (value) => {
        if (!value) return false;
        if (value instanceof File) {
          return value.size <= 5 * 1024 * 1024;
        }
        return true;
      }),
  });

  const formik = useFormik({
    initialValues: {
      mobileNumber: phoneNumber || "",
      fullName: "",
      city: "",
      religion: "",
      maritalStatus: "",
      email: "",
      gender: "",
      birthDate: "",
      language: "",
      habits: [],
      interest: [],
      skill: [],
      photo: null,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      try {
        // Get auth token from cookie
        const token = getCookie("authToken");
        if (!token) {
          throw new Error("Authentication required. Please login again.");
        }

        // Prepare FormData for file upload
        const formData = new FormData();
        
        // Add text fields
        formData.append("fullName", values.fullName);
        formData.append("city", values.city);
        formData.append("religion", values.religion);
        formData.append("status", values.maritalStatus);
        formData.append("gender", values.gender);
        formData.append("dateOfBirth", values.birthDate || "");
        formData.append("habits", (values.habits || []).join(","));
        formData.append("interests", (values.interest || []).join(","));
        formData.append("skills", (values.skill || []).join(","));
        formData.append("preferredLanguage", values.language);
        formData.append("email", values.email);

        // Add profile image if it's a file
        if (values.photo) {
          // If photo is base64, convert to blob
          if (typeof values.photo === 'string' && values.photo.startsWith('data:')) {
            const response = await fetch(values.photo);
            const blob = await response.blob();
            formData.append("profileImage", blob, "profile.jpg");
          } else if (values.photo instanceof File) {
            formData.append("profileImage", values.photo);
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to complete profile. Please try again.");
        }

        // Update isProfileComplete to true in cookies
        setCookie("isProfileComplete", "true", 7);

        // Success
        setSuccess("Profile completed successfully! Redirecting...");
        
        setTimeout(() => {
          navigate("/");
        }, 1500);

      } catch (err) {
        setApiError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Update formik values when phone number is available
  useEffect(() => {
    if (phoneNumber && !formik.values.mobileNumber) {
      formik.setFieldValue("mobileNumber", phoneNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  const updateData = async (field, value) => {
    if (field.startsWith("_touched_")) {
      const actualField = field.replace("_touched_", "");
      formik.setFieldTouched(actualField, true);
    } else {
      // Set the field value first
      formik.setFieldValue(field, value, false); // false = don't validate immediately
      
      // Immediately clear error if value is provided (for required fields)
      // This prevents showing error when a valid value is selected
      if (value && formik.errors[field]) {
        formik.setFieldError(field, undefined);
      }
      
      // Then validate to ensure the value is correct
      setTimeout(async () => {
        try {
          // Create updated values object with the new value
          const updatedValues = { ...formik.values, [field]: value };
          // Validate the field with updated values
          await validationSchema.validateAt(field, updatedValues);
          // If validation passes, ensure error is cleared
          if (formik.errors[field]) {
            formik.setFieldError(field, undefined);
          }
        } catch (error) {
          // Validation failed - only show error if field is touched
          if (formik.touched[field]) {
            formik.setFieldError(field, error.message);
          }
        }
      }, 0);
    }
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    const currentStepFields = getStepFields(currentStep);
    
    // Mark all fields in current step as touched to show errors
    currentStepFields.forEach(field => {
      formik.setFieldTouched(field, true);
    });

    // Validate each field in the current step using the full schema
    let hasErrors = false;
    const validationErrors = {};

    for (const field of currentStepFields) {
      try {
        // Validate this specific field using validateAt
        await validationSchema.validateAt(field, formik.values);
        // Clear error if validation passes
        if (formik.errors[field]) {
          formik.setFieldError(field, undefined);
        }
      } catch (error) {
        // Validation failed for this field
        hasErrors = true;
        validationErrors[field] = error.message;
        formik.setFieldError(field, error.message);
      }
    }

    // Only proceed if no errors and not on last step
    if (!hasErrors && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step) => {
    switch (step) {
      case 1:
        return ['fullName', 'city', 'religion', 'maritalStatus'];
      case 2:
        return ['email', 'gender', 'birthDate'];
      case 3:
        return ['language'];
      case 4:
        return ['habits'];
      case 5:
        return ['interest'];
      case 6:
        return ['skill'];
      case 7:
        return ['photo'];
      default:
        return [];
    }
  };

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} phoneNumber={phoneNumber} />;
      case 2:
        return <Step2 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
      case 3:
        return <Step3 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
      case 4:
        return <Step4 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
      case 5:
        return <Step5 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
      case 6:
        return <Step6 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
      case 7:
        return <Step7 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
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
              <img src={logo} className="logo-image" alt="Connect Logo"></img>
              <ProgressSteps
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            </div>

            <div className="form-content">
              {renderStep()}
              
              {/* API Error Message */}
              {apiError && (
                <div className="message-error">
                  {apiError}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="message-success">
                  {success}
                </div>
              )}
            </div>

            <FormNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={nextStep}
              onPrevious={prevStep}
              onSubmit={handleSubmit}
              loading={loading || formik.isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profileverification;
