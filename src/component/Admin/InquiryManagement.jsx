import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, ChevronLeft, ChevronRight, Download, FileText, Calendar } from "lucide-react";
import { getInquiries, exportInquiriesToCSV } from "../../utils/adminApi";

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;

  // Fetch inquiries from API
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getInquiries(currentPage, itemsPerPage, searchTerm, statusFilter);
        
        if (response.success && response.data) {
          setInquiries(response.data.inquiries || []);
          setPagination(response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
          });
        }
      } catch (err) {
        setError(err.message || "Failed to fetch inquiries");
        console.error("Error fetching inquiries:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchInquiries();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, statusFilter]);

  const totalPages = pagination.totalPages;
  const totalInquiries = pagination.totalCount;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      setError(null);
      await exportInquiriesToCSV(searchTerm, statusFilter);
    } catch (err) {
      setError(err.message || "Failed to export CSV file");
      console.error("Error exporting CSV:", err);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'in_progress':
        return 'status-badge status-in-progress';
      case 'resolved':
        return 'status-badge status-resolved';
      case 'closed':
        return 'status-badge status-closed';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="section-title">Inquiry Management</h2>
        <div className="admin-actions">
          <button 
            className="import-button"
            onClick={handleExportCSV}
            disabled={exporting || loading}
          >
            <Download size={18} />
            <span>{exporting ? "Exporting..." : "Export CSV"}</span>
          </button>
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>


      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="empty-state" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No inquiries found
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry._id}>
                  <td>{inquiry.name || "N/A"}</td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      {inquiry.email || "N/A"}
                    </div>
                  </td>
                  <td>
                    {inquiry.phone ? (
                      <div className="phone-cell">
                        <Phone size={14} />
                        {inquiry.phone}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{inquiry.subject || "N/A"}</td>
                  <td className="message-cell">
                    {inquiry.message ? (
                      inquiry.message.length > 50
                        ? `${inquiry.message.substring(0, 50)}...`
                        : inquiry.message
                    ) : "N/A"}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(inquiry.status)}>
                      {inquiry.status || "pending"}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {formatDate(inquiry.createdAt)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalInquiries} total inquiries)
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement;
