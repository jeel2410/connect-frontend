import React, { useState } from "react";
import Header from "../component/Header";
import AdminSidebar, { REGISTRATION_FIELD_ITEMS } from "../component/Admin/AdminSidebar";
import UserManagement from "../component/Admin/UserManagement";
import BusinessManagement from "../component/Admin/BusinessManagement";
import BusinessCategoryManagement from "../component/Admin/BusinessCategoryManagement";
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
import ScheduledMailers from "../component/Admin/ScheduledMailers";
import "../styles/admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const currentRegField = REGISTRATION_FIELD_ITEMS.find((f) => f.id === activeTab);
  const isRegField = Boolean(currentRegField) || activeTab === "registration-fields";
  const effectiveRegTab = activeTab === "registration-fields" ? "business-categories" : activeTab;

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
              {activeTab === "businesses" && "Business Management"}
              {activeTab === "post-approvals" && "Topic Approval"}
              {activeTab === "shared-posts" && "Topics"}
              {activeTab === "cards" && "Offer Management"}
              {activeTab === "broadcast" && "Broadcast Notification"}
              {activeTab === "inquiries" && "Inquiry Management"}
              {activeTab === "auth-banners" && "Auth Banner Management"}
              {activeTab === "traffic-sources" && "Traffic Sources"}
              {activeTab === "scheduled-mailers" && "Scheduled Mailers"}
              {isRegField && `Registration Fields — ${REGISTRATION_FIELD_ITEMS.find((f) => f.id === effectiveRegTab)?.label || "Registration Fields"}`}
            </h1>
            <p className="admin-subtitle">
              {activeTab === "dashboard" && "Platform overview and core metrics snapshot"}
              {activeTab === "users" && "View and manage all users"}
              {activeTab === "businesses" && "View and manage registered businesses"}
              {activeTab === "post-approvals" && "Review and approve/reject newly submitted topics"}
              {activeTab === "shared-posts" && "View, disable, or permanently delete live topics"}
              {activeTab === "cards" && "Add, edit, and delete Offers"}
              {activeTab === "broadcast" && "Send notifications to all users"}
              {activeTab === "inquiries" && "View all inquiries and import from CSV"}
              {activeTab === "auth-banners" && "Manage desktop and mobile banners for login, OTP, and profile verification screens"}
              {activeTab === "traffic-sources" && "View registered user counts by traffic source parameters"}
              {activeTab === "scheduled-mailers" && "Monitor automated mail queues, view send logs, and manually trigger tasks"}
              {isRegField && `Manage dropdown, filter, and profile options for ${REGISTRATION_FIELD_ITEMS.find((f) => f.id === effectiveRegTab)?.label.toLowerCase() || "registration"}.`}
            </p>

            {/* Registration Fields Horizontal Sub-Navigation */}
            {isRegField && (
              <div className="registration-fields-subnav">
                {REGISTRATION_FIELD_ITEMS.map((field) => {
                  const FieldIcon = field.icon;
                  const isActive = effectiveRegTab === field.id;
                  return (
                    <button
                      key={field.id}
                      type="button"
                      className={`registration-field-pill ${isActive ? "active" : ""}`}
                      onClick={() => setActiveTab(field.id)}
                    >
                      <FieldIcon size={15} />
                      <span>{field.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="admin-content-body">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "businesses" && <BusinessManagement />}
            {activeTab === "post-approvals" && <PostApproval />}
            {activeTab === "shared-posts" && <SharedPostManagement />}
            {activeTab === "cards" && <CardManagement />}
            {activeTab === "broadcast" && <BroadcastNotification />}
            {activeTab === "inquiries" && <InquiryManagement />}
            {activeTab === "auth-banners" && <AuthBannerManagement />}
            {activeTab === "traffic-sources" && <TrafficSourceStats />}
            {activeTab === "scheduled-mailers" && <ScheduledMailers />}

            {/* Registration Fields Grouped Components */}
            {(effectiveRegTab === "business-categories") && <BusinessCategoryManagement />}
            {effectiveRegTab === "skills" && <SkillManagement />}
            {effectiveRegTab === "habits" && <HabitManagement />}
            {effectiveRegTab === "interests" && <InterestManagement />}
            {effectiveRegTab === "sports" && <SportManagement />}
            {effectiveRegTab === "companies" && <CompanyManagement />}
            {effectiveRegTab === "industries" && <IndustryManagement />}
            {effectiveRegTab === "positions" && <PositionManagement />}
            {effectiveRegTab === "cities" && <CityManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
