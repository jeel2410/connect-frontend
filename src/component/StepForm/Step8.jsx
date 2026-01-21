import React, { useState, useEffect } from 'react';
import "../../styles/style.css"
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const Step8 = ({ data, updateData, errors, touched }) => {
  const [industries, setIndustries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [industriesError, setIndustriesError] = useState("");
  const [companiesError, setCompaniesError] = useState("");
  const selectedIndustry = data.industry || '';
  const selectedCompany = data.company || '';

  // Fetch industries from API
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoadingIndustries(true);
        setIndustriesError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/industries`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch industries");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.industries) {
          setIndustries(result.data.industries);
        } else {
          setIndustries([]);
        }
      } catch (err) {
        console.error("Error fetching industries:", err);
        setIndustriesError("Failed to load industries");
        setIndustries([]);
      } finally {
        setLoadingIndustries(false);
      }
    };

    fetchIndustries();
  }, []);

  // Fetch companies when industry is selected
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!selectedIndustry) {
        setCompanies([]);
        return;
      }

      try {
        setLoadingCompanies(true);
        setCompaniesError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/companies?industryId=${selectedIndustry}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.companies) {
          setCompanies(result.data.companies);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompaniesError("Failed to load companies");
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [selectedIndustry]);

  const selectIndustry = (industryId) => {
    updateData('industry', industryId); // Store ID
    // Clear company when industry changes
    updateData('company', '');
    updateData('_touched_industry', true);
  };

  const selectCompany = (companyId) => {
    updateData('company', companyId); // Store ID
    updateData('_touched_company', true);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">Select Your Industry & Company</h2> 
      <p className="step-description">Choose your industry and company</p> 
       
      {/* Industry Selection */}
      <div className="form-group">
        <label>Industry <span className="required">*</span></label>
        {loadingIndustries ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            Loading industries...
          </div>
        ) : industriesError ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
            {industriesError}
          </div>
        ) : industries.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No industries available
          </div>
        ) : (
          <div className="industry-container">
            {industries.map((industry) => (
              <button
                key={industry._id}
                type="button"
                className={`industry-option ${selectedIndustry === industry._id ? 'selected' : ''}`}
                onClick={() => selectIndustry(industry._id)}
              >
                {industry.name}
              </button>
            ))}
          </div>
        )}
        {touched?.industry && errors?.industry && (
          <div className="field-error-message">{errors.industry}</div>
        )}
      </div>

      {/* Company Selection - Only show when industry is selected */}
      {selectedIndustry && (
        <div className="form-group">
          <label>Company</label>
          {loadingCompanies ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading companies...
            </div>
          ) : companiesError ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
              {companiesError}
            </div>
          ) : companies.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No companies available for this industry
            </div>
          ) : (
            <div className="industry-container">
              {companies.map((company) => (
                <button
                  key={company._id}
                  type="button"
                  className={`industry-option ${selectedCompany === company._id ? 'selected' : ''}`}
                  onClick={() => selectCompany(company._id)}
                >
                  {company.name}
                </button>
              ))}
            </div>
          )}
          {touched?.company && errors?.company && (
            <div className="field-error-message">{errors.company}</div>
          )}
        </div>
      )}
    </div> 
  ); 
};

export default Step8;
