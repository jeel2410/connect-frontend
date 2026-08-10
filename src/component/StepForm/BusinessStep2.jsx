import React, { useState, useEffect } from "react";
import "../../styles/style.css";
import mobileIcon from "../../assets/image/mobile.png";
import fullnameIcon from "../../assets/image/firstname.png";
import cityIcon from "../../assets/image/city.png";
import locationIcon from "../../assets/image/location.png";
import statusIcon from "../../assets/image/status.png";
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const BusinessStep2 = ({ data, updateData, errors, touched, phoneNumber }) => {
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citiesError, setCitiesError] = useState("");

  // Pre-fill WhatsApp number with verified mobile if empty
  useEffect(() => {
    if (phoneNumber && !data.whatsappNumber) {
      updateData("whatsappNumber", phoneNumber);
    }
  }, [phoneNumber, data.whatsappNumber, updateData]);

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
      <h2 className="step-title">How can people reach you?</h2>
      <p className="step-description">Provide your contact details so customers and partners can easily connect with your business.</p>

      {/* Contact Person */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={statusIcon} alt="Contact Person"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={data.contactPerson || ""}
              onChange={(e) => updateData("contactPerson", e.target.value)}
              onBlur={() => updateData("_touched_contactPerson", true)}
              className={`form-input ${touched?.contactPerson && errors?.contactPerson ? "input-error" : ""}`}
              placeholder="Enter contact person name"
            />
            {touched?.contactPerson && errors?.contactPerson && (
              <div className="field-error-message">{errors.contactPerson}</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Number */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={mobileIcon} alt="Mobile"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Mobile Number</label>
            <input
              type="text"
              className="form-input"
              value={phoneNumber || data.mobileNumber || ""}
              disabled={true}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Number */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={mobileIcon} alt="WhatsApp"></img>
          </div>
          <div className="input-content">
            <label className="input-label">WhatsApp Number</label>
            <input
              type="text"
              name="whatsappNumber"
              value={data.whatsappNumber || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                updateData("whatsappNumber", value);
              }}
              onBlur={() => updateData("_touched_whatsappNumber", true)}
              className={`form-input ${touched?.whatsappNumber && errors?.whatsappNumber ? "input-error" : ""}`}
              placeholder="Enter WhatsApp number"
            />
            {touched?.whatsappNumber && errors?.whatsappNumber && (
              <div className="field-error-message">{errors.whatsappNumber}</div>
            )}
          </div>
        </div>
      </div>

      {/* Email Address */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon} alt="Email" style={{ opacity: 0.7 }}></img>
          </div>
          <div className="input-content">
            <label className="input-label">Business Email Address</label>
            <input
              type="email"
              name="email"
              value={data.email || ""}
              onChange={(e) => updateData("email", e.target.value)}
              onBlur={() => updateData("_touched_email", true)}
              className={`form-input ${touched?.email && errors?.email ? "input-error" : ""}`}
              placeholder="business@example.com"
            />
            {touched?.email && errors?.email && (
              <div className="field-error-message">{errors.email}</div>
            )}
          </div>
        </div>
      </div>

      {/* Website */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={fullnameIcon} alt="Website"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Website URL</label>
            <input
              type="text"
              name="website"
              value={data.website || ""}
              onChange={(e) => updateData("website", e.target.value)}
              onBlur={() => updateData("_touched_website", true)}
              className={`form-input ${touched?.website && errors?.website ? "input-error" : ""}`}
              placeholder="https://example.com"
            />
            {touched?.website && errors?.website && (
              <div className="field-error-message">{errors.website}</div>
            )}
          </div>
        </div>
      </div>

      {/* City */}
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

      {/* Pincode */}
      <div className="form-group">
        <div className="input-wrapper">
          <div className="input-icon">
            <img src={locationIcon} alt="Pincode"></img>
          </div>
          <div className="input-content">
            <label className="input-label">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={data.pincode || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                updateData("pincode", value);
              }}
              onBlur={() => updateData("_touched_pincode", true)}
              className={`form-input ${touched?.pincode && errors?.pincode ? "input-error" : ""}`}
              placeholder="Enter Pincode"
            />
            {touched?.pincode && errors?.pincode && (
              <div className="field-error-message">{errors.pincode}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStep2;
