import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import logo from "../../src/assets/image/connect_logo.png"
import DynamicAuthImage from "../component/DynamicAuthImage";
import { useNavigate, useLocation } from "react-router-dom";
import { setCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";
import Header from "../component/Header";
import Footer from "../component/Footer";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef([]);
  const isVerifyingRef = useRef(false);
  const isSuccessRef = useRef(false);
  const autoSubmitTimeoutRef = useRef(null);
  const lastProcessedOtpRef = useRef("");
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToFirstError = () => {
    setTimeout(() => {
      const errorElement = document.querySelector(
        ".input-error, .field-error-message, .message-error, .error-message, .error"
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        const input =
          errorElement.tagName === "INPUT" ||
          errorElement.tagName === "SELECT" ||
          errorElement.tagName === "TEXTAREA"
            ? errorElement
            : errorElement.querySelector("input, select, textarea");
        if (input && typeof input.focus === "function") {
          input.focus({ preventScroll: true });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

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
      // Guard against concurrent or duplicate submissions
      if (isVerifyingRef.current || isSuccessRef.current) {
        return;
      }
      isVerifyingRef.current = true;
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      if (!storedPhoneNumber) {
        setApiError("Phone number not found. Please register again.");
        setLoading(false);
        setSubmitting(false);
        isVerifyingRef.current = false;
        return;
      }

      try {
        const trafficSource = localStorage.getItem("trafficSource");
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: storedPhoneNumber,
            otp: values.otp,
            trafficSource,
          }),
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          let errorMessage = "Invalid OTP. Please try again.";
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

        // Success - handle response
        if (data.success && data.data) {
          isSuccessRef.current = true;
          setApiError(""); // Clear any stale errors immediately

          const { 
            token, 
            isProfileComplete, 
            isEmailVerified, 
            hasCompletedBasicProfile 
          } = data.data;

          // Save token to cookie
          if (token) {
            setCookie("authToken", token, 7); // 7 days expiry
          }

          // If user has completed Basic Profile, their profile is considered complete for login
          const shouldBeComplete = Boolean(isProfileComplete || hasCompletedBasicProfile);

          // Save isProfileComplete status to cookie
          setCookie("isProfileComplete", shouldBeComplete ? "true" : "false", 7);
          localStorage.removeItem("trafficSource");

          // Handle redirect based on user status
          if (shouldBeComplete) {
            // Completed Basic Profile or full profile - redirect to dashboard/home!
            setSuccess("Login successful! Redirecting...");
            const returnUrl = location.state?.from || (typeof window !== 'undefined' ? sessionStorage.getItem('loginRedirect') : null) || "/";
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('loginRedirect');
            }
            setTimeout(() => {
              navigate(returnUrl);
            }, 1000);
          } else if (!isEmailVerified) {
            // New user with incomplete profile and unverified email - redirect to standalone email verification
            setSuccess("OTP verified successfully! Redirecting...");
            setTimeout(() => {
              navigate("/email-verification", { state: { phoneNumber: storedPhoneNumber } });
            }, 1000);
          } else {
            // Email is already verified, but Basic Profile not yet completed - redirect to profile completion
            setSuccess("OTP verified successfully! Redirecting...");
            setTimeout(() => {
              navigate("/profile-complete", { 
                state: { 
                  phoneNumber: storedPhoneNumber, 
                  isEmailVerified: true 
                } 
              });
            }, 1000);
          }
        } else {
          throw new Error("Invalid response from server");
        }

      } catch (err) {
        // If already succeeded, ignore any subsequent error (e.g. duplicate response)
        if (isSuccessRef.current) {
          return;
        }

        // Handle network errors (Failed to fetch)
        if (err.message === "Failed to fetch" || err.name === "TypeError") {
          setApiError(`Unable to connect to server. Please check if the server is running on ${API_BASE_URL}`);
          setFieldError("otp", "Server connection failed. Please try again later.");
        } else {
          setApiError(err.message || "Something went wrong. Please try again.");
          setFieldError("otp", err.message || "Invalid OTP");
        }
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        formik.setFieldValue("otp", "");
        lastProcessedOtpRef.current = "";
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
        setSubmitting(false);
        isVerifyingRef.current = false;
        if (!isSuccessRef.current) {
          scrollToFirstError();
        }
      }
    },
  });

  useEffect(() => {
    if (apiError || (formik.submitCount > 0 && !formik.isValid)) {
      scrollToFirstError();
    }
  }, [apiError, formik.submitCount, formik.isValid]);

  const handleOtpChange = (index, value) => {
    if (isSuccessRef.current) return;

    // Handle multi-digit input (mobile autofill / OTP suggestion fills full code)
    if (value && value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      if (!digits) return;
      if (lastProcessedOtpRef.current === digits && digits.length === 6) return;
      lastProcessedOtpRef.current = digits;

      const newOtp = ["", "", "", "", "", ""];
      digits.split("").forEach((d, i) => { newOtp[i] = d; });
      setOtp(newOtp);
      const otpString = newOtp.join("");
      formik.setFieldValue("otp", otpString);
      setApiError("");
      setSuccess("");
      const lastIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      if (otpString.length === 6 && !isVerifyingRef.current && !isSuccessRef.current) {
        if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
        autoSubmitTimeoutRef.current = setTimeout(() => {
          if (!isVerifyingRef.current && !isSuccessRef.current) {
            formik.handleSubmit();
          }
        }, 150);
      }
      return;
    }

    // Only allow single digit numbers
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
    if (otpString.length === 6 && !isVerifyingRef.current && !isSuccessRef.current) {
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = setTimeout(() => {
        if (!isVerifyingRef.current && !isSuccessRef.current) {
          formik.handleSubmit();
        }
      }, 150);
    }
  };

  // Fallback for browsers that fire 'input' event during autofill instead of 'change'
  const handleOtpInput = (index, e) => {
    const value = e.target.value;
    if (value && value.length > 1 && value !== lastProcessedOtpRef.current) {
      handleOtpChange(index, value);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (isSuccessRef.current) return;
    const data = e.clipboardData.getData("text").trim();
    
    // Only process if it's a number
    if (!/^\d+$/.test(data)) return;

    const pastedOtp = data.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    pastedOtp.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    
    setOtp(newOtp);
    const otpString = newOtp.join("");
    formik.setFieldValue("otp", otpString);
    lastProcessedOtpRef.current = otpString;
    setApiError("");
    setSuccess("");

    // Focus the last filled input
    const lastIndex = Math.min(pastedOtp.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if 6 digits entered
    if (otpString.length === 6 && !isVerifyingRef.current && !isSuccessRef.current) {
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = setTimeout(() => {
        if (!isVerifyingRef.current && !isSuccessRef.current) {
          formik.handleSubmit();
        }
      }, 150);
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
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: storedPhoneNumber,
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = "Failed to resend OTP. Please try again.";
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

      setSuccess("OTP resent successfully! Please check your phone.");
    } catch (err) {
      // Handle network errors (Failed to fetch)
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setApiError(`Unable to connect to server. Please check if the server is running on ${API_BASE_URL}`);
      } else {
        setApiError(err.message || "Failed to resend OTP. Please try again.");
      }
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
    <div className="auth-page-wrapper">
      <Header></Header>
      <div className="login-page">
        <DynamicAuthImage />
        <div className="login-container">


          <div className="login-content">
            <button
              type="button"
              className="otp-back-button"
              onClick={handleBack}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                      pattern="\d*"
                      maxLength={6}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      className={`otp-input ${formik.touched.otp && formik.errors.otp ? "input-error" : ""}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onInput={(e) => handleOtpInput(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
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
                disabled={loading || formik.isSubmitting || isVerifyingRef.current || isSuccessRef.current || otp.join("").length !== 6}
              >
                {loading || formik.isSubmitting || isVerifyingRef.current ? (
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
      <Footer></Footer>
    </div>
  );
};

export default OtpVerification;
