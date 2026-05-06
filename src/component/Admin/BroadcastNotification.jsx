import React, { useState } from "react";
import { Send, Mail, AlertCircle, CheckCircle, Bell } from "lucide-react";
import { broadcastNotification, broadcastOfferEmail } from "../../utils/adminApi";

const StatusBanner = ({ error, success }) => {
  if (error)
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, color: "#DC2626", marginBottom: 20, fontSize: 14 }}>
        <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
      </div>
    );
  if (success)
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, color: "#166534", marginBottom: 20, fontSize: 14 }}>
        <CheckCircle size={16} style={{ flexShrink: 0 }} /> {success}
      </div>
    );
  return null;
};

// ─── Push Notification Section ───────────────────────────────────────────────

const PushSection = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setError("Please enter a notification title");
    if (!formData.description.trim()) return setError("Please enter a notification description");
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const response = await broadcastNotification({ title: formData.title.trim(), description: formData.description.trim() });
      if (response.success) {
        setSuccessMsg(response.message || "Push notification sent to all users!");
        setFormData({ title: "", description: "" });
        setTimeout(() => setSuccessMsg(null), 5000);
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
    <div style={{ background: "#fff", border: "1px solid #E4E6EB", borderRadius: 14, padding: "28px 32px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF4ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={18} style={{ color: "#EC7523" }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#09122E", fontFamily: "Basier Square, sans-serif" }}>Push Notification</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#777E90" }}>Send an in-app push notification to all users</p>
        </div>
      </div>

      <div style={{ height: 1, background: "#E4E6EB", margin: "20px 0" }} />

      <StatusBanner error={error} success={successMsg} />

      <form onSubmit={handleSubmit}>
        <div className="form-groups">
          <label>Notification Title <span style={{ color: "#EC7523" }}>*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setError(null); }}
            placeholder="e.g. New Feature Available!"
            disabled={submitting}
          />
        </div>
        <div className="form-groups">
          <label>Message <span style={{ color: "#EC7523" }}>*</span></label>
          <textarea
            className="form-input"
            value={formData.description}
            onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setError(null); }}
            placeholder="Enter the notification message..."
            rows={4}
            disabled={submitting}
            style={{ resize: "vertical" }}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          <Send size={15} />
          {submitting ? "Sending..." : "Send Push Notification"}
        </button>
      </form>
    </div>
  );
};

// ─── Offer Email Section ─────────────────────────────────────────────────────

const OfferEmailSection = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setError("Please enter an offer title");
    if (!formData.description.trim()) return setError("Please enter the offer description");
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const response = await broadcastOfferEmail({ title: formData.title.trim(), description: formData.description.trim() });
      if (response.success) {
        const { sent = 0, skipped = 0 } = response.data || {};
        setSuccessMsg(`Offer email sent to ${sent} user${sent !== 1 ? "s" : ""}${skipped > 0 ? ` (${skipped} skipped — no email on file)` : ""}.`);
        setFormData({ title: "", description: "" });
        setTimeout(() => setSuccessMsg(null), 8000);
      } else {
        setError(response.message || "Failed to send offer email");
      }
    } catch (err) {
      setError(err.message || "Failed to send offer email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E4E6EB", borderRadius: 14, padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={18} style={{ color: "#3B82F6" }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#09122E", fontFamily: "Basier Square, sans-serif" }}>Broadcast Offer Email</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#777E90" }}>Send a promotional offer email to all users who have registered an email address</p>
        </div>
      </div>

      <div style={{ height: 1, background: "#E4E6EB", margin: "20px 0" }} />

      <StatusBanner error={error} success={successMsg} />

      <form onSubmit={handleSubmit}>
        <div className="form-groups">
          <label>Offer Title / Subject <span style={{ color: "#EC7523" }}>*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setError(null); }}
            placeholder="e.g. Exclusive HDFC Credit Card Offer for Connect Members"
            disabled={submitting}
          />
        </div>
        <div className="form-groups">
          <label>Offer Description <span style={{ color: "#EC7523" }}>*</span></label>
          <textarea
            className="form-input"
            value={formData.description}
            onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setError(null); }}
            placeholder="Describe the offer details — benefits, eligibility, how to apply..."
            rows={5}
            disabled={submitting}
            style={{ resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" className="btn-primary" disabled={submitting} style={{ background: "#3B82F6" }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#2563EB"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#3B82F6"; }}>
            <Mail size={15} />
            {submitting ? "Sending Emails..." : "Send Offer Email"}
          </button>
          <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
            Only users with a registered email address will receive this mail.
          </p>
        </div>
      </form>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const BroadcastNotification = () => (
  <div className="admin-section">
    <div className="admin-section-header" style={{ marginBottom: 28 }}>
      <div className="section-title-group">
        <h2 className="section-title">Broadcast & Mailers</h2>
      </div>
    </div>

    <div style={{ maxWidth: 720 }}>
      <PushSection />
      <OfferEmailSection />
    </div>
  </div>
);

export default BroadcastNotification;
