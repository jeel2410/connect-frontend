import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { getCompanies, createCompany, updateCompany, deleteCompany } from "../../utils/adminApi";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
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
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({ name: "", industryId: "" });
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCompanies(currentPage, itemsPerPage, searchTerm);
      
      if (response.success && response.data) {
        setCompanies(response.data.companies || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch companies");
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch industries from API
  const fetchIndustries = async () => {
    try {
      const token = getCookie("authToken");
      const response = await fetch(`${API_BASE_URL}/api/list/industries`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch industries");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setIndustries(data.data.industries || data.data || []);
      }
    } catch (err) {
      console.error("Error fetching industries:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchIndustries();
  }, [currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchCompanies();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = pagination.totalPages;
  const totalCompanies = pagination.totalItems;

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
    setFormData({ name: "", industryId: "" });
    setIsAddModalOpen(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({ 
      name: company.name || "",
      industryId: company.industry?._id || ""
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteCompany(companyId);
      await fetchCompanies(); // Refresh the list
      if (currentPage > 1 && companies.length === 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      alert(err.message || "Failed to delete company");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a company name");
      return;
    }

    if (!formData.industryId) {
      alert("Please select an industry");
      return;
    }

    try {
      setSubmitting(true);
      if (isEditModalOpen) {
        // Update existing company
        await updateCompany(editingCompany._id, {
          name: formData.name.trim(),
          industry: formData.industryId,
        });
      } else {
        // Add new company
        await createCompany({
          name: formData.name.trim(),
          industry: formData.industryId,
        });
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({ name: "", industryId: "" });
      setEditingCompany(null);
      await fetchCompanies(); // Refresh the list
    } catch (err) {
      alert(err.message || "Failed to save company");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="section-title">Company Management</h2>
        <div className="admin-actions">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search companies..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={20} />
            Add Company
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="3" className="empty-state" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-state">
                  No companies found
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id}>
                  <td>{company.name || "N/A"}</td>
                  <td>{company.industry?.name || "N/A"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(company)}
                        title="Edit"
                        disabled={loading}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(company._id)}
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
          Showing {companies.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalCompanies)} of {totalCompanies} companies
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
              <h3>Add New Company</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>Industry</label>
                <select
                  className="form-input"
                  value={formData.industryId}
                  onChange={(e) => setFormData({ ...formData, industryId: e.target.value })}
                  required
                  disabled={submitting}
                >
                  <option value="">Select an industry</option>
                  {industries.map((industry) => (
                    <option key={industry._id} value={industry._id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
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
              <h3>Edit Company</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>Industry</label>
                <select
                  className="form-input"
                  value={formData.industryId}
                  onChange={(e) => setFormData({ ...formData, industryId: e.target.value })}
                  required
                  disabled={submitting}
                >
                  <option value="">Select an industry</option>
                  {industries.map((industry) => (
                    <option key={industry._id} value={industry._id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
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

export default CompanyManagement;

