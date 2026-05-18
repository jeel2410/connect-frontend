import React, { useState, useEffect } from "react";
import { Send, Mail, AlertCircle, CheckCircle, Bell, MessageSquare, Users } from "lucide-react";
import { 
  broadcastNotification,
  broadcastOfferEmail, 
  getIncompleteProfileCount, 
  sendIncompleteProfileSms,
  getGeneralUserCount,
  sendGeneralSmsBroadcast,
  getTargetedEmailUserCount,
  sendTargetedEmailBroadcast
} from "../../utils/adminApi";

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

function PushSection() {
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
}

// ─── Offer Email Section ─────────────────────────────────────────────────────

function OfferEmailSection() {
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
}

// ─── Incomplete Profile SMS Section ───────────────────────────────────────────

function IncompleteProfileSmsSection() {
  const [formData, setFormData] = useState({ days: "all", message: "" });
  const [userCount, setUserCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoadingCount(true);
        const response = await getIncompleteProfileCount(formData.days);
        if (response.success) {
          setUserCount(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching incomplete profile count:", err);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchCount();
  }, [formData.days]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim() && !formData.templateId.trim()) {
      return setError("Please enter either an SMS message or a Template ID");
    }
    if (userCount === 0) return setError("No users match the selected criteria");

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const response = await sendIncompleteProfileSms({
        days: formData.days,
        message: formData.message.trim(),
        templateId: formData.templateId.trim()
      });
      if (response.success) {
        setSuccessMsg(`SMS broadcast initiated to ${response.data.sent} users!`);
        setFormData({ ...formData, message: "", templateId: "" });
        setTimeout(() => setSuccessMsg(null), 8000);
      } else {
        setError(response.message || "Failed to send SMS broadcast");
      }
    } catch (err) {
      setError(err.message || "Failed to send SMS broadcast. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E4E6EB", borderRadius: 14, padding: "28px 32px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MessageSquare size={18} style={{ color: "#7C3AED" }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#09122E", fontFamily: "Basier Square, sans-serif" }}>Incomplete Profile SMS</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#777E90" }}>Send an SMS reminder to users who haven't completed their profile</p>
        </div>
      </div>

      <div style={{ height: 1, background: "#E4E6EB", margin: "20px 0" }} />

      <StatusBanner error={error} success={successMsg} />

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <div className="form-groups" style={{ flex: 1, marginBottom: 0 }}>
            <label>Registration Duration</label>
            <select
              className="form-input"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              disabled={submitting}
            >
              <option value="7">Registered in last 7 days</option>
              <option value="15">Registered in last 15 days</option>
              <option value="30">Registered in last 30 days</option>
              <option value="45">Registered in last 45 days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid #E2E8F0" }}>
            <div style={{ background: "#fff", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <Users size={16} style={{ color: "#64748B" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Target Users</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
                {loadingCount ? "..." : userCount}
              </p>
            </div>
          </div>
        </div>

        <div className="form-groups">
          <label>SMS Message</label>
          <textarea
            className="form-input"
            value={formData.message}
            onChange={(e) => { setFormData({ ...formData, message: e.target.value }); setError(null); }}
            placeholder="Hi {{name}}, complete your profile on Connect India to start finding matches! Visit: conect.in"
            rows={3}
            disabled={submitting}
            style={{ resize: "vertical" }}
          />
          <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#94A3B8" }}>
            Optional if using a Template ID. Use <code>{"{{name}}"}</code> for personalization.
          </p>
        </div>

        <div className="form-groups">
          <label>Template ID</label>
          <input
            type="text"
            className="form-input"
            value={formData.templateId}
            onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
            placeholder="e.g. HXa9e67bedbd3675f8adcc9b7a1..."
            disabled={submitting}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={submitting || userCount === 0} style={{ background: "#7C3AED" }}
          onMouseEnter={e => { if (!submitting && userCount > 0) e.currentTarget.style.background = "#6D28D9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#7C3AED"; }}>
          <Send size={15} />
          {submitting ? "Sending SMS..." : "Send SMS Broadcast"}
        </button>
      </form>
    </div>
  );
}

// ─── General SMS Broadcast Section ───────────────────────────────────────────

function GeneralSmsSection() {
  const [formData, setFormData] = useState({ days: "all", message: "", templateId: "" });
  const [userCount, setUserCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoadingCount(true);
        const response = await getGeneralUserCount(formData.days);
        if (response.success) {
          setUserCount(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching user count:", err);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchCount();
  }, [formData.days]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim() && !formData.templateId.trim()) {
      return setError("Please enter either an SMS message or a Template ID");
    }
    if (userCount === 0) return setError("No users match the selected criteria");

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const response = await sendGeneralSmsBroadcast({
        days: formData.days,
        message: formData.message.trim(),
        templateId: formData.templateId.trim()
      });
      if (response.success) {
        setSuccessMsg(`SMS broadcast initiated to ${response.data.sent} users!`);
        setFormData({ ...formData, message: "", templateId: "" });
        setTimeout(() => setSuccessMsg(null), 8000);
      } else {
        setError(response.message || "Failed to send SMS broadcast");
      }
    } catch (err) {
      setError(err.message || "Failed to send SMS broadcast. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E4E6EB", borderRadius: 14, padding: "28px 32px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FDF2F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MessageSquare size={18} style={{ color: "#DB2777" }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#09122E", fontFamily: "Basier Square, sans-serif" }}>General SMS Broadcast</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#777E90" }}>Send an SMS to users based on their registration date</p>
        </div>
      </div>

      <div style={{ height: 1, background: "#E4E6EB", margin: "20px 0" }} />

      <StatusBanner error={error} success={successMsg} />

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <div className="form-groups" style={{ flex: 1, marginBottom: 0 }}>
            <label>Registration Duration</label>
            <select
              className="form-input"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              disabled={submitting}
            >
              <option value="7">Registered in last 7 days</option>
              <option value="15">Registered in last 15 days</option>
              <option value="30">Registered in last 30 days</option>
              <option value="45">Registered in last 45 days</option>
              <option value="all">All Users</option>
            </select>
          </div>
          
          <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid #E2E8F0" }}>
            <div style={{ background: "#fff", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <Users size={16} style={{ color: "#64748B" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Target Users</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
                {loadingCount ? "..." : userCount}
              </p>
            </div>
          </div>
        </div>

        <div className="form-groups">
          <label>SMS Message</label>
          <textarea
            className="form-input"
            value={formData.message}
            onChange={(e) => { setFormData({ ...formData, message: e.target.value }); setError(null); }}
            placeholder="Enter your SMS message here..."
            rows={3}
            disabled={submitting}
            style={{ resize: "vertical" }}
          />
          <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#94A3B8" }}>
            Optional if using a Template ID. Use <code>{"{{name}}"}</code> for personalization.
          </p>
        </div>

        <div className="form-groups">
          <label>Template ID (DLT)</label>
          <input
            type="text"
            className="form-input"
            value={formData.templateId}
            onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
            placeholder="e.g. 1207161850123456789"
            disabled={submitting}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={submitting || userCount === 0} style={{ background: "#DB2777" }}
          onMouseEnter={e => { if (!submitting && userCount > 0) e.currentTarget.style.background = "#BE185D"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#DB2777"; }}>
          <Send size={15} />
          {submitting ? "Sending SMS..." : "Send SMS Broadcast"}
        </button>
      </form>
    </div>
  );
}

// ─── Targeted Email Broadcast Section ─────────────────────────────────────────

function TargetedEmailSection() {
  const [formData, setFormData] = useState({ days: "all", subject: "", htmlContent: "" });
  const [userCount, setUserCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoadingCount(true);
        const response = await getTargetedEmailUserCount(formData.days);
        if (response.success) {
          setUserCount(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching email user count:", err);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchCount();
  }, [formData.days]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) return setError("Please enter a subject");
    if (!formData.htmlContent.trim()) return setError("Please enter HTML content");
    if (userCount === 0) return setError("No users match the selected criteria");

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const response = await sendTargetedEmailBroadcast({
        days: formData.days,
        subject: formData.subject.trim(),
        htmlContent: formData.htmlContent.trim()
      });
      if (response.success) {
        setSuccessMsg(`Email broadcast initiated to ${response.data.sent} users!`);
        setFormData({ ...formData, subject: "", htmlContent: "" });
        setTimeout(() => setSuccessMsg(null), 8000);
      } else {
        setError(response.message || "Failed to send email broadcast");
      }
    } catch (err) {
      setError(err.message || "Failed to send email broadcast. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E4E6EB", borderRadius: 14, padding: "28px 32px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={18} style={{ color: "#3B82F6" }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#09122E", fontFamily: "Basier Square, sans-serif" }}>Targeted Email Broadcast</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#777E90" }}>Send custom HTML emails to users based on registration date</p>
        </div>
      </div>

      <div style={{ height: 1, background: "#E4E6EB", margin: "20px 0" }} />

      <StatusBanner error={error} success={successMsg} />

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <div className="form-groups" style={{ flex: 1, marginBottom: 0 }}>
            <label>Registration Duration</label>
            <select
              className="form-input"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              disabled={submitting}
            >
              <option value="7">Registered in last 7 days</option>
              <option value="15">Registered in last 15 days</option>
              <option value="30">Registered in last 30 days</option>
              <option value="45">Registered in last 45 days</option>
              <option value="all">All Users</option>
            </select>
          </div>
          
          <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid #E2E8F0" }}>
            <div style={{ background: "#fff", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <Users size={16} style={{ color: "#64748B" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Target Users</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
                {loadingCount ? "..." : userCount}
              </p>
            </div>
          </div>
        </div>

        <div className="form-groups">
          <label>Email Subject <span style={{ color: "#EC7523" }}>*</span></label>
          <input
            type="text"
            className="form-input"
            value={formData.subject}
            onChange={(e) => { setFormData({ ...formData, subject: e.target.value }); setError(null); }}
            placeholder="e.g. Weekly Updates from Connect India"
            disabled={submitting}
          />
        </div>

        <div className="form-groups">
          <label>HTML Source Code <span style={{ color: "#EC7523" }}>*</span></label>
          <textarea
            className="form-input"
            value={formData.htmlContent}
            onChange={(e) => { setFormData({ ...formData, htmlContent: e.target.value }); setError(null); }}
            placeholder="<div style='color: red;'>Hello {{name}}, welcome to Connect!</div>"
            rows={8}
            disabled={submitting}
            style={{ resize: "vertical", fontFamily: "monospace" }}
          />
          <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#94A3B8" }}>
            Paste complete HTML markup here. Use <code>{"{{name}}"}</code> to personalize the user's name automatically.
          </p>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting || userCount === 0} style={{ background: "#3B82F6" }}
          onMouseEnter={e => { if (!submitting && userCount > 0) e.currentTarget.style.background = "#2563EB"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#3B82F6"; }}>
          <Send size={15} />
          {submitting ? "Sending Emails..." : "Send Targeted Email"}
        </button>
      </form>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BroadcastNotification() {
  return (
    <div className="admin-section">
      <div className="admin-section-header" style={{ marginBottom: 28 }}>
        <div className="section-title-group">
          <h2 className="section-title">Broadcast & Mailers</h2>
        </div>
      </div>

      <div style={{ maxWidth: 720 }}>
        <TargetedEmailSection />
        <GeneralSmsSection />
        <IncompleteProfileSmsSection />
        <PushSection />
        <OfferEmailSection />
      </div>
    </div>
  );
}
