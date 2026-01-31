import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, ChevronLeft, ChevronRight, Download, FileText, Calendar, Eye, X } from "lucide-react";
import { getInquiries, exportInquiriesToCSV } from "../../utils/adminApi";

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [exporting, setExporting] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Fetch inquiries from API
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getInquiries(currentPage, itemsPerPage, searchTerm, "");
        
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
  }, [currentPage, searchTerm]);

  const totalPages = pagination.totalPages;
  const totalInquiries = pagination.totalCount;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
      await exportInquiriesToCSV(searchTerm, "");
    } catch (err) {
      setError(err.message || "Failed to export CSV file");
      console.error("Error exporting CSV:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedInquiry(null);
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
              <th>Date</th>
              <th>Action</th>
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
                    <div className="date-cell">
                      <Calendar size={14} />
                      {formatDate(inquiry.createdAt)}
                    </div>
                  </td>
                  <td>
                    <button
                      className="admin-button primary-button"
                      onClick={() => handleViewInquiry(inquiry)}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      <Eye size={14} style={{ marginRight: "4px" }} />
                      View
                    </button>
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

      {/* View Inquiry Modal */}
      {isViewModalOpen && selectedInquiry && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>Inquiry Details</h3>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#777E90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>Name</label>
                  <div style={{ fontSize: "16px", color: "#09122E", fontWeight: "500" }}>{selectedInquiry.name || "N/A"}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#777E90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>Email</label>
                  <div style={{ fontSize: "16px", color: "#09122E", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail size={16} color="#777E90" />
                    {selectedInquiry.email || "N/A"}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#777E90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>Phone</label>
                  <div style={{ fontSize: "16px", color: "#09122E", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={16} color="#777E90" />
                    {selectedInquiry.phone || "N/A"}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#777E90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>Subject</label>
                  <div style={{ fontSize: "16px", color: "#09122E", fontWeight: "500" }}>{selectedInquiry.subject || "N/A"}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#777E90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>Message</label>
                  <div style={{ fontSize: "16px", color: "#09122E", lineHeight: "1.6", padding: "16px", backgroundColor: "#F4F5F6", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
                    {selectedInquiry.message || "N/A"}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#777E90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>Submitted Date</label>
                  <div style={{ fontSize: "16px", color: "#09122E", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={16} color="#777E90" />
                    {formatDate(selectedInquiry.createdAt)}
                  </div>
                </div>
                {selectedInquiry.userId && (
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#777E90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>User ID</label>
                    <div style={{ fontSize: "16px", color: "#09122E" }}>
                      {selectedInquiry.userId.phoneNumber || selectedInquiry.userId._id || "N/A"}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions" style={{ padding: "0 24px 24px" }}>
              <button
                className="btn-secondary"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement;
