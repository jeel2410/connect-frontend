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
import InquiryManagement from "../component/Admin/InquiryManagement";
import AuthBannerManagement from "../component/Admin/AuthBannerManagement";
import Dashboard from "../component/Admin/Dashboard";
import TrafficSourceStats from "../component/Admin/TrafficSourceStats";
import PostApproval from "../component/Admin/PostApproval";
import SportManagement from "../component/Admin/SportManagement";
import PositionManagement from "../component/Admin/PositionManagement";
import SharedPostManagement from "../component/Admin/SharedPostManagement";
import "../styles/admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-layout">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="admin-main-content">
          <div className="admin-content-header">
            <h1 className="admin-title">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "users" && "User Management"}
              {activeTab === "post-approvals" && "Post Approvals"}
              {activeTab === "shared-posts" && "Shared Post Management"}
              {activeTab === "skills" && "Skill Management"}
              {activeTab === "habits" && "Hobby Management"}
              {activeTab === "companies" && "Company Management"}
              {activeTab === "interests" && "Interest Management"}
              {activeTab === "industries" && "Industry Management"}
              {activeTab === "cards" && "Offer Management"}
              {activeTab === "cities" && "City Management"}
              {activeTab === "broadcast" && "Broadcast Notification"}
              {activeTab === "inquiries" && "Inquiry Management"}
              {activeTab === "auth-banners" && "Auth Banner Management"}
              {activeTab === "traffic-sources" && "Traffic Sources"}
              {activeTab === "sports" && "Sport Management"}
              {activeTab === "positions" && "Position Management"}
            </h1>
            <p className="admin-subtitle">
              {activeTab === "dashboard" && "Platform overview and core metrics snapshot"}
              {activeTab === "users" && "View and manage all users"}
              {activeTab === "post-approvals" && "Review and approve/reject newly shared posts or links"}
              {activeTab === "shared-posts" && "View, disable, or permanently delete live shared posts"}
              {activeTab === "skills" && "Add, edit, and delete skills"}
              {activeTab === "habits" && "Add, edit, and delete hobbies"}
              {activeTab === "interests" && "Add, edit, and delete interests"}
              {activeTab === "industries" && "Add, edit, and delete industries"}
              {activeTab === "companies" && "Add, edit, and delete companies"}
              {activeTab === "cards" && "Add, edit, and delete Offers"}
              {activeTab === "cities" && "Add, edit, and delete cities"}
              {activeTab === "broadcast" && "Send notifications to all users"}
              {activeTab === "inquiries" && "View all inquiries and import from CSV"}
              {activeTab === "auth-banners" && "Manage desktop and mobile banners for login, OTP, and profile verification screens"}
              {activeTab === "traffic-sources" && "View registered user counts by traffic source parameters"}
              {activeTab === "sports" && "Add, edit, and delete sports"}
              {activeTab === "positions" && "Add, edit, and delete positions"}
            </p>
          </div>
          <div className="admin-content-body">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "post-approvals" && <PostApproval />}
            {activeTab === "shared-posts" && <SharedPostManagement />}
            {activeTab === "skills" && <SkillManagement />}
            {activeTab === "habits" && <HabitManagement />}
            {activeTab === "interests" && <InterestManagement />}
            {activeTab === "companies" && <CompanyManagement />}
            {activeTab === "industries" && <IndustryManagement />}
            {activeTab === "cards" && <CardManagement />}
            {activeTab === "cities" && <CityManagement />}
            {activeTab === "broadcast" && <BroadcastNotification />}
            {activeTab === "inquiries" && <InquiryManagement />}
            {activeTab === "auth-banners" && <AuthBannerManagement />}
            {activeTab === "traffic-sources" && <TrafficSourceStats />}
            {activeTab === "sports" && <SportManagement />}
            {activeTab === "positions" && <PositionManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
