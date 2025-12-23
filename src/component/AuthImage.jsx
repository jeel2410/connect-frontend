import React from "react";
import "../../src/styles/style.css";
import user1 from "../../src/assets/image/user/user1.png"
import user2 from "../../src/assets/image/user/user2.png"
import user3 from "../../src/assets/image/user/user3.png"
import user4 from "../../src/assets/image/user/user4.png"
import user5 from "../../src/assets/image/user/user5.png"
import user6 from "../../src/assets/image/user/user6.png"

export default function AuthImage() {
  const profileCircles = [
    { id: 1, avatar: user1, className: "profile-1" },
    { id: 2, avatar: user2, className: "profile-2" },
    { id: 3, avatar: user3, className: "profile-3" },
    { id: 4, avatar: user4, className: "profile-4" },
    { id: 5, avatar: user5, className: "profile-5" },
    { id: 6, avatar: user6, className: "profile-6" },
  ];

  const paginationDots = [
    { id: 1, active: false },
    { id: 2, active: true },
    { id: 3, active: false },
     { id: 4, active: false },
  ];

  return (
    <div className="left-panel">
      {profileCircles.map((profile) => (
        <div key={profile.id} className={`profile-circle ${profile.className}`}>
         <div className="profile-avatar">
             <img src={profile.avatar} alt="profile" />
         </div>

        </div>
      ))}

      <div className="content-section">
        <h2 className="heading">Donec quam convis maximus dow</h2>
        <p className="description-login">
         Suspendisse semper magna id euismod neque ultricies Proi pharetra sap non Condiment purus. Morbi eu sem turpis.
        </p>

        <div className="pagination-dots">
          {paginationDots.map((dot) => (
            <span key={dot.id} className={`dot ${dot.active ? "active" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
