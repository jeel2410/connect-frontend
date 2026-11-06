import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../component/Header";
import Footer from "../component/Footer";
import DynamicAuthImage from "../component/DynamicAuthImage";
import API_BASE_URL from "../utils/config";
import { getCookie } from "../utils/auth";

const EmailVerification = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve phone number from state or localStorage
  const phoneNumber =
    location.state?.phoneNumber || localStorage.getItem("phoneNumber") || "";

  // Email validation regex
  const isValidEmail = (val) => {
    if (!val) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  // Back button handler
  const handleBack = () => {
    if (otpSent) {
      setOtpSent(false);
      setOtp(["", "", "", "", "", ""]);
      setApiError("");
      setSuccess("");
    } else {
      navigate(-1);
    }
  };

  // Send verification code to email
  const handleSendCode = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    if (!isValidEmail(email)) {
      setApiError("Please enter a valid email address.");
      return;
    }

    setApiError("");
    setSuccess("");
    setIsSending(true);

    try {
      const token = getCookie("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/auth/send-email-otp`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send verification code. Please try again.");
      }

      setOtpSent(true);
      setSuccess(`Verification code sent to ${email.trim()}`);
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      setApiError(err.message || "Something went wrong while sending code.");
    } finally {
      setIsSending(false);
    }
  };

  // Verify the 6-digit OTP
  const handleVerifyCode = async (codeToVerify) => {
    const code = codeToVerify || otp.join("");
    if (code.length !== 6) {
      setApiError("Please enter all 6 digits of the verification code.");
      return;
    }

    setApiError("");
    setSuccess("");
    setIsVerifying(true);

    try {
      const token = getCookie("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/auth/verify-email-otp`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: code,
          phoneNumber: phoneNumber || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired verification code.");
      }

      setSuccess("Email verified successfully! Redirecting...");
      localStorage.setItem("verifiedEmail", email.trim().toLowerCase());

      setTimeout(() => {
        navigate("/profile-complete", {
          state: {
            phoneNumber,
            email: email.trim().toLowerCase(),
            isEmailVerified: true,
          },
        });
      }, 1000);
    } catch (err) {
      setApiError(err.message || "Invalid verification code.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle digit inputs
  const handleOtpChange = (index, value) => {
    // Handle full code paste / mobile autofill
    if (value && value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      if (!digits) return;
      const newOtp = ["", "", "", "", "", ""];
      digits.split("").forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      setApiError("");
      const lastIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      if (digits.length === 6) {
        handleVerifyCode(newOtp.join(""));
      }
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setApiError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const codeStr = newOtp.join("");
    if (codeStr.length === 6) {
      handleVerifyCode(codeStr);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasted)) return;

    const digits = pasted.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      if (i < 6) newOtp[i] = d;
    });
    setOtp(newOtp);
    setApiError("");
    const lastIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();

    if (digits.length === 6) {
      handleVerifyCode(newOtp.join(""));
    }
  };

  // Google OAuth Login handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        setApiError("");
        setSuccess("");

        const token = getCookie("authToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Verify Google accessToken on backend and link email + name
        const res = await fetch(`${API_BASE_URL}/api/auth/google-verify-email`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            accessToken: tokenResponse.access_token,
            phoneNumber: phoneNumber || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Google email verification failed. Please try again.");
        }

        const verifiedEmail = data.data?.email || "";
        const fullName = data.data?.name || "";

        // Save in localStorage so the next screen immediately pre-fills them
        if (fullName) {
          localStorage.setItem("googleFullName", fullName);
          localStorage.setItem("tempFullName", fullName);
        }
        if (verifiedEmail) {
          localStorage.setItem("googleEmail", verifiedEmail);
          localStorage.setItem("verifiedEmail", verifiedEmail);
        }

        setSuccess("Email verified with Google! Redirecting...");

        // Navigate to the next screen (Profile Complete) with name and email pre-filled
        setTimeout(() => {
          navigate("/profile-complete", {
            state: {
              phoneNumber,
              email: verifiedEmail,
              fullName: fullName,
              isEmailVerified: true,
            },
          });
        }, 1000);
      } catch (err) {
        console.error("Google Auth error:", err);
        setApiError(err.message || "Google verification failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google OAuth error:", err);
      setApiError("Google verification was cancelled or failed. Please try again.");
      setGoogleLoading(false);
    },
  });

  return (
    <div className="auth-page-wrapper">
      <Header />
      <div className="login-page">
        <DynamicAuthImage />
        <div className="login-container">
          <div className="login-content" style={{ maxWidth: "440px", margin: "0 auto", width: "100%" }}>
            {/* Back Button */}
            <button
              type="button"
              className="otp-back-button"
              onClick={handleBack}
              aria-label="Go back"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 0",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                color: "#09122E",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Title & Description */}
            <h1
              className="login-title"
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#09122E",
                margin: "0 0 8px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Email Verification
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "#64748B",
                margin: "0 0 28px",
                lineHeight: "1.5",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {otpSent
                ? `Enter the 6-digit verification code sent to ${email}`
                : "Enter your email address to receive a 6-digit verification code."}
            </p>

            {/* Feedback Messages */}
            {apiError && (
              <div className="message-error" style={{ marginBottom: "16px" }}>
                {apiError}
              </div>
            )}
            {success && (
              <div className="message-success" style={{ marginBottom: "16px" }}>
                ✓ {success}
              </div>
            )}

            {!otpSent ? (
              /* Step A: Email Input + Send Verification Code */
              <form onSubmit={handleSendCode}>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #EA650A",
                      borderRadius: "12px",
                      padding: "4px 16px",
                      height: "56px",
                      boxShadow: "0 2px 8px rgba(234, 101, 10, 0.08)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Mail Icon */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingRight: "12px",
                      }}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#09122E"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>

                    {/* Subtle vertical separator */}
                    <div
                      style={{
                        width: "1px",
                        height: "24px",
                        backgroundColor: "#E2E8F0",
                        marginRight: "12px",
                      }}
                    />

                    {/* Email Input */}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setApiError("");
                        setSuccess("");
                      }}
                      placeholder="name@example.com"
                      disabled={isSending || googleLoading}
                      autoFocus
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: "16px",
                        color: "#09122E",
                        fontFamily: "'Inter', sans-serif",
                        backgroundColor: "transparent",
                      }}
                    />
                  </div>
                </div>

                {/* Orange Button: Send Verification Code */}
                <button
                  type="submit"
                  disabled={!isValidEmail(email) || isSending || googleLoading}
                  style={{
                    width: "100%",
                    height: "52px",
                    backgroundColor: isValidEmail(email) && !isSending ? "#EA650A" : "#F97316",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif",
                    cursor: isValidEmail(email) && !isSending ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 6px 14px rgba(234, 101, 10, 0.25)",
                    transition: "all 0.2s ease",
                    opacity: isValidEmail(email) && !isSending ? 1 : 0.7,
                  }}
                >
                  {isSending ? (
                    <>
                      <span className="spinner" style={{ width: "18px", height: "18px" }}></span>
                      Sending Code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            ) : (
              /* Step B: 6-Digit OTP Verification Box */
              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      disabled={isVerifying}
                      style={{
                        width: "50px",
                        height: "54px",
                        border: "1.5px solid",
                        borderColor: digit ? "#EA650A" : "#CBD5E1",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        textAlign: "center",
                        fontSize: "22px",
                        fontWeight: "700",
                        color: "#09122E",
                        outline: "none",
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>

                {/* Verify Code Button */}
                <button
                  type="button"
                  onClick={() => handleVerifyCode()}
                  disabled={otp.join("").length !== 6 || isVerifying}
                  style={{
                    width: "100%",
                    height: "52px",
                    backgroundColor: otp.join("").length === 6 && !isVerifying ? "#EA650A" : "#F97316",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif",
                    cursor: otp.join("").length === 6 && !isVerifying ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 6px 14px rgba(234, 101, 10, 0.25)",
                    transition: "all 0.2s ease",
                    opacity: otp.join("").length === 6 && !isVerifying ? 1 : 0.7,
                  }}
                >
                  {isVerifying ? (
                    <>
                      <span className="spinner" style={{ width: "18px", height: "18px" }}></span>
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </button>

                {/* Resend & Change Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    fontSize: "14px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748B",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      fontSize: "13px",
                    }}
                  >
                    Change email
                  </button>

                  <div style={{ color: "#64748B", fontSize: "13px" }}>
                    {countdown > 0 ? (
                      <span>Resend in <strong>{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={isSending}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#EA650A",
                          fontWeight: "600",
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                          fontSize: "13px",
                        }}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* OR Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "24px 0",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E2E8F0" }} />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#94A3B8",
                  letterSpacing: "0.5px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                OR
              </span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E2E8F0" }} />
            </div>

            {/* Google Auth Sign-in Option */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={googleLoading || isSending || isVerifying}
              style={{
                width: "100%",
                height: "52px",
                backgroundColor: "#ffffff",
                border: "1px solid #CBD5E1",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                color: "#1E293B",
                fontFamily: "'Inter', sans-serif",
                cursor: googleLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
              }}
            >
              {googleLoading ? (
                <>
                  <span
                    className="spinner"
                    style={{
                      width: "16px",
                      height: "16px",
                      borderTopColor: "#EA650A",
                      borderColor: "rgba(234, 101, 10, 0.2)",
                    }}
                  ></span>
                  Connecting with Google...
                </>
              ) : (
                <>
                  {/* Google 'G' Logo */}
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Secure Footer Text */}
            <p
              style={{
                textAlign: "center",
                color: "#64748B",
                fontSize: "14px",
                marginTop: "24px",
                marginBottom: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Verify your email to continue securely.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmailVerification;
