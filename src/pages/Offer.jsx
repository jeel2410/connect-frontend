import React from "react";
import creditcardicon from "../../src/assets/image/credit.png";
import OfferCard from "../component/OfferCard";
import Header from "../component/Header";
import Footer from "../component/Footer";

const Offer = () => {
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

            <select className="offers-page-select">
              <option value="">Select Credit Card</option>
              <option value="hdfc">HDFC Credit Card</option>
              <option value="icici">ICICI Credit Card</option>
              <option value="axis">Axis Credit Card</option>
              <option value="sbi">SBI Credit Card</option>
            </select>
          </div>
        </div>
        <OfferCard></OfferCard>
      </div>
      <Footer></Footer>
    </>
  );
};

export default Offer;
