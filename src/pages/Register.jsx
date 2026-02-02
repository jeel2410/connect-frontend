import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthImage from "../component/AuthImage"
import logo from "../../src/assets/image/connect_logo.png"
import mobileIcon from "../../src/assets/image/mobile.png";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/config";
import Header from "../component/Header";
import Footer from "../component/Footer";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Common country codes
  const countryCodes = [
    { code: "+91", name: "India", flag: "🇮🇳" },
    { code: "+1", name: "USA/Canada", flag: "🇺🇸" },
    { code: "+44", name: "UK", flag: "🇬🇧" },
    { code: "+61", name: "Australia", flag: "🇦🇺" },
    { code: "+971", name: "UAE", flag: "🇦🇪" },
    { code: "+65", name: "Singapore", flag: "🇸🇬" },
    { code: "+86", name: "China", flag: "🇨🇳" },
    { code: "+81", name: "Japan", flag: "🇯🇵" },
    { code: "+82", name: "South Korea", flag: "🇰🇷" },
    { code: "+49", name: "Germany", flag: "🇩🇪" },
    { code: "+33", name: "France", flag: "🇫🇷" },
    { code: "+39", name: "Italy", flag: "🇮🇹" },
    { code: "+34", name: "Spain", flag: "🇪🇸" },
    { code: "+31", name: "Netherlands", flag: "🇳🇱" },
    { code: "+46", name: "Sweden", flag: "🇸🇪" },
    { code: "+47", name: "Norway", flag: "🇳🇴" },
    { code: "+41", name: "Switzerland", flag: "🇨🇭" },
    { code: "+32", name: "Belgium", flag: "🇧🇪" },
    { code: "+351", name: "Portugal", flag: "🇵🇹" },
    { code: "+353", name: "Ireland", flag: "🇮🇪" },
    { code: "+27", name: "South Africa", flag: "🇿🇦" },
    { code: "+55", name: "Brazil", flag: "🇧🇷" },
    { code: "+52", name: "Mexico", flag: "🇲🇽" },
    { code: "+90", name: "Turkey", flag: "🇹🇷" },
    { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+974", name: "Qatar", flag: "🇶🇦" },
    { code: "+60", name: "Malaysia", flag: "🇲🇾" },
    { code: "+62", name: "Indonesia", flag: "🇮🇩" },
    { code: "+63", name: "Philippines", flag: "🇵🇭" },
    { code: "+66", name: "Thailand", flag: "🇹🇭" },
  ];

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    countryCode: Yup.string().required("Country code is required"),
    phoneNumber: Yup.string()
      .required("Mobile number is required")
      .test("phone-format", "Please enter a valid mobile number", function (value) {
        const { countryCode } = this.parent;
        if (!value || !countryCode) return false;

        // Remove all non-digit characters
        const digits = value.replace(/\D/g, "");

        // Basic validation: should have at least 7 digits and at most 15 digits (international standard)
        if (digits.length < 7 || digits.length > 15) {
          return false;
        }

        // Country-specific validation for India (+91)
        if (countryCode === "+91") {
          // Should be exactly 10 digits and start with 6, 7, 8, or 9
          if (digits.length !== 10) return false;
          return /^[6-9]\d{9}$/.test(digits);
        }

        // For other countries, just check it's numeric and has reasonable length
        return /^\d+$/.test(digits) && digits.length >= 7;
      }),
  });

  // Format phone number (only digits)
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    return digits;
  };

  const formik = useFormik({
    initialValues: {
      countryCode: "+91",
      phoneNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      try {
        // Combine country code and phone number
        const fullPhoneNumber = `${values.countryCode}${values.phoneNumber}`;

        // Validate that we have both country code and phone number
        if (!values.countryCode || !values.phoneNumber) {
          throw new Error("Please select country code and enter phone number");
        }

        console.log("Sending OTP to:", fullPhoneNumber); // Debug log

        const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber,
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

        // Store full phone number in localStorage (fullPhoneNumber already declared above)
        localStorage.setItem("phoneNumber", fullPhoneNumber);

        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate("/otp-verification", {
            state: { phoneNumber: fullPhoneNumber }
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
    <div>
      <Header></Header>
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
                    <div style={{ display: "flex", gap: "8px" }}>
                      <select
                        name="countryCode"
                        value={formik.values.countryCode}
                        onChange={(e) => {
                          formik.setFieldValue("countryCode", e.target.value);
                          setApiError("");
                          setSuccess("");
                        }}
                        onBlur={formik.handleBlur}
                        className={`form-input ${formik.touched.countryCode && formik.errors.countryCode ? "input-error" : ""}`}
                        style={{
                          width: "120px",
                          flexShrink: 0,
                          padding: "12px 8px",
                          fontSize: "14px"
                        }}
                        disabled={loading || formik.isSubmitting}
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
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
                        onBlur={formik.handleBlur}
                        maxLength={15}
                        disabled={loading || formik.isSubmitting}
                        placeholder="Enter phone number"
                        style={{ flex: 1 }}
                      />
                    </div>
                    {formik.touched.countryCode && formik.errors.countryCode && (
                      <div className="field-error-message">
                        {formik.errors.countryCode}
                      </div>
                    )}
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
                  "Login / Register"
                )}
              </button>
            </form>

            {/* <div className="register-link-container">
            <span className="register-link-text">Already have an account? </span>
            <button
              type="button"
              className="register-link-button"
              onClick={() => navigate("/")}
            >
              Login with email
            </button>
          </div> */}
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>

  );
};

export default Register;
