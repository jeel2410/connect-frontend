import React, { useState, useEffect } from "react";
import creditcardicon from "../../src/assets/image/credit.png";
import OfferCard from "../component/OfferCard";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Sidebar from "../component/Sidebar";
import { getCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";

const Offer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getCookie("authToken");
        const res = await fetch(`${API_BASE_URL}/api/list/offer-categories`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.data && data.data.categories) {
          setCategories(data.data.categories);
        }
      } catch (err) {
        console.error("Error fetching offer categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
    <Header></Header>
      <div className="dating-profile-wrapper">
        {/* <Sidebar /> */}
        <div className="offers-page-wrapper">
         <div className="title-div">
            <h1 className="inner-page-title"><span>Recommended</span><span className="title-highlight">Offers</span></h1>
          </div>
          <div className="offers-page-card">
            <div className="offers-page-header">
              <div className="offers-page-search">
                <span className="offers-page-select-icon">
                  <img src={creditcardicon} alt="search" />
                </span>

                <input
                  type="text"
                  className="offers-page-select"
                  placeholder="Search offers..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="offers-page-category-dropdown">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="offers-category-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <OfferCard searchQuery={searchQuery} selectedCategory={selectedCategory}></OfferCard>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
};

export default Offer;
