import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and profile is complete
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated or profile not complete
      navigate("/Login", { replace: true });
    }
  }, [navigate]);

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated()) {
    return null;
  }

  // User is authenticated and profile is complete, render children
  return children;
};

export default ProtectedRoute;

