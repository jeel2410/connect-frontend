// Cookie utility functions
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

// Logout function
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

const token = getCookie("authToken");

// Log it
console.log("Auth Token:", token);