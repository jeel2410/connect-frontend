import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthImage from "../component/AuthImage"
import logo from "../../src/assets/image/connect_logo.png"
import mobileIcon from "../../src/assets/image/mobile.png";
import passwordIcon from "../../src/assets/image/password.png";
import { useNavigate } from "react-router-dom";
import { setCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login-with-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed. Please check your credentials.");
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

          // Handle redirect based on profile status
          if (!isProfileComplete) {
            // Profile not complete - redirect to profile completion
            setSuccess("Login successful! Redirecting to complete profile...");
            setTimeout(() => {
              navigate("/profile-complete");
            }, 1000);
          } else {
            // Profile complete - redirect to home
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
        setFieldError("password", err.message || "Invalid credentials");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Google Login Handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        setApiError("");
        setSuccess("");

        // Send the access token to your backend
        const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: tokenResponse.access_token,
          }),
        });
        if (!response.ok) {
          let errorMessage = "Google login failed. Please try again.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success && data.data) {
          const { token, isProfileComplete } = data.data;

          // Save token to cookie
          if (token) {
            setCookie("authToken", token, 7);
          }

          // Save isProfileComplete status to cookie
          setCookie("isProfileComplete", isProfileComplete ? "true" : "false", 7);

          // Handle redirect based on profile status
          if (!isProfileComplete) {
            setSuccess("Login successful! Redirecting to complete profile...");
            setTimeout(() => {
              navigate("/profile-complete");
            }, 1000);
          } else {
            setSuccess("Login successful! Redirecting...");
            setTimeout(() => {
              navigate("/");
            }, 1000);
          }
        } else {
          throw new Error(data.message || "Invalid response from server");
        }
      } catch (err) {
        console.error("Google login error:", err);
        if (err.message === "Failed to fetch" || err.name === "TypeError") {
          setApiError(`Unable to connect to server. Please check if the server is running on ${API_BASE_URL}`);
        } else {
          setApiError(err.message || "Google login failed. Please try again.");
        }
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      setApiError("Google login was cancelled or failed. Please try again.");
      setGoogleLoading(false);
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
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Sign in to continue</p>

          <form className="login-form" onSubmit={formik.handleSubmit}>
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

            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <img src={mobileIcon} alt="Email"></img>
                </div>
                <div className="input-content">
                  <label className="input-label">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${formik.touched.email && formik.errors.email ? "input-error" : ""}`}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="field-error-message">{formik.errors.email}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <img src={passwordIcon} alt="Password"></img>
                </div>
                <div className="input-content">
                  <label className="input-label">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-input ${formik.touched.password && formik.errors.password ? "input-error" : ""}`}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3.33333C5.83333 3.33333 2.27499 5.57499 0.833328 8.75C2.27499 11.925 5.83333 14.1667 10 14.1667C14.1667 14.1667 17.725 11.925 19.1667 8.75C17.725 5.57499 14.1667 3.33333 10 3.33333ZM10 12.5C7.69999 12.5 5.83333 10.6333 5.83333 8.33333C5.83333 6.03333 7.69999 4.16666 10 4.16666C12.3 4.16666 14.1667 6.03333 14.1667 8.33333C14.1667 10.6333 12.3 12.5 10 12.5ZM10 5.83333C8.61666 5.83333 7.49999 6.94999 7.49999 8.33333C7.49999 9.71666 8.61666 10.8333 10 10.8333C11.3833 10.8333 12.5 9.71666 12.5 8.33333C12.5 6.94999 11.3833 5.83333 10 5.83333Z" fill="currentColor"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 2.5L17.5 17.5M8.075 8.075C7.79167 8.40833 7.5 8.875 7.5 9.375C7.5 10.7583 8.61667 11.875 10 11.875C10.5 11.875 10.9667 11.5833 11.3 11.3M14.1917 12.3083C13.1083 13.15 11.625 13.75 10 13.75C5.83333 13.75 2.275 11.5083 0.833333 8.33333C1.66667 6.25 3.03333 4.525 4.80833 3.39167M7.5 3.625C8.10833 3.45833 8.74167 3.33333 9.375 3.33333C14.1667 3.33333 17.725 5.575 19.1667 8.75C18.75 9.70833 18.2083 10.5833 17.575 11.3583" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="field-error-message">{formik.errors.password}</div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || formik.isSubmitting}
            >
              {loading || formik.isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          
          <div className="register-link-container">
            <span className="register-link-text">Don't have an account? </span>
            <button
              type="button"
              className="register-link-button"
              onClick={() => navigate("/Register")}
            >
              Register
            </button>
          </div>

          <button 
            type="button" 
            className="google-button" 
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M18.1713 8.36785H17.5001V8.33335H10.0001V11.6667H14.7096C14.0225 13.607 12.1763 15 10.0001 15C7.23882 15 5.00008 12.7613 5.00008 10C5.00008 7.23869 7.23882 5.00002 10.0001 5.00002C11.2746 5.00002 12.4342 5.48119 13.3171 6.26627L15.6742 3.90919C14.1859 2.52202 12.1951 1.66669 10.0001 1.66669C5.39758 1.66669 1.66675 5.39752 1.66675 10C1.66675 14.6025 5.39758 18.3334 10.0001 18.3334C14.6026 18.3334 18.3334 14.6025 18.3334 10C18.3334 9.44085 18.2759 8.89552 18.1713 8.36785Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M2.62744 6.12119L5.36536 8.12952C6.10619 6.29535 7.90036 5.00002 9.99994 5.00002C11.2744 5.00002 12.4341 5.48119 13.3169 6.26627L15.6741 3.90919C14.1857 2.52202 12.1949 1.66669 9.99994 1.66669C6.79911 1.66669 4.02327 3.47385 2.62744 6.12119Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M10.0001 18.3333C12.1526 18.3333 14.1101 17.5095 15.5871 16.17L13.0079 13.9875C12.1431 14.6452 11.0864 15 10.0001 15C7.83177 15 5.99094 13.6179 5.29844 11.6891L2.58594 13.783C3.96511 16.4816 6.76177 18.3333 10.0001 18.3333Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M18.1713 8.36788H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3354 18.3334 14.1667 18.3334 10C18.3334 9.44087 18.2758 8.89554 18.1713 8.36788Z"
                    fill="#1976D2"
                  />
                </svg>
                <span>Continue With Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
