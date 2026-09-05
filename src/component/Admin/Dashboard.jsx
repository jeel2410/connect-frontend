import React, { useState, useEffect } from "react";
import { Users, ArrowLeftRight, Heart, CreditCard, Share2, MessageSquare, RefreshCw, Loader2, ArrowUpRight, Activity, Smile, TrendingUp, Building2 } from "lucide-react";
import { getDashboardStats, getStatsTrend } from "../../utils/adminApi";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
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
      
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || "Failed to retrieve statistics");
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message || "Something went wrong while loading statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading-grid">
        <div className="dashboard-skeleton-card-welcome"></div>
        <div className="dashboard-stats-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="dashboard-skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section dashboard-error-container">
        <div className="alert alert-error">
          <h3>Failed to Load Dashboard</h3>
          <p>{error}</p>
          <button className="add-btn error-retry-btn" onClick={() => fetchStats()}>
            <RefreshCw size={16} />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Calculate some fun insight metrics from the raw data
  const userLikesRatio = stats ? (stats.totalLikes / (stats.totalUsers || 1)).toFixed(1) : 0;
  const conversationDepth = stats ? (stats.totalChatMessages / (stats.totalUsers || 1)).toFixed(1) : 0;
  const connectionsRatio = stats ? (stats.totalConnectionRequests / (stats.totalUsers || 1)).toFixed(1) : 0;

  const completionPercentage = stats?.totalUsers > 0
    ? (stats.completeProfilePercentage ?? ((stats.totalCompleteProfiles / stats.totalUsers) * 100).toFixed(1))
    : 0;

  const statCards = [
    {
      id: "users",
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "blue",
      description: `${(stats?.totalCompleteProfiles || 0).toLocaleString()} completed (${completionPercentage}%)`,
      accentBg: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
      iconColor: "#0284C7",
      borderColor: "#38BDF8",
    },
    {
      id: "businesses",
      title: "Registered Businesses",
      value: stats?.totalBusinesses || 0,
      icon: Building2,
      color: "orange",
      description: "Total businesses registered",
      accentBg: "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)",
      iconColor: "#EA650A",
      borderColor: "#FDBA74",
    },
    {
      id: "complete-profiles",
      title: "Completed Profiles",
      value: stats?.totalCompleteProfiles || 0,
      percentage: completionPercentage,
      icon: Smile,
      color: "emerald",
      description: `${completionPercentage}% of ${stats?.totalUsers || 0} total profiles completed`,
      accentBg: "linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)",
      iconColor: "#059669",
      borderColor: "#34D399",
    },
    {
      id: "connections",
      title: "Connection Requests",
      value: stats?.totalConnectionRequests || 0,
      icon: ArrowLeftRight,
      color: "purple",
      description: "Total matches and requests sent",
      accentBg: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
      iconColor: "#7E22CE",
      borderColor: "#C084FC",
    },
    {
      id: "likes-shares",
      title: "Likes & Shares",
      value: (stats?.totalLikes || 0) + (stats?.totalReshares || 0),
      icon: Heart,
      color: "pink",
      description: `Likes: ${(stats?.totalLikes || 0).toLocaleString()} | Shares: ${(stats?.totalReshares || 0).toLocaleString()}`,
      accentBg: "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)",
      iconColor: "#BE185D",
      borderColor: "#F472B6",
    },
    {
      id: "offers",
      title: "Total Offers",
      value: stats?.totalOffers || 0,
      icon: CreditCard,
      color: "amber",
      description: "Exclusive card/bank partner offers",
      accentBg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      iconColor: "#B45309",
      borderColor: "#FBBF24",
    },
    {
      id: "offer-clicks",
      title: "Total Offer Clicks",
      value: stats?.totalOfferClicks || 0,
      icon: TrendingUp,
      color: "indigo",
      description: "Total clicks across all active offers",
      accentBg: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
      iconColor: "#4338CA",
      borderColor: "#818CF8",
    },
    {
      id: "shared",
      title: "Shared Items",
      value: stats?.totalSharedItems || 0,
      icon: Share2,
      color: "emerald",
      description: "Feed posts shared by members",
      accentBg: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
      iconColor: "#047857",
      borderColor: "#34D399",
    },
    {
      id: "messages",
      title: "Chat Messages",
      value: stats?.totalChatMessages || 0,
      icon: MessageSquare,
      color: "indigo",
      description: "Conversations exchanged on Connect",
      accentBg: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
      iconColor: "#4338CA",
      borderColor: "#818CF8",
    },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Grid of metrics */}
      <div className="dashboard-stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id} 
              className={`dashboard-stat-card card-theme-${card.color}`}
              onClick={() => setSelectedStat(card)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-top">
                <div 
                  className="card-icon-container" 
                  style={{ background: card.accentBg, color: card.iconColor }}
                >
                  <Icon size={24} />
                </div>
                {card.percentage !== undefined && (
                  <span style={{
                    backgroundColor: "#ECFDF5",
                    color: "#059669",
                    border: "1px solid #A7F3D0",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>
                    {card.percentage}% Complete
                  </span>
                )}
              </div>
              <div className="card-middle">
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span className="card-value">{card.value.toLocaleString()}</span>
                  {card.percentage !== undefined && (
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#059669" }}>
                      ({card.percentage}%)
                    </span>
                  )}
                </div>
                <h3 className="card-title">{card.title}</h3>
              </div>
              <div className="card-bottom">
                <p className="card-desc">{card.description}</p>
                <div className="card-action-indicator">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Modal */}
      {selectedStat && (
        <TrendModal 
          isOpen={selectedStat !== null}
          onClose={() => setSelectedStat(null)}
          statId={selectedStat.id}
          statTitle={selectedStat.title}
          statColor={selectedStat.color}
          statIcon={selectedStat.icon}
        />
      )}
    </div>
  );
};

// TrendModal sub-component definition
const TrendModal = ({ isOpen, onClose, statId, statTitle, statColor, statIcon: Icon }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !statId) return;

    const fetchTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getStatsTrend(statId);
        if (response.success && response.data?.trend) {
          setData(response.data.trend);
        } else {
          setError(response.message || "Failed to load trend data");
        }
      } catch (err) {
        console.error("Error loading trend:", err);
        setError(err.message || "Something went wrong while loading trend data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [isOpen, statId]);

  if (!isOpen) return null;

  // Color mapping matching Dashboard themes
  const colorMap = {
    blue: { main: "#0284C7", border: "#38BDF8", bgGradient: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)", stopColor: "#0284C7" },
    emerald: { main: "#059669", border: "#34D399", bgGradient: "linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)", stopColor: "#059669" },
    purple: { main: "#7E22CE", border: "#C084FC", bgGradient: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)", stopColor: "#7E22CE" },
    pink: { main: "#BE185D", border: "#F472B6", bgGradient: "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)", stopColor: "#BE185D" },
    amber: { main: "#B45309", border: "#FBBF24", bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", stopColor: "#B45309" },
    indigo: { main: "#4338CA", border: "#818CF8", bgGradient: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)", stopColor: "#4338CA" },
    orange: { main: "#EA650A", border: "#FDBA74", bgGradient: "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)", stopColor: "#EA650A" },
  };

  const currentTheme = colorMap[statColor] || colorMap.blue;

  // Math insights
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const avgCount = (totalCount / (data.length || 1)).toFixed(1);
  const maxPoint = data.length > 0 ? [...data].sort((a, b) => b.count - a.count)[0] : null;

  return (
    <div className="trend-modal-overlay" onClick={onClose}>
      <div className="trend-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="trend-modal-header" style={{ borderLeft: `6px solid ${currentTheme.main}` }}>
          <div className="trend-header-left">
            <div className="trend-header-icon" style={{ background: currentTheme.bgGradient, color: currentTheme.main }}>
              <Icon size={20} />
            </div>
            <div>
              <h3>{statTitle} Trend</h3>
              <p className="trend-header-subtitle">Last 7 days performance</p>
            </div>
          </div>
          <button className="trend-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="trend-modal-body">
          {loading ? (
            <div className="trend-modal-loading">
              <Loader2 className="spinner animate-spin" size={32} />
              <p>Fetching latest trends...</p>
            </div>
          ) : error ? (
            <div className="trend-modal-error">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="trend-summary-row">
                {statId === "likes-shares" ? (
                  <>
                    <div className="trend-summary-card">
                      <span className="summary-label">7-Day Likes</span>
                      <span className="summary-val" style={{ color: "#BE185D" }}>
                        {data.reduce((sum, d) => sum + (d.likesCount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="trend-summary-card">
                      <span className="summary-label">7-Day Shares</span>
                      <span className="summary-val" style={{ color: "#047857" }}>
                        {data.reduce((sum, d) => sum + (d.sharesCount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="trend-summary-card">
                      <span className="summary-label">Total Engagement</span>
                      <span className="summary-val" style={{ color: currentTheme.main }}>
                        {totalCount.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="trend-summary-card">
                      <span className="summary-label">7-Day Total</span>
                      <span className="summary-val" style={{ color: currentTheme.main }}>{totalCount.toLocaleString()}</span>
                    </div>
                    <div className="trend-summary-card">
                      <span className="summary-label">Daily Avg</span>
                      <span className="summary-val">{avgCount}</span>
                    </div>
                    <div className="trend-summary-card">
                      <span className="summary-label">Highest Day</span>
                      <span className="summary-val">
                        {maxPoint ? `${maxPoint.count} (${maxPoint.date})` : "-"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Table list */}
              <div className="trend-table-container">
                <table className="trend-table">
                  <thead>
                    {statId === "likes-shares" ? (
                      <tr>
                        <th>Date</th>
                        <th style={{ textAlign: "right" }}>Likes</th>
                        <th style={{ textAlign: "right" }}>Shares</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>Date</th>
                        <th style={{ textAlign: "right" }}>Count</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {data.slice().reverse().map((row, i) => (
                      <tr key={i}>
                        <td className="trend-td-date">{row.date}</td>
                        {statId === "likes-shares" ? (
                          <>
                            <td className="trend-td-count" style={{ color: "#BE185D", fontWeight: "500", textAlign: "right" }}>
                              {(row.likesCount || 0).toLocaleString()}
                            </td>
                            <td className="trend-td-count" style={{ color: "#047857", fontWeight: "500", textAlign: "right" }}>
                              {(row.sharesCount || 0).toLocaleString()}
                            </td>
                            <td className="trend-td-count" style={{ color: currentTheme.main, fontWeight: "700", textAlign: "right" }}>
                              {row.count.toLocaleString()}
                            </td>
                          </>
                        ) : (
                          <td className="trend-td-count" style={{ color: currentTheme.main, fontWeight: "600", textAlign: "right" }}>
                            {row.count.toLocaleString()}
                          </td>
                        )}
                      </tr>
                    ))}
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

export default Dashboard;
