import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, hasToken, getProfileStatus } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has token
    if (!hasToken()) {
      // No token - redirect to root (which will show Register)
      navigate("/", { replace: true });
      return;
    }

    // User has token - check if profile is complete
    const isProfileComplete = getProfileStatus();
    if (!isProfileComplete) {
      // Has token but profile not complete - redirect to profile completion
       navigate("/profile-complete", { replace: true });
      return;
    }

    // User is authenticated and profile is complete - allow access
  }, [navigate]);

  // Check authentication status
  if (!hasToken()) {
    return null; // Will redirect to root
  }

  const isProfileComplete = getProfileStatus();
  if (!isProfileComplete) {
    return null; // Will redirect to profile completion
  }

  // User is authenticated and profile is complete, render children
  return children;
};

export default ProtectedRoute;

