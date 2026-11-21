import React, { useState, useEffect } from "react";
import { BarChart3, Users, RefreshCw, Smile, TrendingUp, Loader2 } from "lucide-react";
import { getTrafficSources, getTrafficSourceTrend } from "../../utils/adminApi";

const TrafficSourceStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await getTrafficSources();
      if (response.success && response.data) {
        const rawData = response.data;
        if (Array.isArray(rawData)) {
          setStats(rawData);
        } else if (rawData && Array.isArray(rawData.stats)) {
          setStats(rawData.stats);
        } else {
          setStats([]);
        }
      } else {
        setError(response.message || "Failed to load traffic source statistics");
      }
    } catch (err) {
      setError(err.message || "Something went wrong while loading stats");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalUsers = stats.reduce((sum, item) => sum + item.count, 0);
  const totalComplete = stats.reduce((sum, item) => sum + (item.completeCount || 0), 0);

  if (loading) {
    return (
      <div className="dashboard-loading-grid">
        <div className="dashboard-skeleton-card" style={{ height: "150px" }}></div>
        <div className="dashboard-skeleton-card" style={{ height: "300px" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section dashboard-error-container">
        <div className="alert alert-error">
          <h3>Failed to Load Traffic Sources</h3>
          <p>{error}</p>
          <button className="add-btn error-retry-btn" onClick={() => fetchStats()}>
            <RefreshCw size={16} />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div className="section-title-group">
          <h2 className="section-title">Traffic Sources Metrics</h2>
          <span className="admin-total-badge">
            {stats.length} unique sources
          </span>
        </div>
        <button className="add-btn" onClick={() => fetchStats(true)} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="dashboard-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="dashboard-stat-card card-theme-blue">
          <div className="card-top">
            <div className="card-icon-container" style={{ background: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)", color: "#0284C7" }}>
              <Users size={24} />
            </div>
          </div>
          <div className="card-middle">
            <span className="card-value">{totalUsers.toLocaleString()}</span>
            <h3 className="card-title">Total Tracked Users</h3>
          </div>
          <div className="card-bottom">
            <p className="card-desc">All registrations with a recorded traffic source</p>
          </div>
        </div>

        <div className="dashboard-stat-card card-theme-emerald">
          <div className="card-top">
            <div className="card-icon-container" style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)", color: "#059669" }}>
              <Smile size={24} />
            </div>
          </div>
          <div className="card-middle">
            <span className="card-value">{totalComplete.toLocaleString()}</span>
            <h3 className="card-title">Completed Profiles</h3>
          </div>
          <div className="card-bottom">
            <p className="card-desc">Users who completed the full registration flow</p>
          </div>
        </div>

        <div className="dashboard-stat-card card-theme-pink">
          <div className="card-top">
            <div className="card-icon-container" style={{ background: "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)", color: "#BE185D" }}>
              <BarChart3 size={24} />
            </div>
          </div>
          <div className="card-middle">
            <span className="card-value">{stats.length}</span>
            <h3 className="card-title">Acquisition Channels</h3>
          </div>
          <div className="card-bottom">
            <p className="card-desc">Different marketing campaign/referral channels used</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Traffic Parameter</th>
              <th style={{ textAlign: "right" }}>OTP Done</th>
              <th style={{ textAlign: "right" }}>EMAIL Verified</th>
              <th style={{ textAlign: "right" }}>BASIC PROFILE</th>
              <th style={{ textAlign: "right" }}>FULL PROFILE</th>
              <th style={{ textAlign: "right" }}>Percentage of Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No traffic sources found.
                </td>
              </tr>
            ) : (
              stats.map((item, index) => {
                const percentage = totalUsers > 0 ? ((item.count / totalUsers) * 100).toFixed(1) : 0;
                const otpDone = item.otpDone ?? item.count ?? 0;
                const emailVerified = item.emailVerified ?? item.verifiedCount ?? 0;
                const basicProfile = item.basicProfile ?? 0;
                const fullProfile = item.fullProfile ?? item.completeCount ?? 0;

                return (
                  <tr key={index}>
                    <td>
                      <button 
                        onClick={() => setSelectedSource(item.trafficSource)}
                        className="drilldown-link"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "#0B63E5",
                          textAlign: "left",
                          textTransform: "capitalize",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <TrendingUp size={14} />
                        <span>{item.trafficSource}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="table-cell-badge badge-city" style={{ fontWeight: 600 }}>
                        {otpDone.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 600, color: "#2563EB" }}>
                        {emailVerified.toLocaleString()}
                        {otpDone > 0 && (
                          <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "4px", fontWeight: "500" }}>
                            ({((emailVerified / otpDone) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 600, color: "#D97706" }}>
                        {basicProfile.toLocaleString()}
                        {otpDone > 0 && (
                          <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "4px", fontWeight: "500" }}>
                            ({((basicProfile / otpDone) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="table-cell-badge" style={{ fontWeight: 700, backgroundColor: "#D1FAE5", color: "#065F46" }}>
                        {fullProfile.toLocaleString()}
                        {otpDone > 0 && (
                          <span style={{ fontSize: "12px", marginLeft: "4px", fontWeight: "600" }}>
                            ({((fullProfile / otpDone) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
                        <div style={{ flex: 1, height: "8px", background: "#EDF2F7", borderRadius: "4px", overflow: "hidden", minWidth: "80px", maxWidth: "120px" }}>
                          <div style={{ width: `${percentage}%`, height: "100%", background: "#0B63E5", borderRadius: "4px" }}></div>
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#4A5568" }}>{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedSource && (
        <TrafficSourceTrendModal 
          source={selectedSource} 
          onClose={() => setSelectedSource(null)} 
        />
      )}
    </div>
  );
};

const TrafficSourceTrendModal = ({ source, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTrafficSourceTrend(source);
        if (response.success && response.data) {
          setData(response.data.trend || []);
        } else {
          setError(response.message || "Failed to load trend data");
        }
      } catch (err) {
        setError(err.message || "Something went wrong while fetching trend");
      } finally {
        setLoading(false);
      }
    };

    if (source) {
      fetchTrend();
    }
  }, [source]);

  // Math insights
  const totalOtpDone = data.reduce((sum, d) => sum + (d.otpDone ?? d.totalCount ?? 0), 0);
  const totalEmailVerified = data.reduce((sum, d) => sum + (d.emailVerified ?? 0), 0);
  const totalBasicProfile = data.reduce((sum, d) => sum + (d.basicProfile ?? 0), 0);
  const totalFullProfile = data.reduce((sum, d) => sum + (d.fullProfile ?? d.completeCount ?? 0), 0);

  const emailVerifiedPct = totalOtpDone > 0 ? ((totalEmailVerified / totalOtpDone) * 100).toFixed(1) : "0.0";
  const basicProfilePct = totalOtpDone > 0 ? ((totalBasicProfile / totalOtpDone) * 100).toFixed(1) : "0.0";
  const fullProfilePct = totalOtpDone > 0 ? ((totalFullProfile / totalOtpDone) * 100).toFixed(1) : "0.0";

  return (
    <div className="trend-modal-overlay" onClick={onClose}>
      <div className="trend-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="trend-modal-header" style={{ borderLeft: `6px solid #0B63E5` }}>
          <div className="trend-header-left">
            <div className="trend-header-icon" style={{ background: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)", color: "#0B63E5" }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ textTransform: "capitalize" }}>"{source}" Traffic Source Trend</h3>
              <p className="trend-header-subtitle">Last 7 days registration & profile completion</p>
            </div>
          </div>
          <button className="trend-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="trend-modal-body">
          {loading ? (
            <div className="trend-modal-loading">
              <Loader2 className="spinner animate-spin" size={32} />
              <p style={{ marginTop: "10px", color: "#718096" }}>Fetching trend metrics...</p>
            </div>
          ) : error ? (
            <div className="trend-modal-error">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="trend-summary-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                <div className="trend-summary-card" style={{ padding: "15px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span className="summary-label" style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, marginBottom: "5px" }}>7-Day OTP Done</span>
                  <span className="summary-val" style={{ fontSize: "20px", color: "#0B63E5", fontWeight: "700" }}>{totalOtpDone.toLocaleString()}</span>
                </div>
                <div className="trend-summary-card" style={{ padding: "15px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span className="summary-label" style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, marginBottom: "5px" }}>7-Day EMAIL Verified</span>
                  <span className="summary-val" style={{ fontSize: "20px", color: "#2563EB", fontWeight: "700" }}>
                    {totalEmailVerified.toLocaleString()}{" "}
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748B" }}>
                      ({emailVerifiedPct}%)
                    </span>
                  </span>
                </div>
                <div className="trend-summary-card" style={{ padding: "15px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span className="summary-label" style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, marginBottom: "5px" }}>7-Day BASIC PROFILE</span>
                  <span className="summary-val" style={{ fontSize: "20px", color: "#D97706", fontWeight: "700" }}>
                    {totalBasicProfile.toLocaleString()}{" "}
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748B" }}>
                      ({basicProfilePct}%)
                    </span>
                  </span>
                </div>
                <div className="trend-summary-card" style={{ padding: "15px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span className="summary-label" style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, marginBottom: "5px" }}>7-Day FULL PROFILE</span>
                  <span className="summary-val" style={{ fontSize: "20px", color: "#059669", fontWeight: "700" }}>
                    {totalFullProfile.toLocaleString()}{" "}
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748B" }}>
                      ({fullProfilePct}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* Table list */}
              <div className="trend-table-container">
                <table className="trend-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>OTP Done</th>
                      <th style={{ textAlign: "right" }}>EMAIL Verified</th>
                      <th style={{ textAlign: "right" }}>BASIC PROFILE</th>
                      <th style={{ textAlign: "right" }}>FULL PROFILE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "15px", color: "#718096" }}>
                          No registration data in the last 7 days.
                        </td>
                      </tr>
                    ) : (
                      data.slice().reverse().map((row, i) => {
                        const otpDone = row.otpDone ?? row.totalCount ?? 0;
                        const emailVerified = row.emailVerified ?? 0;
                        const basicProfile = row.basicProfile ?? 0;
                        const fullProfile = row.fullProfile ?? row.completeCount ?? 0;

                        return (
                          <tr key={i}>
                            <td className="trend-td-date">{row.date}</td>
                            <td className="trend-td-count" style={{ color: "#0B63E5", fontWeight: "600", textAlign: "right" }}>
                              {otpDone.toLocaleString()}
                            </td>
                            <td className="trend-td-count" style={{ color: "#2563EB", fontWeight: "600", textAlign: "right" }}>
                              {emailVerified.toLocaleString()}
                              {otpDone > 0 && (
                                <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "4px", fontWeight: "500" }}>
                                  ({(((emailVerified) / otpDone) * 100).toFixed(1)}%)
                                </span>
                              )}
                            </td>
                            <td className="trend-td-count" style={{ color: "#D97706", fontWeight: "600", textAlign: "right" }}>
                              {basicProfile.toLocaleString()}
                              {otpDone > 0 && (
                                <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "4px", fontWeight: "500" }}>
                                  ({(((basicProfile) / otpDone) * 100).toFixed(1)}%)
                                </span>
                              )}
                            </td>
                            <td className="trend-td-count" style={{ color: "#059669", fontWeight: "700", textAlign: "right" }}>
                              {fullProfile.toLocaleString()}
                              {otpDone > 0 && (
                                <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "4px", fontWeight: "500" }}>
                                  ({(((fullProfile) / otpDone) * 100).toFixed(1)}%)
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficSourceStats;
