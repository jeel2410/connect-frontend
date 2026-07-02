import React from "react";
import { Users, Briefcase, Heart, LayoutDashboard, MapPin, Activity, Building2, Factory, CreditCard, Bell, MessageSquare, Image, BarChart3, ShieldAlert, Trophy, Newspaper, Award } from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "post-approvals", label: "Post Approvals", icon: ShieldAlert },
    { id: "shared-posts", label: "Shared Posts", icon: Newspaper },
    { id: "traffic-sources", label: "Traffic Sources", icon: BarChart3 },
    { id: "skills", label: "Skills", icon: Briefcase },
    { id: "habits", label: "Hobbies", icon: Activity },
    { id: "interests", label: "Interests", icon: Heart },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "industries", label: "Industries", icon: Factory },
    { id: "positions", label: "Positions", icon: Award },
    { id: "cards", label: "Offers", icon: CreditCard },
    { id: "cities", label: "Cities", icon: MapPin },
    { id: "auth-banners", label: "Auth Banners", icon: Image },
    { id: "broadcast", label: "Broadcast Notification", icon: Bell },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
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
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`admin-sidebar-item ${activeTab === item.id ? "active" : ""
                }`}
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
