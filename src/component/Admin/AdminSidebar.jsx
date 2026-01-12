import React from "react";
import { Users, Briefcase, Heart, LayoutDashboard, MapPin } from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "users", label: "Users", icon: Users },
    { id: "skills", label: "Skills", icon: Briefcase },
    { id: "interests", label: "Interests", icon: Heart },
    { id: "cities", label: "Cities", icon: MapPin },
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
              className={`admin-sidebar-item ${
                activeTab === item.id ? "active" : ""
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
