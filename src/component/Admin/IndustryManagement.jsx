import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { getIndustries, createIndustry, updateIndustry, deleteIndustry } from "../../utils/adminApi";

const IndustryManagement = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Fetch industries from API
  const fetchIndustries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getIndustries(currentPage, itemsPerPage, searchTerm);
      
      if (response.success && response.data) {
        setIndustries(response.data.industries || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch industries");
      console.error("Error fetching industries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, [currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchIndustries();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = pagination.totalPages;
  const totalIndustries = pagination.totalItems;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "" });
    setIsAddModalOpen(true);
  };

  const handleEdit = (industry) => {
    setEditingIndustry(industry);
    setFormData({ name: industry.name || "" });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (industryId) => {
    if (!window.confirm("Are you sure you want to delete this industry?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteIndustry(industryId);
      await fetchIndustries(); // Refresh the list
      if (currentPage > 1 && industries.length === 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      alert(err.message || "Failed to delete industry");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter an industry name");
      return;
    }

    try {
      setSubmitting(true);
      if (isEditModalOpen) {
        // Update existing industry
        await updateIndustry(editingIndustry._id, {
          name: formData.name.trim(),
        });
      } else {
        // Add new industry
        await createIndustry({
          name: formData.name.trim(),
        });
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({ name: "" });
      setEditingIndustry(null);
      await fetchIndustries(); // Refresh the list
    } catch (err) {
      alert(err.message || "Failed to save industry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="section-title">Industry Management</h2>
        <div className="admin-actions">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search industries..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={20} />
            Add Industry
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="2" className="empty-state" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : industries.length === 0 ? (
              <tr>
                <td colSpan="2" className="empty-state">
                  No industries found
                </td>
              </tr>
            ) : (
              industries.map((industry) => (
                <tr key={industry._id}>
                  <td>{industry.name || "N/A"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(industry)}
                        title="Edit"
                        disabled={loading}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(industry._id)}
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

      <div className="pagination-container">
        <div className="pagination-info">
          Showing {industries.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalIndustries)} of {totalIndustries} industries
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`pagination-number ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Industry</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Industry Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter industry name"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={16} />
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Industry</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Industry Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter industry name"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={16} />
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryManagement;

