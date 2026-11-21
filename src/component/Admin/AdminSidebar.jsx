import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Heart,
  LayoutDashboard,
  MapPin,
  Activity,
  Building2,
  Factory,
  CreditCard,
  Bell,
  MessageSquare,
  Image,
  BarChart3,
  ShieldAlert,
  Trophy,
  Newspaper,
  Award,
  Mail,
  Tags,
  ClipboardList,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export const REGISTRATION_FIELD_ITEMS = [
  { id: "business-categories", label: "Business Categories", icon: Tags },
  { id: "skills", label: "Skills", icon: Briefcase },
  { id: "habits", label: "Hobbies", icon: Activity },
  { id: "interests", label: "Interests", icon: Heart },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "industries", label: "Industries", icon: Factory },
  { id: "positions", label: "Positions", icon: Award },
  { id: "cities", label: "Cities", icon: MapPin },
];

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const isRegFieldActive = REGISTRATION_FIELD_ITEMS.some((f) => f.id === activeTab);
  const [isRegFieldsExpanded, setIsRegFieldsExpanded] = useState(isRegFieldActive);

  // Auto-expand registration fields section whenever an active sub-tab is chosen
  useEffect(() => {
    if (isRegFieldActive) {
      setIsRegFieldsExpanded(true);
    }
  }, [isRegFieldActive]);

  const handleRegistrationFieldsClick = () => {
    if (!isRegFieldActive) {
      setActiveTab("business-categories");
      setIsRegFieldsExpanded(true);
    } else {
      setIsRegFieldsExpanded((prev) => !prev);
    }
  };

  const topMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "businesses", label: "Businesses", icon: Building2 },
    { id: "post-approvals", label: "Topic Approval", icon: ShieldAlert },
    { id: "shared-posts", label: "Topics", icon: Newspaper },
    { id: "traffic-sources", label: "Traffic Sources", icon: BarChart3 },
    { id: "cards", label: "Offers", icon: CreditCard },
  ];

  const bottomMenuItems = [
    { id: "auth-banners", label: "Auth Banners", icon: Image },
    { id: "broadcast", label: "Broadcast Notification", icon: Bell },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "scheduled-mailers", label: "Scheduled Mailers", icon: Mail },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <LayoutDashboard size={24} />
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {topMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`admin-sidebar-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Grouped Section: Registration Fields */}
        <div className="admin-sidebar-group">
          <button
            type="button"
            className={`admin-sidebar-item admin-sidebar-group-btn ${isRegFieldActive ? "active" : ""}`}
            onClick={handleRegistrationFieldsClick}
          >
            <div className="admin-sidebar-group-title">
              <ClipboardList size={20} />
              <span>Registration Fields</span>
            </div>
            <span className="admin-sidebar-chevron">
              {isRegFieldsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>

          {isRegFieldsExpanded && (
            <div className="admin-sidebar-submenu">
              {REGISTRATION_FIELD_ITEMS.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <button
                    key={field.id}
                    type="button"
                    className={`admin-sidebar-subitem ${activeTab === field.id ? "active" : ""}`}
                    onClick={() => setActiveTab(field.id)}
                  >
                    <FieldIcon size={16} />
                    <span>{field.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`admin-sidebar-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
