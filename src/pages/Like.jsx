import React, { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Sidebar from "../component/Sidebar";
import searchIcon from "../../src/assets/image/serachIcon.png";
import outlineHeart from "../../src/assets/image/outline_icon.png"
import blackHeart from "../../src/assets/image/black_icon.png"
import heartIcon from "../../src/assets/image/favourite_Icon.png";
import profile1 from "../../src/assets/image/profile/profile1.png"
import profile2 from "../../src/assets/image/profile/profile2.png"
import profile3 from "../../src/assets/image/profile/profile3.png"
import profile4 from "../../src/assets/image/profile/profile4.png"
import profile5 from "../../src/assets/image/profile/profile5.png"
import profile6 from "../../src/assets/image/profile/profile6.png"

const Likes = () => {
  const [activeTab, setActiveTab] = useState("myFavorite");
  const [favorites, setFavorites] = useState({});

  const myFavoriteUsers = [
    {
      id: 1,
      name: "Ralph Edwards",
      address: "2464 Royal Ln.",
      image: profile2,
      isFavorite: true,
    },
    {
      id: 2,
      name: "Kathryn Murphy",
      address: "7529 E. Lincoln St.",
      image:profile1,
      isFavorite: true,
    },
    {
      id: 3,
      name: "Annette Black",
      address: "8080 Railroad St.",
      image: profile3,
      isFavorite: true,
    },
    {
      id: 4,
      name: "Devon Lane",
      address: "3605 Parker Rd.",
      image:profile4,
      isFavorite: true,
    },
    {
      id: 5,
      name: "Albert Flores",
      address: "775 Rolling Green Rd.",
      image: profile5,
      isFavorite: true,
    },
    {
      id: 6,
      name: "Wade Warren",
      address: "3605 Parker Rd.",
      image:profile6,
      isFavorite: true,
    },
    {
      id: 7,
      name: "Savannah Nguyen",
      address: "3890 Poplar Dr.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      isFavorite: true,
    },
  ];
 const toggleFavorite = (userId) => {
    setFavorites((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <Sidebar />
        <div className="likes-page-wrapper">
          <div className="likes-page-card">
            <div className="likes-page-header">
              <h1>Likes</h1>
              <div className="likes-page-search">
                <span className="likes-page-search-icon">
                  <img src={searchIcon} alt="search" />
                </span>
                <input type="text" placeholder="Search here" />
              </div>
            </div>
            <div className="likes-page-tabs">
              <button
                className={`likes-page-tab ${activeTab === "myFavorite" ? "active" : ""}`}
                onClick={() => setActiveTab("myFavorite")}
              >
                <img src={blackHeart}></img> My Favorite
              </button>
              <button
                className={`likes-page-tab ${activeTab === "likes" ? "active" : ""}`}
                onClick={() => setActiveTab("likes")}
              >
                 <img src={outlineHeart}></img>  Likes
              </button>
            </div>
            {activeTab === "myFavorite" && (
              <div className="likes-grid">
                {myFavoriteUsers.map((user) => (
                  <div key={user.id} className="like-card">
                      <button
                        className="heart-btn-container"
                        onClick={() => toggleFavorite(user.id)}
                      >
                        <img
                          src={heartIcon}
                          alt="favorite"
                        />
                      </button>
                    <img
                      src={user.image}
                      alt={user.name}
                      className="like-avatar"
                    />
                    <div className="like-info">
                      <h3>{user.name}</h3>
                      <p>{user.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "likes" && (
            <></>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Likes;