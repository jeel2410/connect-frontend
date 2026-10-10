import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, ChevronLeft, ChevronRight, SlidersHorizontal, X, Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { getUsers, toggleUserStatus, deleteUser, unverifyBouncedEmails } from "../../utils/adminApi";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [religionFilter, setReligionFilter] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const itemsPerPage = 10;

  // Filter option lists
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [interests, setInterests] = useState([]);
  const religions = ["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism"];

  // Bounced / Unsubscribed CSV upload state
  const [showBounceModal, setShowBounceModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedEmails, setParsedEmails] = useState([]);
  const [submittingBounce, setSubmittingBounce] = useState(false);
  const [bounceFeedback, setBounceFeedback] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setBounceFeedback(null);
    try {
      const rawText = await file.text();
      // Remove null bytes and non-printable binary bytes
      const cleanText = rawText.replace(/\0/g, '');

      // Match valid email addresses strictly using regex
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
      const matches = cleanText.match(emailRegex) || [];

      const extracted = matches
        .map(email => email.trim().toLowerCase())
        .filter(email => email && !email.startsWith('email@') && email !== 'email');

      const uniqueEmails = Array.from(new Set(extracted));
      setParsedEmails(uniqueEmails);

      if (uniqueEmails.length === 0) {
        setBounceFeedback({ 
          type: "error", 
          message: "No valid email addresses found in the selected file. If using ODS/XLSX, please save or export as CSV." 
        });
      }
    } catch (err) {
      console.error("Error reading file:", err);
      setBounceFeedback({ type: "error", message: "Failed to read file. Please select a valid file." });
    }
  };

  const handleUnverifySubmit = async (e) => {
    e.preventDefault();
    if (parsedEmails.length === 0) {
      setBounceFeedback({ type: "error", message: "No valid email addresses found in the selected CSV file." });
      return;
    }

    try {
      setSubmittingBounce(true);
      setBounceFeedback(null);
      const res = await unverifyBouncedEmails(parsedEmails);
      if (res.success) {
        toast.success(res.message || `Marked ${res.data?.updatedCount || 0} user(s) as unverified`);
        setBounceFeedback({
          type: "success",
          message: res.message || `Successfully marked ${res.data?.updatedCount || 0} user email(s) as unverified!`
        });
        setSelectedFile(null);
        setParsedEmails([]);
      } else {
        setBounceFeedback({ type: "error", message: res.message || "Failed to unverify emails." });
      }
    } catch (err) {
      setBounceFeedback({ type: "error", message: err.message || "Failed to process bounced emails." });
    } finally {
      setSubmittingBounce(false);
    }
  };

  // Fetch filter options (cities, industries, interests)
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

      // Fetch industries
      try {
        const res = await fetch(`${API_BASE_URL}/api/list/industries`, { headers });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.industries) {
            setIndustries(result.data.industries);
          }
        }
      } catch (err) {
        console.error("Error fetching industries for filters:", err);
      }

      // Fetch interests
      try {
        const res = await fetch(`${API_BASE_URL}/api/list/interest`, { headers });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.interests) {
            setInterests(result.data.interests);
          }
        }
      } catch (err) {
        console.error("Error fetching interests for filters:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUsers(
          currentPage,
          itemsPerPage,
          searchTerm,
          cityFilter,
          industryFilter,
          interestFilter,
          religionFilter,
          "false"
        );
        
        if (response.success && response.data) {
          setUsers(response.data.users || []);
          setPagination(response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          });
        }
      } catch (err) {
        setError(err.message || "Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, (searchTerm || cityFilter || industryFilter || interestFilter || religionFilter) ? 500 : 0);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, cityFilter, industryFilter, interestFilter, religionFilter]);

  const totalPages = pagination.totalPages;
  const totalUsers = pagination.totalItems;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? "disable" : "enable"} this user?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await toggleUserStatus(userId);
      if (res.success) {
        toast.success(res.message || "User status updated successfully");
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account? This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success(res.message || "User deleted successfully");
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div className="section-title-group">
          <h2 className="section-title">User Management</h2>
          <span className="admin-total-badge">
            {loading ? "—" : `${totalUsers.toLocaleString()} users`}
          </span>
        </div>
        <div className="search-controls-group">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button 
            className={`add-btn filter-trigger-btn ${isFilterExpanded || cityFilter || industryFilter || interestFilter || religionFilter ? "active" : ""}`}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <SlidersHorizontal size={16} />
            <span>Advanced Filters</span>
          </button>

          <button 
            className="add-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#DC2626",
              color: "#ffffff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer"
            }}
            onClick={() => {
              setShowBounceModal(true);
              setSelectedFile(null);
              setParsedEmails([]);
              setBounceFeedback(null);
            }}
          >
            <Upload size={16} />
            <span>Upload Bounced CSV</span>
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
              <label>Industry</label>
              <select
                value={industryFilter}
                onChange={(e) => { setIndustryFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Select Industry</option>
                {industries.map((ind) => (
                  <option key={ind._id} value={ind._id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label>Interest</label>
              <select
                value={interestFilter}
                onChange={(e) => { setInterestFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Select Interest</option>
                {interests.map((int) => (
                  <option key={int._id} value={int.name}>
                    {int.name.charAt(0).toUpperCase() + int.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label>Religion</label>
              <select
                value={religionFilter}
                onChange={(e) => { setReligionFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Select Religion</option>
                {religions.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="filters-actions">
            {(cityFilter || industryFilter || interestFilter || religionFilter || searchTerm) && (
              <button 
                className="add-btn reset-filters-btn"
                onClick={() => {
                  setCityFilter("");
                  setIndustryFilter("");
                  setInterestFilter("");
                  setReligionFilter("");
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
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>City</th>
              <th>Industry</th>
              <th>Religion</th>
              <th>Traffic Source</th>
              <th>Status</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isActive = user.isActive !== false;
                const isAdminUser = user.role === "admin";
                return (
                  <tr key={user._id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#09122E" }}>
                        {user.userDetails?.fullName || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="table-cell-with-icon">
                        <Mail size={16} />
                        {user.userDetails?.email || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-with-icon">
                        <Phone size={16} />
                        {user.phoneNumber || "N/A"}
                      </div>
                    </td>
                    <td>
                      <span className="table-cell-badge badge-city">
                        {user.userDetails?.city || "N/A"}
                      </span>
                    </td>
                    <td>{user.userDetails?.industry || "N/A"}</td>
                    <td>
                      <span className="table-cell-badge badge-religion">
                        {user.userDetails?.religion || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="table-cell-badge badge-source" style={{ backgroundColor: "#E2F0FD", color: "#0B63E5", textTransform: "capitalize" }}>
                        {user.trafficSource || "direct"}
                      </span>
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
                      {!isAdminUser ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleToggleStatus(user._id, isActive)}
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
                            onClick={() => handleDeleteUser(user._id)}
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
                      ) : (
                        <span style={{ fontSize: "12px", color: "#718096", fontStyle: "italic" }}>
                          Admin Profile
                        </span>
                      )}
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
          Showing {users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
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

      {/* Modal for Uploading Bounced / Unsubscribed CSV */}
      {showBounceModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(9, 18, 46, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            maxWidth: "520px",
            width: "100%",
            padding: "28px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={20} style={{ color: "#DC2626" }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#09122E" }}>Upload Bounced / Unsubscribed CSV</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>Mark bounced email addresses as unverified to protect domain reputation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBounceModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} color="#64748B" />
              </button>
            </div>

            {bounceFeedback && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: bounceFeedback.type === "success" ? "#F0FDF4" : "#FEF2F2",
                border: bounceFeedback.type === "success" ? "1px solid #BBF7D0" : "1px solid #FECACA",
                borderRadius: 8,
                color: bounceFeedback.type === "success" ? "#166534" : "#DC2626",
                marginBottom: 16,
                fontSize: 13
              }}>
                {bounceFeedback.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {bounceFeedback.message}
              </div>
            )}

            <form onSubmit={handleUnverifySubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#353945", marginBottom: "8px", display: "block" }}>
                  Select CSV File (1 column with email IDs) <span style={{ color: "#EC7523" }}>*</span>
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  disabled={submittingBounce}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px dashed #CBD5E1",
                    borderRadius: "8px",
                    background: "#F8FAFC",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                />
              </div>

              {selectedFile && (
                <div style={{
                  background: "#F1F5F9",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} color="#475569" />
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1E293B" }}>{selectedFile.name}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#64748B" }}>
                        {parsedEmails.length} unique email address{parsedEmails.length !== 1 ? "es" : ""} loaded
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowBounceModal(false)}
                  disabled={submittingBounce}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #DDE2EE",
                    background: "#fff",
                    color: "#4B5563",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBounce || parsedEmails.length === 0}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: parsedEmails.length === 0 ? "#94A3B8" : "#DC2626",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: (submittingBounce || parsedEmails.length === 0) ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: submittingBounce ? 0.7 : 1
                  }}
                >
                  <Upload size={14} />
                  {submittingBounce ? "Processing..." : `Unverify ${parsedEmails.length} Email(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
