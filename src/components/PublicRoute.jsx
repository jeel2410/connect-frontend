import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const PublicRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated and profile is complete, redirect to home
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // If authenticated, don't render children (will redirect)
  if (isAuthenticated()) {
    return null;
  }

  // User is not authenticated, allow access to public routes
  return children;
};

export default PublicRoute;

