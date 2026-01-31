import React, { useState, useEffect } from "react";
import "../../styles/style.css";
import mobileIcon from "../../assets/image/mobile.png";
import fullnameIcon from "../../assets/image/firstname.png"
import cityIcon from "../../assets/image/city.png"
import religionIcon from "../../assets/image/religion.png"
import statusIcon from "../../assets/image/status.png"
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const Step1 = ({ data, updateData, errors, touched, phoneNumber }) => {
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citiesError, setCitiesError] = useState("");

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        setCitiesError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/city`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.city) {
          setCities(result.data.city);
        } else {
          setCities([]);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCitiesError("Failed to load cities");
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);
  return (
    <div className="step-content active">
      <h2 className="step-title">About You</h2>
      <p className="step-description">Enter your credentials to continue</p>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={mobileIcon} alt="Mobile"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Mobile Number</label>
            <input
              type="text"
              className={`form-input ${touched?.mobileNumber && errors?.mobileNumber ? "input-error" : ""}`}
              value={phoneNumber || data.mobileNumber || ""}
              disabled={true}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon} alt="Full Name"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={data.fullName || ""}
              onChange={(e) => updateData("fullName", e.target.value)}
              onBlur={() => updateData("_touched_fullName", true)}
              className={`form-input ${touched?.fullName && errors?.fullName ? "input-error" : ""}`}
            />
            {touched?.fullName && errors?.fullName && (
              <div className="field-error-message">{errors.fullName}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={cityIcon} alt="City"></img>
          </div>
          <div className="input-content">
            <label className="input-label">City</label>
            <select
              value={data.city || ""}
              onChange={(e) => updateData("city", e.target.value)}
              onBlur={() => updateData("_touched_city", true)}
              className={touched?.city && errors?.city ? "input-error" : ""}
              disabled={loadingCities}
            >
              <option value="">{loadingCities ? "Loading cities..." : "Select City"}</option>
              {cities.map((city) => (
                <option key={city._id || city.name} value={city._id}>
                  {city.name.charAt(0).toUpperCase() + city.name.slice(1)}
                </option>
              ))}
            </select>
            {citiesError && (
              <div className="field-error-message" style={{ color: "#666", fontSize: "12px" }}>
                {citiesError}
              </div>
            )}
            {touched?.city && errors?.city && (
              <div className="field-error-message">{errors.city}</div>
            )}
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={religionIcon} alt="Religion"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Select Religion</label>
            <select
              value={data.religion || ""}
              onChange={(e) => updateData("religion", e.target.value)}
              onBlur={() => updateData("_touched_religion", true)}
              className={touched?.religion && errors?.religion ? "input-error" : ""}
            >
              <option value="">Select Religion</option>
             
              <option value="hindu">Hindu</option>
               <option value="Muslim">Muslim</option>
              <option value="christian">Christian</option>
               <option value="christianity">Christianity</option>
               <option value="Sikh">Sikh</option>
                <option value="Other">Other</option>
                
            </select>
            {touched?.religion && errors?.religion && (
              <div className="field-error-message">{errors.religion}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={statusIcon} alt="Status"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Select Status</label>
            <select
              value={data.maritalStatus || ""}
              onChange={(e) => updateData("maritalStatus", e.target.value)}
              onBlur={() => updateData("_touched_maritalStatus", true)}
              className={touched?.maritalStatus && errors?.maritalStatus ? "input-error" : ""}
            >
              <option value="">Select Status</option>
              <option value="Married">Married</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Divorced">Divorced</option>
            </select>
            {touched?.maritalStatus && errors?.maritalStatus && (
              <div className="field-error-message">{errors.maritalStatus}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
