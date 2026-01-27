import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, hasToken, getProfileStatus } from "../utils/auth";

const PublicRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated and profile is complete, redirect to home
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    } else if (hasToken() && !getProfileStatus()) {
      // User has token but profile not complete - redirect to profile completion
      navigate("/profile-complete", { replace: true });
    }
  }, [navigate]);

  // If authenticated and profile complete, don't render children (will redirect)
  if (isAuthenticated()) {
    return null;
  }

  // If has token but profile not complete, redirect to profile completion
  if (hasToken() && !getProfileStatus()) {
    return null;
  }

  // User is not authenticated, allow access to public routes
  return children;
};

export default PublicRoute;

