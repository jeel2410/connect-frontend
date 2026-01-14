import React, { useState } from "react";
import Header from "../component/Header";
import AdminSidebar from "../component/Admin/AdminSidebar";
import UserManagement from "../component/Admin/UserManagement";
import SkillManagement from "../component/Admin/SkillManagement";
import HabitManagement from "../component/Admin/HabitManagement";
import InterestManagement from "../component/Admin/InterestManagement";
import CompanyManagement from "../component/Admin/CompanyManagement";
import IndustryManagement from "../component/Admin/IndustryManagement";
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
              {activeTab === "habits" && "Habit Management"}
              {activeTab === "interests" && "Interest Management"}
              {activeTab === "companies" && "Company Management"}
              {activeTab === "industries" && "Industry Management"}
              {activeTab === "cities" && "City Management"}
            </h1>
            <p className="admin-subtitle">
              {activeTab === "users" && "View and manage all users"}
              {activeTab === "skills" && "Add, edit, and delete skills"}
              {activeTab === "habits" && "Add, edit, and delete habits"}
              {activeTab === "interests" && "Add, edit, and delete interests"}
              {activeTab === "companies" && "Add, edit, and delete companies"}
              {activeTab === "industries" && "Add, edit, and delete industries"}
              {activeTab === "cities" && "Add, edit, and delete cities"}
            </p>
          </div>
          <div className="admin-content-body">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "skills" && <SkillManagement />}
            {activeTab === "habits" && <HabitManagement />}
            {activeTab === "interests" && <InterestManagement />}
            {activeTab === "companies" && <CompanyManagement />}
            {activeTab === "industries" && <IndustryManagement />}
            {activeTab === "cities" && <CityManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
