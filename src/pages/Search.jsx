import React, { useState } from "react";

import "../../src/styles/style.css";
import Header from "../component/Header"
import filterIcon from "../../src/assets/image/filter.png"
import Usercard from "../component/Usercard";
import leftarrow from "../../src/assets/image/leftarrow (1).png"
import rightarrow from "../../src/assets/image/rightarrow.png"
import FilterModal from "../component/FilterModal";
import Footer from "../component/Footer";


const Search = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const totalPages = 3;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
    <Header></Header>
      <div className="app-container">
        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <header className="header-search">
              <div className="search-box">
                <div className="search-row">
                  <div className="search-field">
                    <label className="search-label">Job Name</label>
                    <input
                      type="text"
                      placeholder="Search"
                      className="search-input"
                    />
                  </div>

                  <div className="search-field">
                    <label className="search-label">Job Type</label>
                    <select className="search-select">
                      <option>Software Developer</option>
                      <option>Designer</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>

                  <div className="search-button-wrapper">
                    <button className="search-button">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      Search
                    </button>
                  </div>
                </div>
              </div>
        </header>

        <main className="main-content">
          <div className="content-header">
            <h1 className="page-title">
              <span className="highlight">375</span> User Available Now
            </h1>
            <button
              className="filter-btn"
              onClick={() => setIsFilterOpen(true)}
            >
               <img src={filterIcon} alt="filter" className="filter-icon" />
              Filter
            </button>
          </div>
          <Usercard></Usercard>

          <div className="pagination">
            <button
              className="pagination-arrow"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
             <img src={leftarrow}></img>
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`pagination-number ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-arrow"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
             <img src={rightarrow}></img>
            </button>
          </div>
        </main>
      </div>
    <Footer></Footer>
    </>
  );
};

export default Search;
