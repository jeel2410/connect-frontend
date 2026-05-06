import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, Monitor, Smartphone, ToggleLeft, ToggleRight, Upload, AlertCircle, Image } from "lucide-react";
import { getAuthBanners, createAuthBanner, deleteAuthBanner, toggleAuthBanner } from "../../utils/adminApi";

const DESKTOP_MIN_W = 400;
const DESKTOP_MIN_H = 600;
const MOBILE_MIN_W = 300;
const MOBILE_MIN_H = 150;

const validateDimensions = (file, type) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      let warning = "";
      if (type === "desktop") {
        if (w < DESKTOP_MIN_W || h < DESKTOP_MIN_H)
          warning = `Desktop banners should be at least ${DESKTOP_MIN_W}×${DESKTOP_MIN_H}px. Your image is ${w}×${h}px and may appear pixelated.`;
        else if (w > h)
          warning = `Desktop banners work best in portrait orientation. Your image is ${w}×${h}px (landscape) and will be letterboxed.`;
      } else {
        if (w < MOBILE_MIN_W || h < MOBILE_MIN_H)
          warning = `Mobile banners should be at least ${MOBILE_MIN_W}×${MOBILE_MIN_H}px. Your image is ${w}×${h}px.`;
        else if (w / h > 3)
          warning = `Very wide images (${w}×${h}px) may be cropped on small screens. Recommended max ratio is 3:1.`;
      }
      resolve(warning);
    };
    img.onerror = () => resolve("");
    img.src = URL.createObjectURL(file);
  });

const AuthBannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: "desktop", image: null, preview: null });
  const [imgWarning, setImgWarning] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const fileInputRef = useRef();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAuthBanners();
      if (response.success && response.data) {
        setBanners(response.data.banners || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: file, preview }));
    const warning = await validateDimensions(file, formData.type);
    setImgWarning(warning);
  };

  const handleTypeChange = async (type) => {
    setFormData((prev) => ({ ...prev, type }));
    if (formData.image) {
      const warning = await validateDimensions(formData.image, type);
      setImgWarning(warning);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError("Please select an image file.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const fd = new FormData();
      fd.append("image", formData.image);
      fd.append("type", formData.type);
      await createAuthBanner(fd);
      closeAddModal();
      await fetchBanners();
    } catch (err) {
      setError(err.message || "Failed to upload banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner? This will also remove it from storage and cannot be undone.")) return;
    try {
      setError(null);
      await deleteAuthBanner(id);
      await fetchBanners();
    } catch (err) {
      setError(err.message || "Failed to delete banner");
    }
  };

  const handleToggle = async (id) => {
    try {
      setError(null);
      await toggleAuthBanner(id);
      await fetchBanners();
    } catch (err) {
      setError(err.message || "Failed to update banner");
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setFormData({ type: "desktop", image: null, preview: null });
    setImgWarning("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const desktopBanners = banners.filter((b) => b.type === "desktop");
  const mobileBanners = banners.filter((b) => b.type === "mobile");

  return (
    <div className="admin-section">
      {/* Header */}
      <div className="admin-section-header">
        <div className="section-title-group">
          <h2 className="section-title">Auth Banner Management</h2>
          <span className="total-count-badge">{banners.length} total</span>
        </div>
        <div className="admin-actions">
          <button className="add-btn" onClick={() => { setError(null); setIsAddModalOpen(true); }}>
            <Plus size={20} />
            Add Banner
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#DC2626", fontSize: 14 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="empty-state">
          No banners uploaded yet. Click "Add Banner" to get started.
        </div>
      ) : (
        <>
          <BannerSection
            title="Desktop Banners"
            icon={<Monitor size={16} />}
            hint="Shown as the left-side panel on desktop (portrait, min 400×600px recommended)"
            banners={desktopBanners}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
          <BannerSection
            title="Mobile Banners"
            icon={<Smartphone size={16} />}
            hint="Shown as a top banner on mobile (landscape, min 300×150px recommended)"
            banners={mobileBanners}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* Add Banner Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Auth Banner</h3>
              <button className="modal-close-btn" onClick={closeAddModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Banner type selector */}
              <div className="form-groups">
                <label>Banner Type</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { value: "desktop", label: "Desktop", icon: Monitor, hint: "Left panel on desktop (portrait)" },
                    { value: "mobile", label: "Mobile", icon: Smartphone, hint: "Top banner on mobile (landscape)" },
                  ].map(({ value, label, icon: Icon, hint }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleTypeChange(value)}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "14px 12px",
                        borderRadius: 12,
                        border: `2px solid ${formData.type === value ? "#EA650A" : "#E4E6EB"}`,
                        background: formData.type === value ? "#FFF4ED" : "#F4F5F6",
                        color: formData.type === value ? "#EA650A" : "#777E90",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <Icon size={22} />
                      {label}
                      <span style={{ fontSize: 11, fontWeight: 400, color: formData.type === value ? "#d45a09" : "#9ca3af", textAlign: "center" }}>
                        {hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload area */}
              <div className="form-groups">
                <label>Image File <span style={{ fontWeight: 400, color: "#777E90" }}>(JPG, PNG or WebP, max 10MB)</span></label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${formData.preview ? "#EA650A" : "#E4E6EB"}`,
                    borderRadius: 12,
                    padding: formData.preview ? 12 : 32,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: "pointer",
                    background: formData.preview ? "#FFF4ED" : "#F4F5F6",
                    transition: "all 0.2s",
                    minHeight: formData.preview ? "auto" : 140,
                  }}
                >
                  {formData.preview ? (
                    <>
                      <img
                        src={formData.preview}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 8 }}
                      />
                      <span style={{ fontSize: 12, color: "#777E90" }}>Click to change image</span>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#E4E6EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Upload size={22} style={{ color: "#777E90" }} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#09122E", margin: 0, fontFamily: "Inter, sans-serif" }}>Click to upload image</p>
                        <p style={{ fontSize: 12, color: "#777E90", margin: "4px 0 0", fontFamily: "Inter, sans-serif" }}>JPG, PNG or WebP up to 10MB</p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>

                {imgWarning && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 10, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 10 }}>
                    <AlertCircle size={15} style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#92400E", margin: 0, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{imgWarning}</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeAddModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || !formData.image}>
                  <Upload size={16} />
                  {submitting ? "Uploading..." : "Upload Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BannerSection = ({ title, icon, hint, banners, onToggle, onDelete }) => (
  <div style={{ marginBottom: 36 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600, color: "#09122E", fontFamily: "Basier Square, sans-serif" }}>
        {icon} {title}
      </span>
      <span style={{ background: "#F4F5F6", border: "1px solid #E4E6EB", borderRadius: 20, padding: "2px 10px", fontSize: 12, color: "#777E90", fontWeight: 500 }}>
        {banners.length}
      </span>
      <span style={{ fontSize: 12, color: "#777E90", marginLeft: 4 }}>— {hint}</span>
    </div>

    {banners.length === 0 ? (
      <div style={{ background: "#F4F5F6", border: "1px dashed #E4E6EB", borderRadius: 12, padding: "24px 16px", textAlign: "center", color: "#777E90", fontSize: 14, fontFamily: "Inter, sans-serif" }}>
        No {title.toLowerCase()} uploaded yet
      </div>
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 }}>
        {banners.map((banner) => (
          <div
            key={banner._id}
            style={{
              background: "#fff",
              border: `1.5px solid ${banner.isActive ? "#86EFAC" : "#E4E6EB"}`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ position: "relative", height: 130, background: "#F4F5F6" }}>
              <img
                src={banner.imageUrl}
                alt="Banner"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <span style={{
                position: "absolute", top: 8, right: 8,
                background: banner.isActive ? "#16A34A" : "#6B7280",
                color: "#fff", fontSize: 11, fontWeight: 600,
                padding: "3px 9px", borderRadius: 20,
                fontFamily: "Inter, sans-serif",
              }}>
                {banner.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F4F5F6" }}>
              <span style={{ fontSize: 12, color: "#777E90", fontFamily: "Inter, sans-serif" }}>
                {new Date(banner.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <div className="action-buttons">
                <button
                  title={banner.isActive ? "Deactivate" : "Activate"}
                  className="action-btn"
                  onClick={() => onToggle(banner._id)}
                  style={{ color: banner.isActive ? "#16A34A" : "#9CA3AF", background: banner.isActive ? "#F0FDF4" : "#F4F5F6" }}
                >
                  {banner.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
                <button
                  title="Delete"
                  className="action-btn delete-btn"
                  onClick={() => onDelete(banner._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AuthBannerManagement;
