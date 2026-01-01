import React from 'react';
import { useLocation } from 'react-router-dom';
import profilebg from "../assets/image/grouppic_bg.png"

import UserProfileModal from '../component/UserProfileModal';
import Header from '../component/Header';
import Footer from '../component/Footer';
const UserProfile = () => {
  const location = useLocation();
  const userId = location.state?.userId || null;

  return (
   <>
   <Header></Header>
    <div className="user-profile-wrapper">
      <div className="user-profile-bg">
        <img 
          src={profilebg}
          alt="Background"
        />
        <div className="user-profile-overlay"></div>
      </div>

     <UserProfileModal userId={userId}></UserProfileModal>
    </div>
    <Footer></Footer>
   </>
  );
};

export default UserProfile;