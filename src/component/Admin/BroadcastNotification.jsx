import React, { useState } from "react";
import { Send, AlertCircle, CheckCircle } from "lucide-react";
import { broadcastNotification } from "../../utils/adminApi";

const BroadcastNotification = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Please enter a notification title");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a notification description");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await broadcastNotification({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      if (response.success) {
        setSuccess(response.message || "Notification sent successfully to all users!");
        setFormData({ title: "", description: "" });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError(response.message || "Failed to send notification");
      }
    } catch (err) {
      setError(err.message || "Failed to send notification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="section-title">Broadcast Notification</h2>
        <p style={{ color: "#666", marginTop: "8px" }}>
          Send a notification to all users in the system
        </p>
      </div>

      <div style={{ maxWidth: "800px", marginTop: "24px" }}>
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "8px",
              color: "#c33",
              marginBottom: "20px",
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              backgroundColor: "#efe",
              border: "1px solid #cfc",
              borderRadius: "8px",
              color: "#3c3",
              marginBottom: "20px",
            }}
          >
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Notification Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setError(null);
              }}
              placeholder="Enter notification title"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label>Notification Description *</label>
            <textarea
              className="form-input"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setError(null);
              }}
              placeholder="Enter notification description"
              rows="6"
              required
              disabled={submitting}
            />
          </div>

          <div style={{ marginTop: "24px" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ minWidth: "150px" }}
            >
              <Send size={16} style={{ marginRight: "8px" }} />
              {submitting ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BroadcastNotification;

