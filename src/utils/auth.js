import { useEffect } from "react";
import API_BASE_URL from "./config";

// ─── Cookie utilities ─────────────────────────────────────────────────────────
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────

// Check if user is authenticated and profile is complete
export const isAuthenticated = () => {
  const token = getCookie("authToken");
  const isProfileComplete = getCookie("isProfileComplete");
  return token && isProfileComplete === "true";
};

// Check if user has token (even if profile not complete)
export const hasToken = () => {
  return !!getCookie("authToken");
};

// Get profile completion status
export const getProfileStatus = () => {
  return getCookie("isProfileComplete") === "true";
};

// Get user profile from cookie
export const getUserProfile = () => {
  const profileJson = getCookie("userProfile");
  if (profileJson) {
    try {
      return JSON.parse(profileJson);
    } catch (error) {
      console.error("Error parsing user profile from cookie:", error);
      return null;
    }
  }
  return null;
};

// Get user current location from cookie
export const getUserCurrentLocation = () => {
  const locationJson = getCookie("userCurrentLocation");
  if (locationJson) {
    try {
      return JSON.parse(locationJson);
    } catch (error) {
      console.error("Error parsing user current location from cookie:", error);
      return null;
    }
  }
  return null;
};

// Check if user is admin
export const isAdmin = () => {
  const profile = getUserProfile();
  return profile && profile.role === 'admin';
};

// ─── Logout ───────────────────────────────────────────────────────────────────
// Central logout: clears all cookies/localStorage and redirects to login.
export const logout = () => {
  deleteCookie("authToken");
  deleteCookie("isProfileComplete");
  deleteCookie("userProfile");
  deleteCookie("userFullName");
  deleteCookie("userEmail");
  deleteCookie("userProfileImage");
  deleteCookie("userPhoneNumber");
  deleteCookie("userCurrentLocation");
  localStorage.removeItem("phoneNumber");
  window.location.href = "/Login";
};

// ─── Global Fetch Interceptor ─────────────────────────────────────────────────
// Patches window.fetch so every API response is checked globally.
// If the backend returns 401 with a "disabled" or "deleted" message,
// the user is force-logged-out immediately — no matter which page they are on.
const AUTH_BYPASS_PATHS = [
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/login-with-email",
  "/api/auth/google-login",
];

const _originalFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
  const response = await _originalFetch(...args);

  if (response.status === 401) {
    const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
    const isAuthBypass = AUTH_BYPASS_PATHS.some((p) => url.includes(p));

    if (!isAuthBypass && getCookie("authToken")) {
      // Clone before reading body so the original response stays consumable
      const cloned = response.clone();
      try {
        const json = await cloned.json();
        const msg = (json?.message || "").toLowerCase();
        if (
          msg.includes("disabled") ||
          msg.includes("has been deleted")
        ) {
          logout();
        }
      } catch (_) {
        // Non-JSON body — ignore
      }
    }
  }

  return response;
};

// ─── Session Guard Hook ───────────────────────────────────────────────────────
// Mount this once in App.js. It polls /api/auth/status every 30 seconds.
// When the admin disables or deletes the user's account, the NEXT poll will
// receive a 401, the fetch interceptor above catches it, and logout() fires —
// kicking the user out within at most 30 seconds, even if they made no other
// API calls.
const POLL_INTERVAL_MS = 30_000; // 30 seconds

export const useSessionGuard = () => {
  useEffect(() => {
    if (!getCookie("authToken")) return; // not logged in, skip

    const checkStatus = async () => {
      if (!getCookie("authToken")) return; // token removed mid-interval
      try {
        await fetch(`${API_BASE_URL}/api/auth/status`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getCookie("authToken")}`,
            "Content-Type": "application/json",
          },
        });
        // fetch interceptor handles the 401 automatically — nothing extra needed
      } catch (_) {
        // Network error — silently ignore, do NOT logout on network issues
      }
    };

    // Check immediately on mount, then on every interval
    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
};