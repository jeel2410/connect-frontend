import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import logo from "../../src/assets/image/connect_logo.png"
import mobileIcon from "../../src/assets/image/mobile.png";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/config";
import Header from "../component/Header";
import Footer from "../component/Footer";
import sideImage from "../../src/assets/image/sideImage.png"

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Fixed country code for India
  const FIXED_COUNTRY_CODE = "+91";

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Mobile number is required")
      .test("phone-format", "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9", function (value) {
        if (!value) return false;

        // Remove all non-digit characters
        const digits = value.replace(/\D/g, "");

        // India-specific validation: should be exactly 10 digits and start with 6, 7, 8, or 9
        if (digits.length !== 10) return false;
        return /^[6-9]\d{9}$/.test(digits);
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
      phoneNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      try {
        // Combine fixed country code and phone number
        const fullPhoneNumber = `${FIXED_COUNTRY_CODE}${values.phoneNumber}`;

        // Validate that we have phone number
        if (!values.phoneNumber) {
          throw new Error("Please enter phone number");
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
        <div className="side-image-container">
          <img src={sideImage} alt="Side Image" className="side-image" />
        </div>
        <div className="login-container">
          {/* <div className="login-header">
            <img src={logo} alt="Connect Logo"></img>
          </div> */}
    
          <div className="login-content">
            <h1 className="login-title">Register / Login</h1>
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
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div
                        style={{
                          padding: "12px 16px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#081332",
                          backgroundColor: "#f5f5f5",
                          // border: "1px solid #DDE2EE",
                          // borderRadius: "8px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        🇮🇳 {FIXED_COUNTRY_CODE}
                      </div>
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
                        maxLength={10}
                        disabled={loading || formik.isSubmitting}
                        placeholder="Enter 10-digit mobile number"
                        style={{ flex: 1 }}
                      />
                    </div>
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
                  "Submit"
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
