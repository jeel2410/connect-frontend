import React, { useState } from "react";
import creditcardicon from "../../src/assets/image/credit.png";
import OfferCard from "../component/OfferCard";
import Header from "../component/Header";
import Footer from "../component/Footer";

const Offer = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
    <Header></Header>
      <div className="offers-page-container">
        <div className="offers-page-header">
          <h1>Offers</h1>
          <div className="offers-page-search">
            <span className="offers-page-select-icon">
              <img src={creditcardicon} alt="search" />
            </span>

            <input
              type="text"
              className="offers-page-select"
              placeholder="Search credit cards..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <OfferCard searchQuery={searchQuery}></OfferCard>
      </div>
      <Footer></Footer>
    </>
  );
};

export default Offer;
