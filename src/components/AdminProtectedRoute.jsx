import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasToken, getUserProfile, getCookie, setCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // First check if user has token
        if (!hasToken()) {
          navigate("/", { replace: true });
          return;
        }

        // Check if user is admin from cookie
        let userProfile = getUserProfile();
        let userRole = userProfile?.role;

        // If role not in cookie, fetch from API
        if (!userRole) {
          const token = getCookie("authToken");
          if (token) {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data && data.data.profile) {
                userRole = data.data.profile.role || 'user';
                // Update cookie with role
                const updatedProfile = { ...data.data.profile, role: userRole };
                setCookie("userProfile", JSON.stringify(updatedProfile), 7);
              }
            }
          }
        }

        // Check if user is admin
        if (userRole === 'admin') {
          setIsUserAdmin(true);
        } else {
          // Not admin, redirect to home
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        navigate("/", { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // Show loading or nothing while checking
  if (checking) {
    return null;
  }

  // If not admin, don't render (will redirect)
  if (!isUserAdmin) {
    return null;
  }

  // User is admin, render children
  return children;
};

export default AdminProtectedRoute;
