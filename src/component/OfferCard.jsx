import React from "react";
import hdfcicon from "../../src/assets/image/bankCard/hdfclogo.png";
import icici from "../../src/assets/image/bankCard/icici.png";
import paytm from "../../src/assets/image/bankCard/paytm.png";
import sbi from "../../src/assets/image/bankCard/sbi.png";
import hsbc from "../../src/assets/image/bankCard/hsbc.png";
import idfc from "../../src/assets/image/bankCard/idfc.png";
import kotak from "../../src/assets/image/bankCard/kotak.png";
import jio from "../../src/assets/image/bankCard/jio.png";
export default function OfferCard() {
  const offers = [
    {
      id: 1,
      bank: "HDFC Bank",
      img: hdfcicon,
      card: " Classic Credit Card",
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
    {
      id: 2,
      bank: "ICICI Bank",
      img: icici,
      card: "Platinum Card",
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
    {
      id: 3,
      bank: "Paytm",
      card: "Credit/Debit Card",
      discount: "20% Cashback",
        img:paytm,
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
    {
      id: 4,
      bank: "SBI Bank",
      card: "Credit/Debit Card",
      discount: "10% Instant Discount",
        img:sbi,
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
    {
      id: 5,
      bank: "HSBC Bank",
      card: "Credit/Debit Card",
      discount: "10% Instant Discount",
        img:hsbc,
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
    {
      id: 6,
      bank: "IDFC Bank",
      card: "Credit/Debit Card",
      discount: "10% Instant Discount",
        img:idfc,
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
    {
      id: 7,
      bank: "Kotak Bank",
      card: "Credit/Debit Card",
      discount: "10% Instant Discount",
        img:kotak,
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
    {
      id: 8,
      bank: "AU Card",
      card: "Credit/Debit Card",
      discount: "10% Instant Discount",
      img:jio,
      features: [
        "Cashback Benefits",
        "5% Cashback on transactions made through PayZapp and SatyBuy Platforms",
        "2.5% Cashback on all other online spends.",
        "Milestone Rewards",
      ],
    },
  ];
  return (
    <div>
      <div className="offers-page-grid">
        {offers.map((offer) => (
          <div key={offer.id} className="offers-page-card">
            <div className="offers-page-card-header">
              <div className="offers-page-bank-info">
                <div className="offers-page-bank-icon">
                  <img src={offer.img}></img>
                </div>
                <div>
                  <h3>{offer.bank}</h3>
                  <p>{offer.card}</p>
                </div>
              </div>
              <button className="offers-page-apply-btn">Apply Now</button>
            </div>

            <div className="offer-page-badge-contant">
              <button className="offers-page-discount-badge">
                features & benefits
              </button>

              <div className="offers-page-eligibility">
                <span className="offers-page-eligibility-link">
                  Eligibility & Documents
                </span>
              </div>
            </div>

            <div className="offers-page-features">
              <h4>Key Features</h4>
              <ul>
                {offer.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
