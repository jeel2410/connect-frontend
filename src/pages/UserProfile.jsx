import React from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import UserProfileModal from '../component/UserProfileModal';
import Header from '../component/Header';
import Footer from '../component/Footer';

const UserProfile = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const userId = params.id || searchParams.get('id') || location.state?.userId || null;

  return (
    <>
      <Header />
      <div className="user-profile-wrapper">
        <div className="user-profile-bg">
          <div className="user-profile-overlay"></div>
        </div>

        <UserProfileModal userId={userId} />
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;