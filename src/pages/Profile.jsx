import React from "react";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import Header from "../component/Header";
import ProfilepageCard from "../component/ProfilepageCard";

const Profile = () => {
  return (
    <>
      <Header></Header>
      <div className="dating-profile-wrapper">
        <Sidebar></Sidebar>
         <ProfilepageCard></ProfilepageCard>
      </div>
      <Footer></Footer>
    </>
  );
};

export default Profile;
