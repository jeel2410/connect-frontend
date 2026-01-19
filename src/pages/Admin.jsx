import React, { useState } from "react";
import Header from "../component/Header";
import AdminSidebar from "../component/Admin/AdminSidebar";
import UserManagement from "../component/Admin/UserManagement";
import SkillManagement from "../component/Admin/SkillManagement";
import HabitManagement from "../component/Admin/HabitManagement";
import InterestManagement from "../component/Admin/InterestManagement";
import CompanyManagement from "../component/Admin/CompanyManagement";
import IndustryManagement from "../component/Admin/IndustryManagement";
import CardManagement from "../component/Admin/CardManagement";
import CityManagement from "../component/Admin/CityManagement";
import BroadcastNotification from "../component/Admin/BroadcastNotification";
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
              {activeTab === "companies" && "Company Management"}
              {activeTab === "interests" && "Interest Management"}
              {activeTab === "industries" && "Industry Management"}
              {activeTab === "cards" && "Card Management"}
              {activeTab === "cities" && "City Management"}
              {activeTab === "broadcast" && "Broadcast Notification"}
            </h1>
            <p className="admin-subtitle">
              {activeTab === "users" && "View and manage all users"}
              {activeTab === "skills" && "Add, edit, and delete skills"}
              {activeTab === "habits" && "Add, edit, and delete habits"}
              {activeTab === "interests" && "Add, edit, and delete interests"}
              {activeTab === "industries" && "Add, edit, and delete industries"}
              {activeTab === "companies" && "Add, edit, and delete companies"}
              {activeTab === "cards" && "Add, edit, and delete cards"}
              {activeTab === "cities" && "Add, edit, and delete cities"}
              {activeTab === "broadcast" && "Send notifications to all users"}
            </p>
          </div>
          <div className="admin-content-body">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "skills" && <SkillManagement />}
            {activeTab === "habits" && <HabitManagement />}
            {activeTab === "interests" && <InterestManagement />}
            {activeTab === "companies" && <CompanyManagement />}
            {activeTab === "industries" && <IndustryManagement />}
            {activeTab === "cards" && <CardManagement />}
            {activeTab === "cities" && <CityManagement />}
            {activeTab === "broadcast" && <BroadcastNotification />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
