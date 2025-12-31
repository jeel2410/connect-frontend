import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthImage from "../component/AuthImage"
import logo from "../../src/assets/image/connect_logo.png"
import mobileIcon from "../../src/assets/image/mobile.png";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/config";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Mobile number is required")
      .test("phone-format", "Please enter a valid 10-digit mobile number", (value) => {
        if (!value || value === "+91") return false;
        const digits = value.replace(/\D/g, "");
        // Should have exactly 12 digits (91 + 10 digits) and start with +91
        if (digits.length !== 12 || !value.startsWith("+91")) {
          return false;
        }
        // Extract the 10-digit number (after +91)
        const phoneDigits = digits.slice(2);
        // Should start with 6, 7, 8, or 9 (valid Indian mobile number)
        return /^[6-9]\d{9}$/.test(phoneDigits);
      }),
  });

  // Format phone number to ensure +91 prefix
  const formatPhoneNumber = (value) => {
    // If empty or just +, return +91
    if (!value || value === "+") {
      return "+91";
    }
    
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, "");
    
    // If it doesn't start with +91, ensure it does
    if (!cleaned.startsWith("+91")) {
      // Remove + if present and extract digits
      const digits = cleaned.replace("+", "").replace(/\D/g, "");
      
      // If starts with 91, add + prefix
      if (digits.startsWith("91")) {
        const phoneDigits = digits.slice(2);
        // Limit to 10 digits after country code
        return `+91${phoneDigits.slice(0, 10)}`;
      }
      
      // Otherwise, add +91 prefix and limit to 10 digits
      return `+91${digits.slice(0, 10)}`;
    }
    
    // If already has +91, extract digits and limit to 10 after +91
    const digits = cleaned.replace("+91", "").replace(/\D/g, "");
    return `+91${digits.slice(0, 10)}`;
  };

  const formik = useFormik({
    initialValues: {
      phoneNumber: "+91",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: values.phoneNumber,
          }),
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          let errorMessage = "Failed to send OTP. Please try again.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Success
        setSuccess("OTP sent successfully! Please check your phone.");
        
        // Store phone number in localStorage
        localStorage.setItem("phoneNumber", values.phoneNumber);
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate("/otp-verification", { 
            state: { phoneNumber: values.phoneNumber } 
          });
        }, 1500);

      } catch (err) {
        // Handle network errors (Failed to fetch)
        if (err.message === "Failed to fetch" || err.name === "TypeError") {
          setApiError(`Unable to connect to server. Please check if the server is running on ${API_BASE_URL}`);
          setFieldError("phoneNumber", "Server connection failed. Please try again later.");
        } else {
          setApiError(err.message || "Something went wrong. Please try again.");
          setFieldError("phoneNumber", err.message || "Failed to send OTP");
        }
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="login-page">
      <AuthImage />
      <div className="login-container">
        <div className="login-header">
          <img src={logo} alt="Connect Logo"></img>
        </div>

        <div className="login-content">
          <h1 className="login-title">Register</h1>
          <form className="login-form" onSubmit={formik.handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <img src={mobileIcon} alt="Mobile"></img>
                </div>
                <div className="input-content">
                  <label className="input-label">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className={`form-input ${formik.touched.phoneNumber && formik.errors.phoneNumber ? "input-error" : ""}`}
                    value={formik.values.phoneNumber}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      formik.setFieldValue("phoneNumber", formatted);
                      setApiError("");
                      setSuccess("");
                    }}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      const formatted = formatPhoneNumber(e.target.value);
                      formik.setFieldValue("phoneNumber", formatted);
                    }}
                    maxLength={13}
                    disabled={loading || formik.isSubmitting}
                    placeholder="+91"
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <div className="field-error-message">
                      {formik.errors.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

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

            <button
              type="submit"
              className="login-button"
              disabled={loading || formik.isSubmitting}
            >
              {loading || formik.isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Sending OTP...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>
          
          <div className="register-link-container">
            <span className="register-link-text">Already have an account? </span>
            <button
              type="button"
              className="register-link-button"
              onClick={() => navigate("/Login")}
            >
              Login with email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
