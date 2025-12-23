import React from 'react';
import profilebg from "../assets/image/grouppic_bg.png"

import UserProfileModal from '../component/UserProfileModal';
import Header from '../component/Header';
import Footer from '../component/Footer';
const UserProfile = () => {
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

     <UserProfileModal></UserProfileModal>
    </div>
    <Footer></Footer>
   </>
  );
};

export default UserProfile;