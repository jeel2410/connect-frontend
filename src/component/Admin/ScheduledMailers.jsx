import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  Calendar
} from "lucide-react";
import {
  getScheduledMailerStats,
  getScheduledMailerLogs
} from "../../utils/adminApi";

const ScheduledMailers = () => {
  const [stats, setStats] = useState({
    INCOMPLETE_PROFILE: { pending: 0, sent: 0, failed: 0 },
    CITY_INDUSTRY_SNAPSHOT: { pending: 0, sent: 0, failed: 0 },
    OFFER_OF_THE_DAY: { pending: 0, sent: 0, failed: 0 }
  });
  const [logs, setLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState(null);

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const limit = 10;

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await getScheduledMailerStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      setError(null);
      const response = await getScheduledMailerLogs(currentPage, limit, search, typeFilter);
      if (response.success && response.data) {
        setLogs(response.data.logs || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch scheduled mailer logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, typeFilter]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchLogs();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const formatType = (type) => {
    switch (type) {
      case "INCOMPLETE_PROFILE":
        return "Incomplete Profile";
      case "CITY_INDUSTRY_SNAPSHOT":
        return "Network Snapshot";
      case "OFFER_OF_THE_DAY":
        return "Offer of the Day";
      default:
        return type;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "INCOMPLETE_PROFILE":
        return "badge-incomplete";
      case "CITY_INDUSTRY_SNAPSHOT":
        return "badge-snapshot";
      case "OFFER_OF_THE_DAY":
        return "badge-offer";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <CheckCircle size={16} style={{ color: "#10b981", marginRight: "4px" }} />;
      case "failed":
        return <AlertCircle size={16} style={{ color: "#ef4444", marginRight: "4px" }} />;
      default:
        return <Clock size={16} style={{ color: "#f59e0b", marginRight: "4px" }} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "sent":
        return "badge-status-sent";
      case "failed":
        return "badge-status-failed";
      default:
        return "badge-status-pending";
    }
  };

  const totalPages = pagination.totalPages;

  return (
    <div className="admin-section">
      {/* Metrics Cards */}
      <div className="mailer-stats-grid">
        {/* Card 1 */}
        <div className="mailer-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper incomplete-icon">
              <Mail size={22} />
            </div>
            <div>
              <h3>Incomplete Profile Mailers</h3>
              <p>Weekly batch split into 7 days</p>
            </div>
          </div>
          <div className="stat-card-details">
            <div className="stat-detail-item">
              <span className="label">Pending</span>
              <span className="value pending-color">
                {loadingStats ? "..." : stats.INCOMPLETE_PROFILE.pending}
              </span>
            </div>
            <div className="stat-detail-item">
              <span className="label">Sent</span>
              <span className="value sent-color">
                {loadingStats ? "..." : stats.INCOMPLETE_PROFILE.sent}
              </span>
            </div>
            <div className="stat-detail-item">
              <span className="label">Failed</span>
              <span className="value failed-color">
                {loadingStats ? "..." : stats.INCOMPLETE_PROFILE.failed}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="mailer-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper snapshot-icon">
              <Calendar size={22} />
            </div>
            <div>
              <h3>Network Snapshot Mailers</h3>
              <p>Weekly batch split into 7 days</p>
            </div>
          </div>
          <div className="stat-card-details">
            <div className="stat-detail-item">
              <span className="label">Pending</span>
              <span className="value pending-color">
                {loadingStats ? "..." : stats.CITY_INDUSTRY_SNAPSHOT.pending}
              </span>
            </div>
            <div className="stat-detail-item">
              <span className="label">Sent</span>
              <span className="value sent-color">
                {loadingStats ? "..." : stats.CITY_INDUSTRY_SNAPSHOT.sent}
              </span>
            </div>
            <div className="stat-detail-item">
              <span className="label">Failed</span>
              <span className="value failed-color">
                {loadingStats ? "..." : stats.CITY_INDUSTRY_SNAPSHOT.failed}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="mailer-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper offer-icon">
              <Send size={22} />
            </div>
            <div>
              <h3>Offer of the Day Mailers</h3>
              <p>Daily batch distributed hourly</p>
            </div>
          </div>
          <div className="stat-card-details">
            <div className="stat-detail-item">
              <span className="label">Pending</span>
              <span className="value pending-color">
                {loadingStats ? "..." : stats.OFFER_OF_THE_DAY.pending}
              </span>
            </div>
            <div className="stat-detail-item">
              <span className="label">Sent</span>
              <span className="value sent-color">
                {loadingStats ? "..." : stats.OFFER_OF_THE_DAY.sent}
              </span>
            </div>
            <div className="stat-detail-item">
              <span className="label">Failed</span>
              <span className="value failed-color">
                {loadingStats ? "..." : stats.OFFER_OF_THE_DAY.failed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="admin-section-header mailer-logs-header">
        <h2 className="section-title">Mail Queue Logs</h2>
        <div className="admin-actions mailer-filter-actions">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search recipient or subject..."
              className="search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="INCOMPLETE_PROFILE">Incomplete Profile</option>
            <option value="CITY_INDUSTRY_SNAPSHOT">Network Snapshot</option>
            <option value="OFFER_OF_THE_DAY">Offer of the Day</option>
          </select>
          <button 
            className="refresh-logs-btn"
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            title="Refresh Logs & Stats"
          >
            <RefreshCw size={20} className={loadingLogs || loadingStats ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Scheduled For</th>
              <th>Status</th>
              <th>Retries</th>
              <th>Error details</th>
            </tr>
          </thead>
          <tbody>
            {loadingLogs ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Loading mail logs...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="empty-state failed-color">
                  {error}
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No queued mailers found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#081332" }}>
                      {log.recipientName || "N/A"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{log.recipient}</div>
                  </td>
                  <td>
                    <span className={`mailer-type-badge ${getTypeBadgeClass(log.type)}`}>
                      {formatType(log.type)}
                    </span>
                  </td>
                  <td className="log-subject-cell" title={log.subject}>
                    {log.subject}
                  </td>
                  <td>
                    {log.scheduledFor
                      ? new Date(log.scheduledFor).toLocaleString()
                      : "Immediate"}
                  </td>
                  <td>
                    <div className="status-flex-center">
                      <span className={`status-badge-wrapper ${getStatusBadgeClass(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td>{log.attempts || 0} / 3</td>
                  <td className="error-details-cell" title={log.errorMessage || ""}>
                    {log.errorMessage ? (
                      <span className="failed-color-text text-truncate-custom">
                        {log.errorMessage}
                      </span>
                    ) : log.status === "sent" ? (
                      <span className="sent-color-text">Successful</span>
                    ) : (
                      <span className="pending-color-text">Waiting</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {logs.length > 0 ? (currentPage - 1) * limit + 1 : 0} to{" "}
          {Math.min(currentPage * limit, pagination.totalItems)} of {pagination.totalItems} records
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || loadingLogs}
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
                    className={`pagination-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                    disabled={loadingLogs}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0 || loadingLogs}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledMailers;
