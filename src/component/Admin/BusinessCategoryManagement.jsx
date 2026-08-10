import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import { 
  getAdminBusinessCategories, 
  createBusinessCategory, 
  toggleBusinessCategoryStatus, 
  deleteBusinessCategory,
  updateBusinessCategory
} from "../../utils/adminApi";

const BusinessCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch business categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminBusinessCategories(searchTerm);
      if (response.success && response.data) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch business categories");
      console.error("Error fetching business categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAdd = () => {
    setFormData({ name: "", description: "" });
    setEditingCategory(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name || "", description: category.description || "" });
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await toggleBusinessCategoryStatus(id);
      await fetchCategories();
    } catch (err) {
      alert(err.message || "Failed to toggle status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteBusinessCategory(id);
      await fetchCategories();
    } catch (err) {
      alert(err.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await updateBusinessCategory(editingCategory._id, {
          name: formData.name.trim(),
          description: formData.description.trim()
        });
      } else {
        await createBusinessCategory({
          name: formData.name.trim(),
          description: formData.description.trim()
        });
      }
      setIsAddModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
      await fetchCategories();
    } catch (err) {
      alert(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="section-title">Business Category Management</h2>
        <div className="admin-actions">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search categories..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={20} />
            Add Category
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="empty-state" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  No business categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id}>
                  <td><strong>{category.name || "N/A"}</strong></td>
                  <td>{category.description || "—"}</td>
                  <td>
                    <span className={`status-badge ${category.isActive ? "status-active" : "status-inactive"}`} style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", display: "inline-block", background: category.isActive ? "#DEF7EC" : "#FDE8E8", color: category.isActive ? "#03543F" : "#9B1C1C" }}>
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(category)}
                        title="Edit"
                        disabled={loading}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleToggleStatus(category._id)}
                        title={category.isActive ? "Deactivate" : "Activate"}
                        disabled={loading}
                        style={{
                          color: category.isActive ? "#D97706" : "#059669",
                          backgroundColor: category.isActive ? "#FEF3C7" : "#D1FAE5"
                        }}
                      >
                        {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(category._id)}
                        title="Delete"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => {
          setIsAddModalOpen(false);
          setEditingCategory(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Business Category" : "Add New Business Category"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Technology, Retail, Healthcare"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="form-groups" style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: "80px", resize: "vertical", padding: "10px" }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a brief description..."
                  disabled={submitting}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={16} />
                  {submitting ? "Saving..." : (editingCategory ? "Update Category" : "Save Category")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCategoryManagement;
