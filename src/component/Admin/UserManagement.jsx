import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { getUsers, toggleUserStatus, deleteUser } from "../../utils/adminApi";
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
          religionFilter
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
    </div>
  );
};

export default UserManagement;
