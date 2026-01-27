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
import Step8 from "../../src/component/StepForm/Step8";
import AuthImage from "../component/AuthImage";
import logo from "../../src/assets/image/connect_logo.png";
import { getCookie, setCookie, isAuthenticated, hasToken } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Profileverification = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const totalSteps = 8;

  // Redirect if profile is already complete
  useEffect(() => {
    const checkProfileStatus = async () => {
      const token = getCookie("authToken");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      // Check actual profile completion status from backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile/progress`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.isProfileComplete) {
            // Profile is complete - redirect to home
            navigate("/", { replace: true });
            return;
          }
          // Profile not complete - stay on this page
        }
      } catch (error) {
        console.error("Error checking profile status:", error);
        // If error, allow user to continue on profile completion page
      }
    };

    checkProfileStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/user/profile/progress`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          return; // No saved progress or error
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const { lastCompletedStep, profile, isProfileComplete } = data.data;
          
          // If profile is complete, redirect
          if (isProfileComplete) {
            navigate("/", { replace: true });
            return;
          }
          
          // If profile exists, populate form with ALL saved data
          if (profile) {
            // Ensure we populate ALL fields from saved profile, not just empty ones
            formik.setValues({
              mobileNumber: phoneNumber || "",
              fullName: profile.fullName || "",
              city: profile.city || "",
              religion: profile.religion || "",
              maritalStatus: profile.status || "",
              email: profile.email || "",
              gender: profile.gender || "",
              birthDate: profile.dateOfBirth 
                ? new Date(profile.dateOfBirth).toISOString().split('T')[0] 
                : "",
              language: profile.preferredLanguage || "",
              habits: profile.habits || [],
              interest: profile.interests || [],
              skill: profile.skills || [],
              industry: profile.industry || "",
              company: profile.company || "",
              photo: profile.profileImage || null,
            });
            
            // Set current step to next incomplete step
            const nextStep = Math.min((lastCompletedStep || 0) + 1, totalSteps);
            setCurrentStep(nextStep);
            setPreviousStep(nextStep); // Initialize previousStep to current step
          }
        }
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    };
    
    loadSavedProgress();
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
    industry: Yup.string().required("Industry is required"),
    company: Yup.string(),
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
      industry: "",
      company: "",
      photo: null,
    },
    validationSchema: validationSchema,
    enableReinitialize: false, // Changed to false to maintain values when navigating
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
        formData.append("industry", values.industry || "");
        formData.append("company", values.company || "");

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

  // Helper function to extract step-specific data
  const getStepDataForSave = (stepNumber, values) => {
    const stepData = {};
    
    switch (stepNumber) {
      case 1:
        if (values.fullName) stepData.fullName = values.fullName;
        if (values.city) stepData.city = values.city;
        if (values.religion) stepData.religion = values.religion;
        if (values.maritalStatus) stepData.status = values.maritalStatus;
        break;
      case 2:
        if (values.email) stepData.email = values.email;
        if (values.gender) stepData.gender = values.gender;
        if (values.birthDate) stepData.dateOfBirth = values.birthDate;
        break;
      case 3:
        if (values.language) stepData.preferredLanguage = values.language;
        break;
      case 4:
        if (values.habits && values.habits.length > 0) {
          stepData.habits = values.habits;
        }
        break;
      case 5:
        if (values.interest && values.interest.length > 0) {
          stepData.interests = values.interest;
        }
        break;
      case 6:
        if (values.skill && values.skill.length > 0) {
          stepData.skills = values.skill;
        }
        break;
      case 7:
        if (values.industry) stepData.industry = values.industry;
        if (values.company) stepData.company = values.company;
        break;
      case 8:
        // Photo handled separately in saveStepData
        break;
      default:
        break;
    }
    
    return stepData;
  };

  // Save step data to backend
  const saveStepData = async (stepNumber) => {
    try {
      const token = getCookie("authToken");
      if (!token) return;
      
      // Prepare step-specific data
      const stepData = getStepDataForSave(stepNumber, formik.values);
      
      const formData = new FormData();
      
      // Add step-specific fields
      Object.keys(stepData).forEach(key => {
        if (stepData[key] !== null && stepData[key] !== undefined) {
          if (Array.isArray(stepData[key])) {
            formData.append(key, stepData[key].join(","));
          } else {
            formData.append(key, stepData[key]);
          }
        }
      });
      
      // Add photo if it's step 8
      if (stepNumber === 8 && formik.values.photo) {
        if (formik.values.photo instanceof File) {
          formData.append("profileImage", formik.values.photo);
        } else if (typeof formik.values.photo === 'string' && formik.values.photo.startsWith('data:')) {
          const response = await fetch(formik.values.photo);
          const blob = await response.blob();
          formData.append("profileImage", blob, "profile.jpg");
        }
      }
      
      formData.append("stepNumber", stepNumber.toString());
      
      const response = await fetch(`${API_BASE_URL}/api/user/profile/step`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error saving step:", data.message);
        // Don't throw error, just log it - user can still proceed
      }
    } catch (error) {
      console.error("Error saving step data:", error);
      // Don't throw error, just log it - user can still proceed
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

    // Only proceed if no errors
    if (!hasErrors) {
      // Save current step data before moving to next
      if (currentStep < totalSteps) {
        await saveStepData(currentStep);
        setCurrentStep(currentStep + 1);
      } else if (currentStep === totalSteps) {
        // Last step - save and then submit complete profile
        await saveStepData(currentStep);
        handleSubmit();
      }
    }
  };

  // Track previous step to detect backward navigation
  const [previousStep, setPreviousStep] = useState(1);
  
  // Reload saved data when navigating backward (to ensure we show saved data for previous steps)
  useEffect(() => {
    // Only reload if we're going backward (currentStep < previousStep)
    if (currentStep < previousStep && currentStep > 0) {
      const reloadStepData = async () => {
        try {
          const token = getCookie("authToken");
          if (!token) return;
          
          const response = await fetch(`${API_BASE_URL}/api/user/profile/progress`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          
          if (!response.ok) return;
          
          const data = await response.json();
          
          if (data.success && data.data && data.data.profile) {
            const profile = data.data.profile;
            const currentValues = formik.values;
            
            // When going back, always reload saved data for that step to ensure it's displayed
            // Merge saved data with current formik values (saved data takes precedence for fields in previous steps)
            const updates = {
              // Always use saved data if it exists (for backward navigation)
              fullName: profile.fullName || currentValues.fullName || "",
              city: profile.city || currentValues.city || "",
              religion: profile.religion || currentValues.religion || "",
              maritalStatus: profile.status || currentValues.maritalStatus || "",
              email: profile.email || currentValues.email || "",
              gender: profile.gender || currentValues.gender || "",
              birthDate: profile.dateOfBirth 
                ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
                : (currentValues.birthDate || ""),
              language: profile.preferredLanguage || currentValues.language || "",
              habits: (profile.habits && profile.habits.length > 0) ? profile.habits : (currentValues.habits || []),
              interest: (profile.interests && profile.interests.length > 0) ? profile.interests : (currentValues.interest || []),
              skill: (profile.skills && profile.skills.length > 0) ? profile.skills : (currentValues.skill || []),
              industry: profile.industry || currentValues.industry || "",
              company: profile.company || currentValues.company || "",
              photo: profile.profileImage || currentValues.photo || null,
              mobileNumber: phoneNumber || currentValues.mobileNumber || "",
            };
            
            // Update formik values with merged data
            formik.setValues(prev => ({ ...prev, ...updates }));
          }
        } catch (error) {
          console.error("Error reloading step data:", error);
        }
      };
      
      reloadStepData();
    }
    
    // Update previous step
    setPreviousStep(currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const prevStep = async () => {
    if (currentStep > 1) {
      // Save current step data before going back (to preserve any changes)
      await saveStepData(currentStep);
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
        return ['industry', 'company'];
      case 8:
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
        return <Step8 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
      case 8:
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
