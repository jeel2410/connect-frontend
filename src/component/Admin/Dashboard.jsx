import React, { useState, useEffect } from "react";
import { Users, ArrowLeftRight, Heart, CreditCard, Share2, MessageSquare, RefreshCw, Loader2, ArrowUpRight, Activity, Smile, TrendingUp } from "lucide-react";
import { getDashboardStats } from "../../utils/adminApi";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
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

  const statCards = [
    {
      id: "users",
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "blue",
      description: "Registered members on the platform",
      accentBg: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
      iconColor: "#0284C7",
      borderColor: "#38BDF8",
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
      id: "likes",
      title: "Total Likes",
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: "pink",
      description: "Expressive user like reactions",
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
            <div key={card.id} className={`dashboard-stat-card card-theme-${card.color}`}>
              <div className="card-top">
                <div 
                  className="card-icon-container" 
                  style={{ background: card.accentBg, color: card.iconColor }}
                >
                  <Icon size={24} />
                </div>
              </div>
              <div className="card-middle">
                <span className="card-value">{card.value.toLocaleString()}</span>
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
    </div>
  );
};

export default Dashboard;
