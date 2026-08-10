import React, { useState, useEffect } from "react";
import "../../styles/style.css";
import uploadIcon from "../../assets/image/upload_icon.png";
import fullnameIcon from "../../assets/image/firstname.png";
import religionIcon from "../../assets/image/religion.png";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const BusinessStep1 = ({ data, updateData, errors, touched }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/business-categories`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const result = await response.json();

        if (result.success && result.data && result.data.categories) {
          setCategories(result.data.categories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoriesError("Failed to load categories");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Set up previews
  useEffect(() => {
    if (data.businessLogo && typeof data.businessLogo === "string" && data.businessLogo.startsWith("data:")) {
      setLogoPreview(data.businessLogo);
    } else if (data.businessLogo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(data.businessLogo);
    } else if (data.businessLogo && typeof data.businessLogo === "string") {
      setLogoPreview(data.businessLogo);
    } else {
      setLogoPreview(null);
    }
  }, [data.businessLogo]);

  useEffect(() => {
    if (data.businessCoverImage && typeof data.businessCoverImage === "string" && data.businessCoverImage.startsWith("data:")) {
      setCoverPreview(data.businessCoverImage);
    } else if (data.businessCoverImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(data.businessCoverImage);
    } else if (data.businessCoverImage && typeof data.businessCoverImage === "string") {
      setCoverPreview(data.businessCoverImage);
    } else {
      setCoverPreview(null);
    }
  }, [data.businessCoverImage]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Logo size must be less than 5MB");
        return;
      }
      updateData("businessLogo", file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Cover image size must be less than 5MB");
        return;
      }
      updateData("businessCoverImage", file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="step-content active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h2 className="step-title" style={{ margin: 0 }}>Tell us about your business</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#EA650A" }}>
          <input
            type="checkbox"
            checked={data.isBusinessProfile || false}
            onChange={(e) => updateData("isBusinessProfile", e.target.checked)}
            style={{ width: "16px", height: "16px", accentColor: "#EA650A" }}
          />
          Switch to a Business Profile
        </label>
      </div>
      <p className="step-description">Share the basics about your business to help customers and professionals discover you.</p>

      {/* Business Name */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon} alt="Business Name"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={data.businessName || ""}
              onChange={(e) => updateData("businessName", e.target.value)}
              onBlur={() => updateData("_touched_businessName", true)}
              className={`form-input ${touched?.businessName && errors?.businessName ? "input-error" : ""}`}
              placeholder="Enter your business name"
            />
            {touched?.businessName && errors?.businessName && (
              <div className="field-error-message">{errors.businessName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Business Logo Upload */}
      <div className="form-group" style={{ marginBottom: "24px" }}>
        <label className="input-label" style={{ display: "block", marginBottom: "8px" }}>Business Logo</label>
        <div
          className={`upload-container ${logoPreview ? "has-image" : ""}`}
          style={{ height: "140px", border: "2px dashed #DDE2EE", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden" }}
        >
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            onChange={handleLogoChange}
            style={{ display: "none" }}
          />
          {logoPreview ? (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: "90px", objectFit: "contain", borderRadius: "8px" }} />
              <label htmlFor="logo-upload" style={{ position: "absolute", bottom: "8px", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
                Change Logo
              </label>
            </div>
          ) : (
            <label htmlFor="logo-upload" style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", width: "100%", height: "100%", justifyContent: "center" }}>
              <img src={uploadIcon} alt="Upload" style={{ width: "24px", height: "24px", marginBottom: "8px" }}></img>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#3b82f6" }}>Upload Logo</span>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>Max 5MB image</span>
            </label>
          )}
        </div>
      </div>

      {/* Business Cover Image Upload */}
      <div className="form-group" style={{ marginBottom: "24px" }}>
        <label className="input-label" style={{ display: "block", marginBottom: "8px" }}>Cover Image</label>
        <div
          className={`upload-container ${coverPreview ? "has-image" : ""}`}
          style={{ height: "160px", border: "2px dashed #DDE2EE", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden" }}
        >
          <input
            type="file"
            id="cover-upload"
            accept="image/*"
            onChange={handleCoverChange}
            style={{ display: "none" }}
          />
          {coverPreview ? (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <img src={coverPreview} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <label htmlFor="cover-upload" style={{ position: "absolute", bottom: "8px", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
                Change Cover Image
              </label>
            </div>
          ) : (
            <label htmlFor="cover-upload" style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", width: "100%", height: "100%", justifyContent: "center" }}>
              <img src={uploadIcon} alt="Upload" style={{ width: "24px", height: "24px", marginBottom: "8px" }}></img>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#3b82f6" }}>Upload Cover Image</span>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>Max 5MB image</span>
            </label>
          )}
        </div>
      </div>

      {/* Business Tagline */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon} alt="Business Tagline"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Business Tagline</label>
            <input
              type="text"
              name="businessTagline"
              value={data.businessTagline || ""}
              onChange={(e) => updateData("businessTagline", e.target.value)}
              onBlur={() => updateData("_touched_businessTagline", true)}
              className={`form-input ${touched?.businessTagline && errors?.businessTagline ? "input-error" : ""}`}
              placeholder="Enter business tagline (max 160 chars)"
              maxLength={160}
            />
            {touched?.businessTagline && errors?.businessTagline && (
              <div className="field-error-message">{errors.businessTagline}</div>
            )}
          </div>
        </div>
      </div>

      {/* Business Category */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={religionIcon} alt="Category"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Business Category</label>
            <select
              value={data.businessCategory || ""}
              onChange={(e) => updateData("businessCategory", e.target.value)}
              onBlur={() => updateData("_touched_businessCategory", true)}
              className={touched?.businessCategory && errors?.businessCategory ? "input-error" : ""}
              disabled={loadingCategories}
            >
              <option value="">{loadingCategories ? "Loading categories..." : "\u00A0Select Category"}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {"\u00A0" + cat.name}
                </option>
              ))}
            </select>
            {categoriesError && (
              <div className="field-error-message" style={{ color: "#666", fontSize: "12px" }}>
                {categoriesError}
              </div>
            )}
            {touched?.businessCategory && errors?.businessCategory && (
              <div className="field-error-message">{errors.businessCategory}</div>
            )}
          </div>
        </div>
        {data.businessCategory && categories.find(cat => cat._id === data.businessCategory)?.description && (
          <div className="category-description-box" style={{
            marginTop: "12px",
            padding: "12px 16px",
            backgroundColor: "#F9FAFB",
            borderLeft: "4px solid #EA650A",
            borderRadius: "0 8px 8px 0",
            fontSize: "13px",
            color: "#4B5563",
            lineHeight: "1.5",
            animation: "fadeIn 0.3s ease-in-out"
          }}>
            <div style={{ fontWeight: "600", color: "#09122E", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA650A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              About this Category
            </div>
            {categories.find(cat => cat._id === data.businessCategory).description}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessStep1;
