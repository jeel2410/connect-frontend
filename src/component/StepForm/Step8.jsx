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

        if (!response.ok) throw new Error("Failed to fetch industries");

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

        if (!response.ok) throw new Error("Failed to fetch companies");

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
    updateData('industry', industryId);
    updateData('company', '');
    updateData('_touched_industry', true);
  };

  const selectCompany = (companyId) => {
    updateData('company', companyId);
    updateData('_touched_company', true);
  };

  return (
    <div className="step-content active">
      <h2 className="step-title">Select your Industry and Employer</h2>
      <p className="step-description">Specify your industry and current workplace.</p>

      <div className="step8-layout">
        {/* Left panel: Industries */}
        <div className="step8-panel">
          <div className="step8-panel-header">
            <span className="step8-panel-label">Industry <span className="required">*</span></span>
          </div>

          {loadingIndustries ? (
            <div className="step8-state-msg">Loading industries...</div>
          ) : industriesError ? (
            <div className="step8-state-msg" style={{ color: "#dc2626" }}>{industriesError}</div>
          ) : industries.length === 0 ? (
            <div className="step8-state-msg">No industries available</div>
          ) : (
            <div className="step8-panel-list">
              {industries.map((industry) => (
                <button
                  key={industry._id}
                  type="button"
                  className={`industry-option ${selectedIndustry === industry._id ? 'selected' : ''}`}
                  onClick={() => selectIndustry(industry._id)}
                >
                  <span>{industry.name}</span>
                  {selectedIndustry === industry._id && (
                    <span className="step8-arrow">›</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {touched?.industry && errors?.industry && (
            <div className="field-error-message">{errors.industry}</div>
          )}
        </div>

        {/* Right panel: Companies */}
        <div className="step8-panel">
          <div className="step8-panel-header">
            <span className="step8-panel-label">Company</span>
          </div>

          {!selectedIndustry ? (
            <div className="step8-empty-panel">
              <span>← Select an industry first</span>
            </div>
          ) : loadingCompanies ? (
            <div className="step8-state-msg">Loading companies...</div>
          ) : companiesError ? (
            <div className="step8-state-msg" style={{ color: "#dc2626" }}>{companiesError}</div>
          ) : companies.length === 0 ? (
            <div className="step8-state-msg">No companies for this industry</div>
          ) : (
            <div className="step8-panel-list">
              {companies.map((company) => (
                <button
                  key={company._id}
                  type="button"
                  className={`industry-option ${selectedCompany === company._id ? 'selected' : ''}`}
                  onClick={() => selectCompany(company._id)}
                >
                  <span>{company.name}</span>
                </button>
              ))}
            </div>
          )}

          {touched?.company && errors?.company && (
            <div className="field-error-message">{errors.company}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step8;
