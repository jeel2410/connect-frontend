import React, { useState, useEffect } from "react";
import { BarChart3, Users, RefreshCw } from "lucide-react";
import { getTrafficSources } from "../../utils/adminApi";

const TrafficSourceStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
        setStats(response.data || []);
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
              <th>Registered Users Count</th>
              <th>Percentage of Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-state">
                  No traffic sources found.
                </td>
              </tr>
            ) : (
              stats.map((item, index) => {
                const percentage = totalUsers > 0 ? ((item.count / totalUsers) * 100).toFixed(1) : 0;
                return (
                  <tr key={index}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#09122E", textTransform: "capitalize" }}>
                        {item.trafficSource}
                      </span>
                    </td>
                    <td>
                      <span className="table-cell-badge badge-city" style={{ fontWeight: 600 }}>
                        {item.count.toLocaleString()} users
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <div style={{ flex: 1, height: "8px", background: "#EDF2F7", borderRadius: "4px", overflow: "hidden", minWidth: "150px" }}>
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
    </div>
  );
};

export default TrafficSourceStats;
