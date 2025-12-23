import React from "react";
import profile1 from "../../src/assets/image/profile/profile1.png"
import profile2 from "../../src/assets/image/profile/profile2.png";
import profile3 from "../../src/assets/image/profile/profile3.png";
import profile4 from "../../src/assets/image/profile/profile4.png";
import profile5 from "../../src/assets/image/profile/profile5.png";
import profile6 from "../../src/assets/image/profile/profile6.png";
import profile7 from "../../src/assets/image/profile/profile7.png";
import profile8 from "../../src/assets/image/profile/profile8.png";
import close from "../../src/assets/image/close.png";
import heart from "../../src/assets/image/heart.png";
import c from "../../src/assets/image/c.png";
export default function Usercard() {
      const profiles = [
    {
      id: 1,
      name: "Martina Parker",
      address: "2464 Royal Ln. Mesa",
      image: profile1,
      verified: false,
      featured: false,
    },
    {
      id: 2,
      name: "Courtney Henry",
      address: "Washington Manchester",
      image: profile2,
      verified: true,
      featured: true,
    },
    {
      id: 3,
      name: "Jane Cooper",
      address: "2118 Thornridge Syracuse",
      image: profile3,
      verified: false,
      featured: false,
    },
    {
      id: 4,
      name: "Wade Warren",
      address: "82 Preston Rd. Inglewood",
      image: profile4,
      verified: false,
      featured: false,
    },
    {
      id: 5,
      name: "Arlene McCoy",
      address: "2972 Woiner Rds. Santa",
      image: profile5,
      verified: false,
      featured: false,
    },
    {
      id: 6,
      name: "Robert Fox",
      address: "38 Ranchvs. Richardson",
      image: profile6,
      verified: false,
      featured: false,
    },
    {
      id: 7,
      name: "Darrell Steward",
      address: "6391 Elgin St. Celina",
      image: profile7,
      verified: false,
      featured: false,
    },
    {
      id: 8,
      name: "Cameron Williamson",
      address: "35 W. Gray St. Utica",
      image: profile8,
      verified: false,
      featured: false,
    },
  ];
  return (
    <div>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <div key={profile.id} className="profile-card">
            <div className="profile-image-wrapper">
              <img
                src={profile.image}
                alt={profile.name}
                className="profile-image"
              />
            </div>

            <h3 className="profile-name">{profile.name}</h3>
            <p className="profile-address">{profile.address}</p>

            <div className="profile-actions">
              <button className="action-btn ">
                <img src={close}></img>
              </button>
              <button className={`action-btn-2 heart-btn`}>
                <img src={heart} className="heart-btn-icon"></img>
              </button>
              <button className="action-btn chat-btn">
                <img src={c} className="chatbtn-icon"></img>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
