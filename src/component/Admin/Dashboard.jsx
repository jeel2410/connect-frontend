import React, { useState, useEffect } from "react";
import { Users, ArrowLeftRight, Heart, CreditCard, Share2, MessageSquare, RefreshCw, Loader2, ArrowUpRight, Activity, Smile, TrendingUp, Building2, Download, AlertCircle, X } from "lucide-react";
import { getDashboardStats, getStatsTrend, downloadStageIncompleteProfilesCSV, getStageIncompleteCounts } from "../../utils/adminApi";

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
  // Completion rate against NEW profiles (signups in the last 7 days) — this is
  // what the "Completed Profiles" box and its datewise trend surface, rather
  // than the all-time completionPercentage above.
  const newProfilesCompletionPercentage = stats?.newProfilesCompletionPercentage ?? 0;

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
      percentage: newProfilesCompletionPercentage,
      verifiedEmailPercentage: stats?.completedVerifiedEmailPercentage ?? 0,
      verifiedEmailCount: stats?.completedVerifiedProfiles || 0,
      icon: Smile,
      color: "emerald",
      description: `Email Verified: ${stats?.completedVerifiedEmailPercentage ?? 0}% (${stats?.completedVerifiedProfiles || 0}/${stats?.totalCompleteProfiles || 0}) • 7-day completion: ${newProfilesCompletionPercentage}%`,
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
      title: "Likes",
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
      title: "Asked / Shared",
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
                {card.verifiedEmailPercentage !== undefined ? (
                  <span style={{
                    backgroundColor: "#EFF6FF",
                    color: "#2563EB",
                    border: "1px solid #BFDBFE",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>
                    {card.verifiedEmailPercentage}% Verified Email
                  </span>
                ) : card.percentage !== undefined && (
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
          stats={stats}
        />
      )}
    </div>
  );
};

// PasscodeModal sub-component for authorizing downloads
const PasscodeModal = ({ isOpen, onClose, onConfirm, actionTitle = "Download Mobile Numbers", requiredPasscode = "8282" }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode.trim() === String(requiredPasscode).trim()) {
      setError("");
      setPasscode("");
      onConfirm(passcode.trim());
      onClose();
    } else {
      setError("Incorrect security passcode! Please try again.");
    }
  };

  const handleClose = () => {
    setPasscode("");
    setError("");
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(9, 18, 46, 0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 10001,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        maxWidth: "420px",
        width: "100%",
        padding: "24px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={18} style={{ color: "#DC2626" }} />
            </div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#09122E", fontFamily: "Basier Square, sans-serif" }}>Confirm Security Passcode</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "50%" }}
          >
            <X size={18} color="#777E90" />
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "#4B5563", marginBottom: "16px", lineHeight: "1.5" }}>
          To authorize <strong>{actionTitle}</strong>, please enter the security passcode.
        </p>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: 8,
            color: "#DC2626",
            marginBottom: 16,
            fontSize: 13
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#353945", marginBottom: "6px", display: "block" }}>
              Security Passcode <span style={{ color: "#EC7523" }}>*</span>
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(""); }}
              placeholder="Enter security passcode"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #DDE2EE",
                background: "#F8F9FA",
                color: "#4B5563",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#0284C7",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Authorize & Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// TrendModal sub-component definition
const TrendModal = ({ isOpen, onClose, statId, statTitle, statColor, statIcon: Icon, stats }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Incomplete profile mobile download state
  const [downloadScope, setDownloadScope] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [stageCounts, setStageCounts] = useState({ all: null, '7': null });

  const handleRequestDownload = (stage, title, options = {}) => {
    setDownloadError(null);
    setDownloadSuccess(null);
    setPendingDownload({
      stage,
      title,
      options: {
        days: options.date ? undefined : (options.days || downloadScope),
        date: options.date,
      }
    });
    setShowPasscodeModal(true);
  };

  const handleConfirmDownload = async (passcode) => {
    if (!pendingDownload) return;
    try {
      setDownloading(true);
      setDownloadError(null);
      await downloadStageIncompleteProfilesCSV(pendingDownload.stage, {
        days: pendingDownload.options.days,
        date: pendingDownload.options.date,
        passcode: passcode
      });
      setDownloadSuccess(`Successfully downloaded mobile numbers for ${pendingDownload.title}!`);
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err) {
      setDownloadError(err.message || "Failed to download CSV");
    } finally {
      setDownloading(false);
      setPendingDownload(null);
    }
  };

  useEffect(() => {
    if (!isOpen || !statId) return;

    const fetchTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getStatsTrend(statId);
        if (response.success && response.data?.trend) {
          setData(response.data.trend);
          if (response.data.stageCounts) {
            setStageCounts(response.data.stageCounts);
          }
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

  // Ensure counts for active scope are fetched if not yet cached
  useEffect(() => {
    if (!isOpen || statId !== "complete-profiles") return;
    if (stageCounts[downloadScope]) return;

    const fetchCounts = async () => {
      try {
        const res = await getStageIncompleteCounts(downloadScope);
        if (res.success && res.data) {
          setStageCounts(prev => ({ ...prev, [downloadScope]: res.data }));
        }
      } catch (err) {
        console.error("Error loading stage counts:", err);
      }
    };
    fetchCounts();
  }, [isOpen, statId, downloadScope, stageCounts]);

  const currentCounts = stageCounts[downloadScope] || stageCounts.all || null;
  const emailCountStr = currentCounts && currentCounts.email !== undefined ? ` (${currentCounts.email.toLocaleString()})` : "";
  const basicCountStr = currentCounts && currentCounts.basic !== undefined ? ` (${currentCounts.basic.toLocaleString()})` : "";
  const fullCountStr = currentCounts && currentCounts.full !== undefined ? ` (${currentCounts.full.toLocaleString()})` : "";

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
                ) : statId === "complete-profiles" ? (
                  (() => {
                    const totalOtpDone = data.reduce((sum, d) => sum + (d.otpDone ?? d.newSignups ?? 0), 0);
                    const totalEmailVerified = data.reduce((sum, d) => sum + (d.emailVerified ?? d.completedVerified ?? 0), 0);
                    const totalBasicProfile = data.reduce((sum, d) => sum + (d.basicProfile ?? 0), 0);
                    const totalFullProfile = data.reduce((sum, d) => sum + (d.fullProfile ?? d.count ?? 0), 0);

                    const emailVerifiedPct = totalOtpDone > 0 ? ((totalEmailVerified / totalOtpDone) * 100).toFixed(1) : 0;
                    const basicProfilePct = totalOtpDone > 0 ? ((totalBasicProfile / totalOtpDone) * 100).toFixed(1) : 0;
                    const fullProfilePct = totalOtpDone > 0 ? ((totalFullProfile / totalOtpDone) * 100).toFixed(1) : 0;

                    return (
                      <>
                        <div className="trend-summary-card">
                          <span className="summary-label">7-Day OTP Done</span>
                          <span className="summary-val" style={{ color: currentTheme.main }}>
                            {totalOtpDone.toLocaleString()}
                          </span>
                        </div>
                        <div className="trend-summary-card">
                          <span className="summary-label">7-Day EMAIL Verified</span>
                          <span className="summary-val" style={{ color: "#2563EB" }}>
                            {totalEmailVerified.toLocaleString()}{" "}
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748B" }}>
                              ({emailVerifiedPct}%)
                            </span>
                          </span>
                        </div>
                        <div className="trend-summary-card">
                          <span className="summary-label">7-Day BASIC PROFILE</span>
                          <span className="summary-val" style={{ color: "#D97706" }}>
                            {totalBasicProfile.toLocaleString()}{" "}
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748B" }}>
                              ({basicProfilePct}%)
                            </span>
                          </span>
                        </div>
                        <div className="trend-summary-card">
                          <span className="summary-label">7-Day FULL PROFILE</span>
                          <span className="summary-val" style={{ color: "#059669" }}>
                            {totalFullProfile.toLocaleString()}{" "}
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748B" }}>
                              ({fullProfilePct}%)
                            </span>
                          </span>
                        </div>
                      </>
                    );
                  })()
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

              {/* Action Box for Downloading Incomplete Profile Stages */}
              {statId === "complete-profiles" && (
                <div style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Download size={16} color="#0284C7" />
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0F172A", fontFamily: "Basier Square, sans-serif" }}>
                          Download Incomplete Stage Profiles (Mobile Numbers Only)
                        </h4>
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748B" }}>
                        One-click download mobile numbers of users dropped off at each registration stage (Mobile Numbers Only)
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#E2E8F0", borderRadius: 8, padding: 3 }}>
                      <button
                        type="button"
                        onClick={() => setDownloadScope("all")}
                        style={{
                          border: "none",
                          background: downloadScope === "all" ? "#fff" : "transparent",
                          color: downloadScope === "all" ? "#0F172A" : "#64748B",
                          fontWeight: "600",
                          fontSize: "12px",
                          padding: "5px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          boxShadow: downloadScope === "all" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"
                        }}
                      >
                        All Time
                      </button>
                      <button
                        type="button"
                        onClick={() => setDownloadScope("7")}
                        style={{
                          border: "none",
                          background: downloadScope === "7" ? "#fff" : "transparent",
                          color: downloadScope === "7" ? "#0F172A" : "#64748B",
                          fontWeight: "600",
                          fontSize: "12px",
                          padding: "5px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          boxShadow: downloadScope === "7" ? "0 1px 2px rgba(0,0,0,0.06)" : "none"
                        }}
                      >
                        Last 7 Days
                      </button>
                    </div>
                  </div>

                  {downloadError && (
                    <div style={{ padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, color: "#DC2626", fontSize: 12, marginBottom: 12 }}>
                      {downloadError}
                    </div>
                  )}
                  {downloadSuccess && (
                    <div style={{ padding: "8px 12px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, color: "#059669", fontSize: 12, marginBottom: 12 }}>
                      {downloadSuccess}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleRequestDownload('email', `Incomplete Email Sign-in (${downloadScope === 'all' ? 'All Time' : 'Last 7 Days'})`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#1D4ED8",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: downloading ? "not-allowed" : "pointer"
                      }}
                    >
                      <Download size={14} />
                      Stage 1: Incomplete Email Sign-in{emailCountStr}
                    </button>

                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleRequestDownload('basic', `Incomplete Basic Profile (${downloadScope === 'all' ? 'All Time' : 'Last 7 Days'})`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#B45309",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: downloading ? "not-allowed" : "pointer"
                      }}
                    >
                      <Download size={14} />
                      Stage 2: Incomplete Basic Profile{basicCountStr}
                    </button>

                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleRequestDownload('full', `Incomplete Full Profile (${downloadScope === 'all' ? 'All Time' : 'Last 7 Days'})`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#047857",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: downloading ? "not-allowed" : "pointer"
                      }}
                    >
                      <Download size={14} />
                      Stage 3: Incomplete Full Profile{fullCountStr}
                    </button>
                  </div>
                </div>
              )}

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
                    ) : statId === "complete-profiles" ? (
                      <tr>
                        <th>Date</th>
                        <th style={{ textAlign: "right" }}>OTP Done</th>
                        <th style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                            <span>EMAIL Verified</span>
                            <button
                              type="button"
                              onClick={() => handleRequestDownload('email', `Incomplete Email Sign-in (${downloadScope === 'all' ? 'All Time' : 'Last 7 Days'})`)}
                              title="Download mobile numbers of all users who haven't completed email signin"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                border: "1px solid #BFDBFE",
                                background: "#EFF6FF",
                                color: "#1D4ED8",
                                borderRadius: 6,
                                padding: "2px 6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              <Download size={10} /> Download Incomplete{emailCountStr}
                            </button>
                          </div>
                        </th>
                        <th style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                            <span>BASIC PROFILE</span>
                            <button
                              type="button"
                              onClick={() => handleRequestDownload('basic', `Incomplete Basic Profile (${downloadScope === 'all' ? 'All Time' : 'Last 7 Days'})`)}
                              title="Download mobile numbers of all users who haven't completed basic profile"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                border: "1px solid #FDE68A",
                                background: "#FFFBEB",
                                color: "#B45309",
                                borderRadius: 6,
                                padding: "2px 6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              <Download size={10} /> Download Incomplete{basicCountStr}
                            </button>
                          </div>
                        </th>
                        <th style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                            <span>FULL PROFILE</span>
                            <button
                              type="button"
                              onClick={() => handleRequestDownload('full', `Incomplete Full Profile (${downloadScope === 'all' ? 'All Time' : 'Last 7 Days'})`)}
                              title="Download mobile numbers of all users who haven't completed full profile"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                border: "1px solid #A7F3D0",
                                background: "#ECFDF5",
                                color: "#047857",
                                borderRadius: 6,
                                padding: "2px 6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              <Download size={10} /> Download Incomplete{fullCountStr}
                            </button>
                          </div>
                        </th>
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
                        ) : statId === "complete-profiles" ? (
                          <>
                            <td className="trend-td-count" style={{ fontWeight: "600", textAlign: "right" }}>
                              {(row.otpDone ?? row.newSignups ?? 0).toLocaleString()}
                            </td>
                            <td className="trend-td-count" style={{ color: "#2563EB", fontWeight: "600", textAlign: "right" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                                <span>{(row.emailVerified ?? row.completedVerified ?? 0).toLocaleString()}</span>
                                {(row.otpDone ?? row.newSignups ?? 0) > 0 && (
                                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                                    ({(((row.emailVerified ?? row.completedVerified ?? 0) / (row.otpDone ?? row.newSignups ?? 1)) * 100).toFixed(1)}%)
                                  </span>
                                )}
                                {row.rawDate && (
                                  <button
                                    type="button"
                                    onClick={() => handleRequestDownload('email', `Incomplete Email Sign-in (${row.date})`, { date: row.rawDate })}
                                    title={`Download incomplete email mobiles for ${row.date}`}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      color: "#60A5FA",
                                      cursor: "pointer",
                                      padding: 2,
                                      display: "inline-flex",
                                      alignItems: "center"
                                    }}
                                  >
                                    <Download size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="trend-td-count" style={{ color: "#D97706", fontWeight: "600", textAlign: "right" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                                <span>{(row.basicProfile ?? 0).toLocaleString()}</span>
                                {(row.otpDone ?? row.newSignups ?? 0) > 0 && (
                                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                                    ({(((row.basicProfile ?? 0) / (row.otpDone ?? row.newSignups ?? 1)) * 100).toFixed(1)}%)
                                  </span>
                                )}
                                {row.rawDate && (
                                  <button
                                    type="button"
                                    onClick={() => handleRequestDownload('basic', `Incomplete Basic Profile (${row.date})`, { date: row.rawDate })}
                                    title={`Download incomplete basic profile mobiles for ${row.date}`}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      color: "#FBBF24",
                                      cursor: "pointer",
                                      padding: 2,
                                      display: "inline-flex",
                                      alignItems: "center"
                                    }}
                                  >
                                    <Download size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="trend-td-count" style={{ color: currentTheme.main, fontWeight: "700", textAlign: "right" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                                <span>{(row.fullProfile ?? row.count ?? 0).toLocaleString()}</span>
                                {(row.otpDone ?? row.newSignups ?? 0) > 0 && (
                                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                                    ({(((row.fullProfile ?? row.count ?? 0) / (row.otpDone ?? row.newSignups ?? 1)) * 100).toFixed(1)}%)
                                  </span>
                                )}
                                {row.rawDate && (
                                  <button
                                    type="button"
                                    onClick={() => handleRequestDownload('full', `Incomplete Full Profile (${row.date})`, { date: row.rawDate })}
                                    title={`Download incomplete full profile mobiles for ${row.date}`}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      color: "#34D399",
                                      cursor: "pointer",
                                      padding: 2,
                                      display: "inline-flex",
                                      alignItems: "center"
                                    }}
                                  >
                                    <Download size={12} />
                                  </button>
                                )}
                              </div>
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

              {/* Passcode Confirmation Modal */}
              <PasscodeModal
                isOpen={showPasscodeModal}
                onClose={() => setShowPasscodeModal(false)}
                onConfirm={handleConfirmDownload}
                actionTitle={pendingDownload?.title}
                requiredPasscode="8282"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
