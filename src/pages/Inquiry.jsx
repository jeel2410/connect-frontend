import React, { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/style.css";
import API_BASE_URL from "../utils/config";
import { getCookie } from "../utils/auth";

const Inquiry = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }
      if (formData.name.trim().length < 2) {
        setError("Name must be at least 2 characters");
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }
      if (!formData.subject.trim()) {
        setError("Subject is required");
        setLoading(false);
        return;
      }
      if (formData.subject.trim().length < 3) {
        setError("Subject must be at least 3 characters");
        setLoading(false);
        return;
      }
      if (!formData.message.trim()) {
        setError("Message is required");
        setLoading(false);
        return;
      }
      if (formData.message.trim().length < 10) {
        setError("Message must be at least 10 characters");
        setLoading(false);
        return;
      }

      // Get token if available (optional authentication)
      const token = getCookie("authToken");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/info/inquiry`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit inquiry. Please try again.");
      }

      if (result.success) {
        setSuccess("Your inquiry has been submitted successfully! We'll get back to you soon.");
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(result.message || "Failed to submit inquiry");
      }
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Header />
      <div className="inquiry-page">
        <div className="inquiry-container">
          

          <div className="inquiry-form-wrapper">
            <form className="inquiry-form" onSubmit={handleSubmit}>
              {error && (
                <div className="inquiry-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="inquiry-success">
                  {success}
                </div>
              )}

              <div className="inquiry-form-group">
                <label className="inquiry-label">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="inquiry-input"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className="inquiry-form-group">
                <label className="inquiry-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="inquiry-input"
                  required
                />
              </div>

              <div className="inquiry-form-group">
                <label className="inquiry-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number (optional)"
                  className="inquiry-input"
                />
              </div>

              <div className="inquiry-form-group">
                <label className="inquiry-label">
                  Subject <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  className="inquiry-input"
                  required
                  minLength={3}
                  maxLength={200}
                />
              </div>

              <div className="inquiry-form-group">
                <label className="inquiry-label">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  className="inquiry-textarea"
                  rows={6}
                  required
                  minLength={10}
                  maxLength={2000}
                />
              </div>

              <button
                type="submit"
                className="inquiry-submit-btn"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Inquiry;
