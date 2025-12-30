import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthImage from "../component/AuthImage"
import logo from "../../src/assets/image/connect_logo.png"
import { useNavigate, useLocation } from "react-router-dom";
import { setCookie } from "../utils/auth";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get phone number from location state or localStorage
  const phoneNumber = location.state?.phoneNumber || localStorage.getItem("phoneNumber") || "+91 *********23";
  const storedPhoneNumber = location.state?.phoneNumber || localStorage.getItem("phoneNumber") || "";

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .required("OTP is required")
      .length(6, "OTP must be exactly 6 digits")
      .matches(/^\d{6}$/, "OTP must contain only numbers"),
  });

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      if (!storedPhoneNumber) {
        setApiError("Phone number not found. Please register again.");
        setLoading(false);
        setSubmitting(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: storedPhoneNumber,
            otp: values.otp,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid OTP. Please try again.");
        }

        // Success - handle response
        if (data.success && data.data) {
          const { token, isProfileComplete } = data.data;

          // Save token to cookie
          if (token) {
            setCookie("authToken", token, 7); // 7 days expiry
          }
          
          // Save isProfileComplete status to cookie
          setCookie("isProfileComplete", isProfileComplete ? "true" : "false", 7);

          // Handle redirect based on user status
          if (!isProfileComplete) {
            // New user with incomplete profile - redirect to register/profile completion
            setSuccess("OTP verified successfully! Redirecting...");
            setTimeout(() => {
              navigate("/profile-complete", { state: { phoneNumber: storedPhoneNumber } });
            }, 1000);
          } else {
            // Existing user or profile complete - redirect to home
            setSuccess("Login successful! Redirecting...");
            setTimeout(() => {
              navigate("/");
            }, 1000);
          }
        } else {
          throw new Error("Invalid response from server");
        }

      } catch (err) {
        setApiError(err.message || "Something went wrong. Please try again.");
        setFieldError("otp", err.message || "Invalid OTP");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        formik.setFieldValue("otp", "");
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Update formik value
      const otpString = newOtp.join("");
      formik.setFieldValue("otp", otpString);
      setApiError("");
      setSuccess("");

      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      
      // Auto-submit if 6 digits entered
      if (otpString.length === 6) {
        setTimeout(() => {
          formik.handleSubmit();
        }, 100);
      }
      return;
    }

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Update formik value
    const otpString = newOtp.join("");
    formik.setFieldValue("otp", otpString);
    setApiError("");
    setSuccess("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if 6 digits entered
    if (otpString.length === 6) {
      setTimeout(() => {
        formik.handleSubmit();
      }, 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setApiError("");
    setSuccess("");
    setOtp(["", "", "", "", "", ""]);
    formik.setFieldValue("otp", "");
    inputRefs.current[0]?.focus();

    if (!storedPhoneNumber) {
      setApiError("Phone number not found. Please register again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: storedPhoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP. Please try again.");
      }

      setSuccess("OTP resent successfully! Please check your phone.");
    } catch (err) {
      setApiError(err.message || "Failed to resend OTP. Please try again.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
    // Store phone number in localStorage if received from location state
    if (location.state?.phoneNumber) {
      localStorage.setItem("phoneNumber", location.state.phoneNumber);
    }
  }, [location.state]);

  return (
    <div className="login-page">
      <AuthImage />
      <div className="login-container">
        <div className="login-header">
          <img src={logo} alt="Connect Logo"></img>
        </div>

        <div className="login-content">
          <button 
            type="button" 
            className="otp-back-button"
            onClick={handleBack}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <h1 className="login-title">OTP Verification</h1>
          <p className="otp-description">
            Please enter the 6-digit code sent to your Mobile number at {phoneNumber}
          </p>

          <form className="login-form" onSubmit={formik.handleSubmit}>
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`otp-input ${formik.touched.otp && formik.errors.otp ? "input-error" : ""}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading || formik.isSubmitting}
                />
              ))}
            </div>

            {/* Field Error Message */}
            {formik.touched.otp && formik.errors.otp && (
              <div className="field-error-message">
                {formik.errors.otp}
              </div>
            )}

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
              disabled={loading || formik.isSubmitting || otp.join("").length !== 6}
            >
              {loading || formik.isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>

            <div className="otp-resend-container">
              <span className="otp-resend-text">Didn't receive the code yet?</span>
              <button
                type="button"
                className="otp-resend-link"
                onClick={handleResend}
                disabled={loading || formik.isSubmitting}
              >
                Resend
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
