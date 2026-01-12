import React, { useState } from "react";
import Header from "../component/Header";
import AdminSidebar from "../component/Admin/AdminSidebar";
import UserManagement from "../component/Admin/UserManagement";
import SkillManagement from "../component/Admin/SkillManagement";
import InterestManagement from "../component/Admin/InterestManagement";
import CityManagement from "../component/Admin/CityManagement";
import "../styles/admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-layout">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="admin-main-content">
          <div className="admin-content-header">
            <h1 className="admin-title">
              {activeTab === "users" && "User Management"}
              {activeTab === "skills" && "Skill Management"}
              {activeTab === "interests" && "Interest Management"}
              {activeTab === "cities" && "City Management"}
            </h1>
            <p className="admin-subtitle">
              {activeTab === "users" && "View and manage all users"}
              {activeTab === "skills" && "Add, edit, and delete skills"}
              {activeTab === "interests" && "Add, edit, and delete interests"}
              {activeTab === "cities" && "Add, edit, and delete cities"}
            </p>
          </div>
          <div className="admin-content-body">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "skills" && <SkillManagement />}
            {activeTab === "interests" && <InterestManagement />}
            {activeTab === "cities" && <CityManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
