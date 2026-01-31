import React, { useState } from "react";
import Header from "../component/Header";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import "../styles/style.css";
import { getCookie, logout } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const DeleteAccount = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError("");
      
      const token = getCookie("authToken");
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/user/account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete account. Please try again.");
      }

      if (result.success) {
        // Logout and redirect to login page
        logout();
      } else {
        throw new Error(result.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <Sidebar />
        <div className="dating-profile-main">
          <div className="delete-account-page-container">
            <div className="delete-account-content">
             
              
              
              
                
                
                <button 
                  className="delete-account-btn"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                >
                  Delete Account
                </button>         
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="delete-modal-title">Delete Account</h2>
            <p className="delete-modal-message">
              Your account will be permanently deleted and this action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button 
                className="delete-modal-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="delete-modal-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default DeleteAccount;
