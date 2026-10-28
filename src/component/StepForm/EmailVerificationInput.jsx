import React, { useState, useRef, useEffect } from "react";
import emailDefaultIcon from "../../assets/image/email.png";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const EmailVerificationInput = ({
  email = "",
  updateData,
  errors = {},
  touched = {},
  isEmailVerified = false,
  setIsEmailVerified,
  label = "Email Id",
  placeholder = "Enter your email address",
  icon = emailDefaultIcon,
  name = "email",
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Email format regex check
  const isValidEmail = (val) => {
    if (!val) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Countdown timer effect
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

  // Send 6-digit OTP to email
  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address first.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
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
        throw new Error(data.message || "Failed to send verification code");
      }

      setOtpSent(true);
      setStatusMessage(`Verification code sent to ${email}`);
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong while sending code");
    } finally {
      setIsSending(false);
    }
  };

  // Handle individual digit input
  const handleOtpChange = (index, value) => {
    // Multi-digit entry (e.g. mobile autofill)
    if (value && value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      if (!digits) return;
      const newOtp = ["", "", "", "", "", ""];
      digits.split("").forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      setErrorMessage("");
      const lastIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      if (digits.length === 6) {
        verifyCode(newOtp.join(""));
      }
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMessage("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const codeStr = newOtp.join("");
    if (codeStr.length === 6) {
      verifyCode(codeStr);
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
    setErrorMessage("");
    const lastIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();

    if (digits.length === 6) {
      verifyCode(newOtp.join(""));
    }
  };

  // Verify the 6-digit OTP
  const verifyCode = async (codeToVerify) => {
    const code = codeToVerify || otp.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired verification code");
      }

      // Success
      setIsEmailVerified(true);
      if (typeof updateData === "function") {
        updateData("isEmailVerified", true);
      }
      setOtpSent(false);
      setStatusMessage("Email confirmed successfully!");
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message || "Invalid verification code");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailChange = (newVal) => {
    // If email changes, invalidate previous verification
    if (isEmailVerified) {
      setIsEmailVerified(false);
      if (typeof updateData === "function") {
        updateData("isEmailVerified", false);
      }
    }
    setOtpSent(false);
    setStatusMessage("");
    setErrorMessage("");
    if (typeof updateData === "function") {
      updateData(name, newVal);
    }
  };

  return (
    <div className="email-verification-wrapper" style={{ marginBottom: "16px" }}>
      <div className="form-group" style={{ marginBottom: "8px" }}>
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={icon} alt="Email" style={{ width: "20px", height: "20px" }} />
          </div>
          <div className="input-content" style={{ position: "relative" }}>
            <label className="input-label">{label}</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="email"
                name={name}
                value={email || ""}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => {
                  if (typeof updateData === "function") {
                    updateData(`_touched_${name}`, true);
                  }
                }}
                disabled={isEmailVerified || isSending || isVerifying}
                placeholder={placeholder}
                className={`form-input ${touched?.[name] && errors?.[name] ? "input-error" : ""}`}
                style={{
                  flex: 1,
                  paddingRight: "10px",
                  backgroundColor: isEmailVerified ? "#f9fafb" : "#ffffff",
                }}
              />

              {/* Action Button inside/beside email input */}
              {isEmailVerified ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#ecfdf5",
                      color: "#059669",
                      fontWeight: "600",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✓ Verified
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmailVerified(false);
                      if (typeof updateData === "function") {
                        updateData("isEmailVerified", false);
                      }
                      setOtpSent(false);
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#6b7280",
                      fontSize: "12px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: "4px",
                    }}
                    title="Change email address"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isValidEmail(email) || isSending || isVerifying}
                  style={{
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ffffff",
                    backgroundColor: isValidEmail(email) && !isSending ? "#EA650A" : "#cbd5e1",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isValidEmail(email) && !isSending ? "pointer" : "not-allowed",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSending ? (
                    <>
                      <span className="spinner" style={{ width: "12px", height: "12px" }}></span>
                      Sending...
                    </>
                  ) : otpSent ? (
                    "Resend Code"
                  ) : (
                    "Send Code"
                  )}
                </button>
              )}
            </div>

            {touched?.[name] && errors?.[name] && (
              <div className="field-error-message">{errors[name]}</div>
            )}
          </div>
        </div>
      </div>

      {/* Code Confirmation Box on screen */}
      {otpSent && !isEmailVerified && (
        <div
          style={{
            backgroundColor: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "12px",
            padding: "16px 20px",
            marginTop: "12px",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div style={{ marginBottom: "12px", textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#9a3412" }}>
              Enter 6-digit confirmation code
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#c2410c" }}>
              Sent to <strong>{email}</strong>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "12px",
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
                  width: "44px",
                  height: "48px",
                  border: "1px solid #fed7aa",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#081332",
                  outline: "none",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>

          {/* Action Row: Verify Button & Resend Countdown */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {countdown > 0 ? (
                <span>Resend code in <strong>{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSending}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#EA650A",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => verifyCode()}
              disabled={otp.join("").length !== 6 || isVerifying}
              style={{
                padding: "8px 20px",
                backgroundColor: otp.join("").length === 6 && !isVerifying ? "#EA650A" : "#fdba74",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: otp.join("").length === 6 && !isVerifying ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isVerifying ? (
                <>
                  <span className="spinner" style={{ width: "12px", height: "12px" }}></span>
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {errorMessage && (
        <div className="field-error-message" style={{ marginTop: "6px" }}>
          {errorMessage}
        </div>
      )}
      {statusMessage && (
        <div style={{ color: "#059669", fontSize: "13px", fontWeight: "500", marginTop: "6px" }}>
          ✓ {statusMessage}
        </div>
      )}
    </div>
  );
};

export default EmailVerificationInput;
