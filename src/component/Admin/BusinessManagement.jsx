import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, ChevronLeft, ChevronRight, SlidersHorizontal, X, FileText, CheckCircle2, Pencil, Check } from "lucide-react";
import { getUsers, toggleUserStatus, deleteUser, approveBusiness, rejectBusiness, downloadBusinessDocument, updateBusinessName } from "../../utils/adminApi";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";
import { toast } from "react-toastify";

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const itemsPerPage = 10;

  const [editingNameId, setEditingNameId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Filter option lists
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch filter options (cities, categories)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const token = getCookie("authToken");
      if (!token) return;

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch cities
      try {
        const res = await fetch(`${API_BASE_URL}/api/list/city`, { headers });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.city) {
            setCities(result.data.city);
          }
        }
      } catch (err) {
        console.error("Error fetching cities for filters:", err);
      }

      // Fetch categories
      try {
        const res = await fetch(`${API_BASE_URL}/api/list/business-categories`, { headers });
        if (res.ok) {
          const result = await res.json();
          const categoryData = result.data?.categories || result.data?.businessCategories;
          if (result.success && result.data && categoryData) {
            setCategories(categoryData);
          }
        }
      } catch (err) {
        console.error("Error fetching categories for filters:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);
        // We pass categoryFilter as the industry param to the API since it maps to categories
        const response = await getUsers(
          currentPage,
          itemsPerPage,
          searchTerm,
          cityFilter,
          categoryFilter,
          "",
          "",
          "true"
        );
        
        if (response.success && response.data) {
          setBusinesses(response.data.users || []);
          setPagination(response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          });
        }
      } catch (err) {
        setError(err.message || "Failed to fetch businesses");
        console.error("Error fetching businesses:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBusinesses();
    }, (searchTerm || cityFilter || categoryFilter) ? 500 : 0);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, cityFilter, categoryFilter]);

  const totalPages = pagination.totalPages;
  const totalBusinesses = pagination.totalItems;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleToggleStatus = async (businessId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? "disable" : "enable"} this business profile?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await toggleUserStatus(businessId);
      if (res.success) {
        toast.success(res.message || "Business status updated successfully");
        setBusinesses(businesses.map(b => b._id === businessId ? { ...b, isActive: !currentStatus } : b));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update business status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm("Are you sure you want to permanently delete this business account? This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      const res = await deleteUser(businessId);
      if (res.success) {
        toast.success(res.message || "Business deleted successfully");
        setBusinesses(businesses.filter(b => b._id !== businessId));
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete business");
    } finally {
      setLoading(false);
    }
  };

  const patchBusinessDetails = (businessId, patch) => {
    setBusinesses(prev => prev.map(b => (
      b._id === businessId ? { ...b, userDetails: { ...b.userDetails, ...patch } } : b
    )));
  };

  const startEditingName = (businessId, currentName) => {
    setEditingNameId(businessId);
    setEditingNameValue(currentName || "");
  };

  const cancelEditingName = () => {
    setEditingNameId(null);
    setEditingNameValue("");
  };

  const saveBusinessName = async (businessId) => {
    const trimmed = editingNameValue.trim();
    if (!trimmed) {
      toast.error("Business name cannot be empty");
      return;
    }
    try {
      setSavingName(true);
      const res = await updateBusinessName(businessId, trimmed);
      if (res.success) {
        toast.success(res.message || "Business name updated successfully");
        patchBusinessDetails(businessId, { businessName: trimmed });
        cancelEditingName();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update business name");
    } finally {
      setSavingName(false);
    }
  };

  const handleApproveBusiness = async (businessId, businessName) => {
    if (!window.confirm(`Approve "${businessName || "this business"}" and mark it Verified?`)) {
      return;
    }
    try {
      const res = await approveBusiness(businessId);
      if (res.success) {
        toast.success(res.message || "Business approved");
        patchBusinessDetails(businessId, { businessApprovalStatus: "approved", businessRejectionReason: null });
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve business");
    }
  };

  const handleRejectBusiness = async (businessId) => {
    const reason = window.prompt("Reason for rejection (optional, shown to the business):", "");
    if (reason === null) return; // cancelled
    try {
      const res = await rejectBusiness(businessId, reason);
      if (res.success) {
        toast.success(res.message || "Business rejected");
        patchBusinessDetails(businessId, { businessApprovalStatus: "rejected", businessRejectionReason: reason });
      }
    } catch (err) {
      toast.error(err.message || "Failed to reject business");
    }
  };

  const handleDownloadDocument = async (businessId, businessName) => {
    try {
      await downloadBusinessDocument(businessId, `${businessName || "business"}-document`);
    } catch (err) {
      toast.error(err.message || "Failed to download document");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div className="section-title-group">
          <h2 className="section-title">Business Management</h2>
          <span className="admin-total-badge">
            {loading ? "—" : `${totalBusinesses.toLocaleString()} businesses`}
          </span>
        </div>
        <div className="search-controls-group">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by business name, email, phone..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button 
            className={`add-btn filter-trigger-btn ${isFilterExpanded || cityFilter || categoryFilter ? "active" : ""}`}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {isFilterExpanded && (
        <div className="admin-filters-panel">
          <div className="filters-grid">
            <div className="filter-field">
              <label>City</label>
              <select
                value={cityFilter}
                onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name.charAt(0).toUpperCase() + city.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="filters-actions">
            {(cityFilter || categoryFilter || searchTerm) && (
              <button 
                className="add-btn reset-filters-btn"
                onClick={() => {
                  setCityFilter("");
                  setCategoryFilter("");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <X size={16} />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Business Name</th>
              <th>Category</th>
              <th>City</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="empty-state" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : businesses.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  No businesses found
                </td>
              </tr>
            ) : (
              businesses.map((biz) => {
                const isActive = biz.isActive !== false;
                const approvalStatus = biz.userDetails?.businessApprovalStatus || "pending";
                const isVerified = approvalStatus === "approved";
                return (
                  <tr key={biz._id}>
                    <td>
                      <img
                        src={biz.userDetails?.businessLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=100&auto=format&fit=crop"}
                        alt={biz.userDetails?.businessName || "Business"}
                        style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "contain", border: "1px solid #eee", backgroundColor: "#fff" }}
                      />
                    </td>
                    <td>
                      {editingNameId === biz._id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <input
                            type="text"
                            value={editingNameValue}
                            onChange={(e) => setEditingNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveBusinessName(biz._id);
                              if (e.key === "Escape") cancelEditingName();
                            }}
                            autoFocus
                            disabled={savingName}
                            style={{ padding: "4px 8px", border: "1px solid #EA650A", borderRadius: "6px", fontSize: "13px", width: "140px" }}
                          />
                          <button
                            onClick={() => saveBusinessName(biz._id)}
                            disabled={savingName}
                            title="Save"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#10B981", padding: 0, display: "flex" }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditingName}
                            disabled={savingName}
                            title="Cancel"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 0, display: "flex" }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 600, color: "#09122E", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {biz.userDetails?.businessName || biz.userDetails?.fullName || "N/A"}
                          {isVerified && (
                            <CheckCircle2 size={16} color="#10B981" title="Verified" />
                          )}
                          <button
                            onClick={() => startEditingName(biz._id, biz.userDetails?.businessName)}
                            title="Edit business name"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex" }}
                          >
                            <Pencil size={14} />
                          </button>
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="table-cell-badge badge-religion" style={{ backgroundColor: "#F3E8FF", color: "#6B21A8" }}>
                        {biz.userDetails?.businessCategoryName || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="table-cell-badge badge-city">
                        {biz.userDetails?.city || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="table-cell-with-icon">
                        <Mail size={16} />
                        {biz.userDetails?.email || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-with-icon">
                        <Phone size={16} />
                        {biz.phoneNumber || "N/A"}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="table-cell-badge" 
                        style={{ 
                          backgroundColor: isActive ? "#E6F4EA" : "#FCE8E6", 
                          color: isActive ? "#137333" : "#C5221F",
                          fontWeight: "600"
                        }}
                      >
                        {isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                        <span
                          className="table-cell-badge"
                          style={{
                            backgroundColor: isVerified ? "#E6F4EA" : approvalStatus === "rejected" ? "#FCE8E6" : "#FFF3CD",
                            color: isVerified ? "#137333" : approvalStatus === "rejected" ? "#C5221F" : "#856404",
                            fontWeight: "600",
                          }}
                          title={approvalStatus === "rejected" && biz.userDetails?.businessRejectionReason ? biz.userDetails.businessRejectionReason : undefined}
                        >
                          {isVerified ? "Verified" : approvalStatus === "rejected" ? "Rejected" : "Pending"}
                        </span>

                        {biz.userDetails?.businessDocument ? (
                          <button
                            onClick={() => handleDownloadDocument(biz._id, biz.userDetails?.businessName)}
                            style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "12px", fontWeight: "600", padding: 0 }}
                          >
                            <FileText size={14} /> Document
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#9ca3af" }}>No document</span>
                        )}

                        {!isVerified && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => handleApproveBusiness(biz._id, biz.userDetails?.businessName)}
                              style={{ padding: "4px 10px", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                            >
                              Approve
                            </button>
                            {approvalStatus !== "rejected" && (
                              <button
                                onClick={() => handleRejectBusiness(biz._id)}
                                style={{ padding: "4px 10px", backgroundColor: "#EF4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleToggleStatus(biz._id, isActive)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: isActive ? "#EA650A" : "#10B981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            transition: "background-color 0.2s"
                          }}
                        >
                          {isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDeleteBusiness(biz._id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#EF4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            transition: "background-color 0.2s"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing {businesses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalBusinesses)} of {totalBusinesses} businesses
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
    </div>
  );
};

export default BusinessManagement;
