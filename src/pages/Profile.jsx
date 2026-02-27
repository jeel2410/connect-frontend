import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import Header from "../component/Header";
import ProfilepageCard from "../component/ProfilepageCard";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if user is authenticated
        const token = getCookie("authToken");
        if (!token) {
          setError("Please login to view your profile");
          setLoading(false);
          return;
        }

        // Call the API to get user profile
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // If unauthorized, user might need to login again
          if (response.status === 401) {
            setError("Unauthorized: Please login again");
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        // Check if response is successful and has profile data
        if (data.success && data.data && data.data.profile) {
          setProfileData(data.data.profile);
        } else {
          setError("Profile data not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <>
        <Header></Header>
        <div className="dating-profile-wrapper">
          {/* <Sidebar profileData={null}></Sidebar> */}
          <div className="dating-profile-main">
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
              Loading profile...
            </div>
          </div>
        </div>
        <Footer></Footer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header></Header>
        <div className="dating-profile-wrapper">
          {/* <Sidebar profileData={null}></Sidebar> */}
          <div className="dating-profile-main">
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#DC2626" }}>
              <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
                {error}
              </div>
            </div>
          </div>
        </div>
        <Footer></Footer>
      </>
    );
  }

  return (
    <>
      <Header></Header>
      <div className="dating-profile-wrapper">
        {/* <Sidebar profileData={profileData}></Sidebar> */}
        <ProfilepageCard profileData={profileData}></ProfilepageCard>
      </div>
      <Footer></Footer>
    </>
  );
};

export default Profile;
