import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import "../../src/styles/style.css"
import ProgressSteps from "../../src/component/StepForm/ProgressSteps";
import FormNavigation from "../../src/component/StepForm/FormNavigation";
import Step1 from "../../src/component/StepForm/Step1"
import Step2 from "../../src/component/StepForm/Step2";
import Step3 from "../../src/component/StepForm/Step3";
import Step4 from "../../src/component/StepForm/Step4";
import Step5 from "../../src/component/StepForm/Step5";
import Step6 from "../../src/component/StepForm/Step6";
import Step7 from "../../src/component/StepForm/Step7";
import Step8 from "../../src/component/StepForm/Step8";
import StepSports from "../../src/component/StepForm/StepSports";
import BusinessStep1 from "../../src/component/StepForm/BusinessStep1";
import BusinessStep2 from "../../src/component/StepForm/BusinessStep2";
import BusinessStep3 from "../../src/component/StepForm/BusinessStep3";
import logo from "../../src/assets/image/connect_logo.png";
import { getCookie, setCookie } from "../utils/auth";
import API_BASE_URL from "../utils/config";
import DynamicAuthImage from "../component/DynamicAuthImage";

const Profileverification = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get phone number from location state or localStorage
  const phoneNumber = location.state?.phoneNumber || localStorage.getItem("phoneNumber") || "";

  // Redirect if profile is already complete
  useEffect(() => {
    const checkProfileStatus = async () => {
      const token = getCookie("authToken");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile/progress`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.isProfileComplete) {
            navigate("/", { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error("Error checking profile status:", error);
      }
    };

    checkProfileStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation schema using Yup with conditional fields
  const validationSchema = Yup.object().shape({
    isBusinessProfile: Yup.boolean(),
    mobileNumber: Yup.string().required("Mobile number is required"),
    
    // Individual fields: required only when isBusinessProfile is false
    fullName: Yup.string().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.string().required("Full name is required").min(2, "Full name must be at least 2 characters"),
      otherwise: () => Yup.string().notRequired(),
    }),
    city: Yup.string().required("City is required"),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"),
    religion: Yup.string().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.string().required("Religion is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    maritalStatus: Yup.string().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.string().required("Status is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    website: Yup.string()
      .nullable()
      .notRequired()
      .test("is-url", "Please enter a valid website URL", function (value) {
        if (!value) return true;
        return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9-_.~!*'();:@&=+$,/?#%]*)?$/.test(value);
      }),
    gender: Yup.string().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.string().required("Gender is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    birthDate: Yup.string().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.string()
        .required("Date of birth is required")
        .test("age-18", "You must be at least 18 years old", function (value) {
          if (!value) return false;
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 18;
        }),
      otherwise: () => Yup.string().notRequired(),
    }),
    language: Yup.array().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.array().min(1, "Please select at least one language").required("Please select at least one language"),
      otherwise: () => Yup.array().notRequired(),
    }),
    habits: Yup.array().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.array().min(1, "Please select at least one habit").required("Please select at least one habit"),
      otherwise: () => Yup.array().notRequired(),
    }),
    interest: Yup.array().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.array().min(1, "Please select at least one interest").required("Please select at least one interest"),
      otherwise: () => Yup.array().notRequired(),
    }),
    skill: Yup.array().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.array().min(1, "Please select at least one skill").required("Please select at least one skill"),
      otherwise: () => Yup.array().notRequired(),
    }),
    sports: Yup.array().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.array().min(1, "Please select at least one sport").required("Please select at least one sport"),
      otherwise: () => Yup.array().notRequired(),
    }),
    industry: Yup.string().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.string().required("Industry is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    company: Yup.string().nullable().notRequired(),
    position: Yup.string().when("isBusinessProfile", {
      is: (val) => !val,
      then: () => Yup.string().required("Position is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    photo: Yup.mixed().nullable().notRequired(),
    
    // Business fields: required only when isBusinessProfile is true
    businessName: Yup.string().when("isBusinessProfile", {
      is: true,
      then: () => Yup.string().required("Business name is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    businessCategory: Yup.string().when("isBusinessProfile", {
      is: true,
      then: () => Yup.string().required("Business category is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    contactPerson: Yup.string().when("isBusinessProfile", {
      is: true,
      then: () => Yup.string().required("Contact person is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    whatsappNumber: Yup.string().when("isBusinessProfile", {
      is: true,
      then: () => Yup.string().required("WhatsApp number is required").matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
      otherwise: () => Yup.string().notRequired(),
    }),
    businessTagline: Yup.string().when("isBusinessProfile", {
      is: true,
      then: () => Yup.string().required("Tagline is required").max(160, "Tagline cannot exceed 160 characters"),
      otherwise: () => Yup.string().notRequired(),
    }),
    businessLogo: Yup.mixed().nullable(),
    businessCoverImage: Yup.mixed().nullable(),
    businessDescription: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      isBusinessProfile: false,
      mobileNumber: phoneNumber || "",
      fullName: "",
      city: "",
      pincode: "",
      religion: "",
      maritalStatus: "",
      email: "",
      gender: "",
      birthDate: "",
      language: [],
      habits: [],
      interest: [],
      skill: [],
      sports: [],
      industry: "",
      company: "",
      position: "",
      photo: null,
      
      // Business fields
      businessName: "",
      businessCategory: "",
      contactPerson: "",
      website: "",
      whatsappNumber: "",
      facebook: "",
      instagram: "",
      linkedIn: "",
      youtube: "",
      twitter: "",
      businessLogo: null,
      businessCoverImage: null,
      businessTagline: "",
      businessDescription: "",
    },
    validationSchema: validationSchema,
    enableReinitialize: false,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setApiError("");
      setSuccess("");
      setLoading(true);
      setSubmitting(true);

      try {
        const token = getCookie("authToken");
        if (!token) {
          throw new Error("Authentication required. Please login again.");
        }

        const formData = new FormData();
        const isBusiness = values.isBusinessProfile;

        if (isBusiness) {
          formData.append("isBusinessProfile", "true");
          formData.append("businessName", values.businessName);
          if (values.city && values.city.trim() !== "" && /^[0-9a-fA-F]{24}$/.test(values.city)) {
            formData.append("city", values.city);
          }
          formData.append("pincode", values.pincode);
          formData.append("businessCategory", values.businessCategory);
          formData.append("contactPerson", values.contactPerson);
          formData.append("email", values.email || "");
          formData.append("website", values.website || "");
          formData.append("whatsappNumber", values.whatsappNumber || "");
          formData.append("facebook", values.facebook || "");
          formData.append("instagram", values.instagram || "");
          formData.append("linkedIn", values.linkedIn || "");
          formData.append("youtube", values.youtube || "");
          formData.append("twitter", values.twitter || "");
          formData.append("businessTagline", values.businessTagline || "");
          formData.append("businessDescription", values.businessDescription || "");

          if (values.businessLogo) {
            if (values.businessLogo instanceof File) {
              formData.append("profileImage", values.businessLogo);
            } else if (typeof values.businessLogo === 'string' && values.businessLogo.startsWith('data:')) {
              const response = await fetch(values.businessLogo);
              const blob = await response.blob();
              formData.append("profileImage", blob, "logo.jpg");
            }
          }
          if (values.businessCoverImage) {
            if (values.businessCoverImage instanceof File) {
              formData.append("coverImage", values.businessCoverImage);
            } else if (typeof values.businessCoverImage === 'string' && values.businessCoverImage.startsWith('data:')) {
              const response = await fetch(values.businessCoverImage);
              const blob = await response.blob();
              formData.append("coverImage", blob, "cover.jpg");
            }
          }
        } else {
          formData.append("fullName", values.fullName);
          if (values.city && values.city.trim() !== "" && /^[0-9a-fA-F]{24}$/.test(values.city)) {
            formData.append("city", values.city);
          }
          formData.append("pincode", values.pincode);
          formData.append("religion", values.religion);
          formData.append("status", values.maritalStatus);
          formData.append("gender", values.gender);
          formData.append("dateOfBirth", values.birthDate || "");
          formData.append("habits", (values.habits || []).join(","));
          formData.append("interests", (values.interest || []).join(","));
          formData.append("skills", (values.skill || []).join(","));
          formData.append("sports", (values.sports || []).join(","));
          formData.append("preferredLanguage", Array.isArray(values.language) ? values.language.join(",") : (values.language || ""));
          formData.append("email", values.email);
          formData.append("industry", values.industry || "");
          formData.append("company", values.company || "");
          formData.append("position", values.position || "");

          if (values.photo) {
            if (typeof values.photo === 'string' && values.photo.startsWith('data:')) {
              const response = await fetch(values.photo);
              const blob = await response.blob();
              formData.append("profileImage", blob, "profile.jpg");
            } else if (values.photo instanceof File) {
              formData.append("profileImage", values.photo);
            }
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to complete profile. Please try again.");
        }

        setCookie("isProfileComplete", "true", 7);
        setSuccess("Profile completed successfully! Redirecting...");

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);

      } catch (err) {
        setApiError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  const totalSteps = formik.values.isBusinessProfile ? 3 : 9;

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/user/profile/progress`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.data) {
          const { lastCompletedStep, profile, isProfileComplete } = data.data;

          if (isProfileComplete) {
            setCookie("isProfileComplete", "true", 7);
            navigate("/", { replace: true });
            return;
          }

          if (profile) {
            if (profile.phoneNumber) {
              localStorage.setItem("phoneNumber", profile.phoneNumber);
            }

            // Immediately set step so the page does not get stuck on Step 1 while lookups resolve
            const currentTotalSteps = profile.isBusinessProfile ? 3 : 9;
            let nextStep;
            if (lastCompletedStep === currentTotalSteps && !isProfileComplete) {
              nextStep = currentTotalSteps;
            } else if (lastCompletedStep >= currentTotalSteps) {
              nextStep = currentTotalSteps;
            } else {
              nextStep = Math.min((lastCompletedStep || 0) + 1, currentTotalSteps);
            }
            setCurrentStep(nextStep);
            setPreviousStep(nextStep);

            let maritalStatus = profile.status || "";
            if (maritalStatus === "Unmarried") {
              maritalStatus = "Single";
            }

            // Populate initial values synchronously
            if (profile.isBusinessProfile) {
              formik.setValues({
                isBusinessProfile: true,
                mobileNumber: profile.phoneNumber || phoneNumber || "",
                businessName: profile.businessName || "",
                city: profile.city || "",
                pincode: profile.pincode || "",
                businessCategory: profile.businessCategory || profile.businessCategoryId || "",
                contactPerson: profile.contactPerson || "",
                website: profile.website || "",
                whatsappNumber: profile.whatsappNumber || "",
                facebook: profile.facebook || "",
                instagram: profile.instagram || "",
                linkedIn: profile.linkedIn || "",
                youtube: profile.youtube || "",
                twitter: profile.twitter || "",
                businessLogo: profile.businessLogo || null,
                businessCoverImage: profile.businessCoverImage || null,
                businessTagline: profile.businessTagline || "",
                businessDescription: profile.businessDescription || "",
                
                fullName: "",
                religion: "",
                maritalStatus: "",
                email: profile.email || "",
                gender: "",
                birthDate: "",
                language: [],
                habits: [],
                interest: [],
                skill: [],
                sports: [],
                industry: "",
                company: "",
                position: "",
                photo: null,
              });
            } else {
              formik.setValues({
                isBusinessProfile: false,
                mobileNumber: profile.phoneNumber || phoneNumber || "",
                fullName: profile.fullName || "",
                city: profile.city || "",
                pincode: profile.pincode || "",
                religion: profile.religion || "",
                maritalStatus: maritalStatus,
                email: profile.email || "",
                gender: profile.gender || "",
                birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
                language: profile.preferredLanguage || [],
                habits: profile.habits || [],
                interest: profile.interests || [],
                skill: profile.skills || [],
                sports: profile.sports || [],
                industry: profile.industry || "",
                company: profile.company || "",
                position: profile.position || "",
                photo: profile.profileImage || null,
                
                businessName: "",
                businessCategory: "",
                contactPerson: "",
                website: "",
                whatsappNumber: "",
                facebook: "",
                instagram: "",
                linkedIn: "",
                youtube: "",
                twitter: "",
                businessLogo: null,
                businessCoverImage: null,
                businessTagline: "",
                businessDescription: "",
              });
            }

            // In the background, resolve names to ID strings for dropdowns
            (async () => {
              let resolvedCityId = "";
              if (profile.city) {
                try {
                  const citiesResponse = await fetch(`${API_BASE_URL}/api/list/city`, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  });

                  if (citiesResponse.ok) {
                    const citiesResult = await citiesResponse.json();
                    if (citiesResult.success && citiesResult.data && citiesResult.data.city) {
                      const cities = citiesResult.data.city;
                      const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.city);
                      if (isObjectId) {
                        resolvedCityId = profile.city;
                      } else {
                        const matchedCity = cities.find(
                          city => city.name && city.name.toLowerCase().trim() === profile.city.toLowerCase().trim()
                        );
                        if (matchedCity) {
                          resolvedCityId = matchedCity._id;
                        }
                      }
                      if (resolvedCityId) {
                        formik.setFieldValue("city", resolvedCityId, false);
                      }
                    }
                  }
                } catch (err) {
                  console.error("Error fetching cities for matching:", err);
                }
              }

              let resolvedPositionId = "";
              if (profile.position && !profile.isBusinessProfile) {
                try {
                  const positionsResponse = await fetch(`${API_BASE_URL}/api/list/positions`, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  });

                  if (positionsResponse.ok) {
                    const positionsResult = await positionsResponse.json();
                    if (positionsResult.success && positionsResult.data && positionsResult.data.positions) {
                      const positions = positionsResult.data.positions;
                      const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.position);
                      if (isObjectId) {
                        resolvedPositionId = profile.position;
                      } else {
                        const matchedPosition = positions.find(
                          pos => pos.name && pos.name.toLowerCase().trim() === profile.position.toLowerCase().trim()
                        );
                        if (matchedPosition) {
                          resolvedPositionId = matchedPosition._id;
                        }
                      }
                      if (resolvedPositionId) {
                        formik.setFieldValue("position", resolvedPositionId, false);
                      }
                    }
                  }
                } catch (err) {
                  console.error("Error fetching positions for matching:", err);
                }
              }

              let resolvedIndustryId = "";
              if (profile.industry && !profile.isBusinessProfile) {
                try {
                  const industriesResponse = await fetch(`${API_BASE_URL}/api/list/industries`, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  });

                  if (industriesResponse.ok) {
                    const industriesResult = await industriesResponse.json();
                    if (industriesResult.success && industriesResult.data && industriesResult.data.industries) {
                      const industries = industriesResult.data.industries;
                      const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.industry);
                      if (isObjectId) {
                        resolvedIndustryId = profile.industry;
                      } else {
                        const matchedIndustry = industries.find(
                          ind => ind.name && ind.name.toLowerCase().trim() === profile.industry.toLowerCase().trim()
                        );
                        if (matchedIndustry) {
                          resolvedIndustryId = matchedIndustry._id;
                        }
                      }
                      if (resolvedIndustryId) {
                        formik.setFieldValue("industry", resolvedIndustryId, false);
                      }
                    }
                  }
                } catch (err) {
                  console.error("Error fetching industries for matching:", err);
                }
              }

              if (profile.company && (resolvedIndustryId || profile.industry) && !profile.isBusinessProfile) {
                try {
                  const companiesUrl = resolvedIndustryId 
                    ? `${API_BASE_URL}/api/list/companies?industryId=${resolvedIndustryId}`
                    : `${API_BASE_URL}/api/list/companies`;
                  
                  const companiesResponse = await fetch(companiesUrl, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  });

                  if (companiesResponse.ok) {
                    const companiesResult = await companiesResponse.json();
                    if (companiesResult.success && companiesResult.data && companiesResult.data.companies) {
                      const companies = companiesResult.data.companies;
                      const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.company);
                      let resolvedCompanyId = "";
                      if (isObjectId) {
                        resolvedCompanyId = profile.company;
                      } else {
                        const matchedCompany = companies.find(
                          comp => comp.name && comp.name.toLowerCase().trim() === profile.company.toLowerCase().trim()
                        );
                        if (matchedCompany) {
                          resolvedCompanyId = matchedCompany._id;
                        }
                      }
                      if (resolvedCompanyId) {
                        formik.setFieldValue("company", resolvedCompanyId, false);
                      }
                    }
                  }
                } catch (err) {
                  console.error("Error fetching companies for matching:", err);
                }
              }
            })();
          }
        }
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    };

    loadSavedProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update formik values when phone number is available
  useEffect(() => {
    if (phoneNumber && !formik.values.mobileNumber) {
      formik.setFieldValue("mobileNumber", phoneNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  const updateData = async (field, value) => {
    if (field.startsWith("_touched_")) {
      const actualField = field.replace("_touched_", "");
      formik.setFieldTouched(actualField, true);
    } else {
      formik.setFieldValue(field, value, false);

      if (value && formik.errors[field]) {
        formik.setFieldError(field, undefined);
      }

      setTimeout(async () => {
        try {
          const updatedValues = { ...formik.values, [field]: value };
          await validationSchema.validateAt(field, updatedValues);
          if (formik.errors[field]) {
            formik.setFieldError(field, undefined);
          }
        } catch (error) {
          if (formik.touched[field]) {
            formik.setFieldError(field, error.message);
          }
        }
      }, 0);
    }
  };

  const getStepDataForSave = (stepNumber, values) => {
    const stepData = {};
    const isBusiness = values.isBusinessProfile;

    if (isBusiness) {
      switch (stepNumber) {
        case 1:
          if (values.businessName) stepData.businessName = values.businessName;
          if (values.businessCategory) stepData.businessCategory = values.businessCategory;
          if (values.businessTagline) stepData.businessTagline = values.businessTagline;
          break;
        case 2:
          if (values.contactPerson) stepData.contactPerson = values.contactPerson;
          if (values.whatsappNumber) stepData.whatsappNumber = values.whatsappNumber;
          if (values.email) stepData.email = values.email;
          if (values.website) stepData.website = values.website;
          if (values.city) stepData.city = values.city;
          if (values.pincode) stepData.pincode = values.pincode;
          break;
        case 3:
          if (values.facebook) stepData.facebook = values.facebook;
          if (values.instagram) stepData.instagram = values.instagram;
          if (values.linkedIn) stepData.linkedIn = values.linkedIn;
          if (values.youtube) stepData.youtube = values.youtube;
          if (values.twitter) stepData.twitter = values.twitter;
          break;
        default:
          break;
      }
    } else {
      switch (stepNumber) {
        case 1:
          if (values.fullName) stepData.fullName = values.fullName;
          if (values.city) stepData.city = values.city;
          if (values.pincode) stepData.pincode = values.pincode;
          if (values.religion) stepData.religion = values.religion;
          if (values.maritalStatus) stepData.status = values.maritalStatus;
          break;
        case 2:
          if (values.email) stepData.email = values.email;
          if (values.gender) stepData.gender = values.gender;
          if (values.birthDate) stepData.dateOfBirth = values.birthDate;
          break;
        case 3:
          if (values.language && Array.isArray(values.language) && values.language.length > 0) {
            stepData.preferredLanguage = values.language;
          }
          break;
        case 4:
          if (values.habits && values.habits.length > 0) {
            stepData.habits = values.habits;
          }
          break;
        case 5:
          if (values.interest && values.interest.length > 0) {
            stepData.interests = values.interest;
          }
          break;
        case 6:
          if (values.skill && values.skill.length > 0) {
            stepData.skills = values.skill;
          }
          break;
        case 7:
          if (values.sports && values.sports.length > 0) {
            stepData.sports = values.sports;
          }
          break;
        case 8:
          if (values.industry) stepData.industry = values.industry;
          if (values.company) stepData.company = values.company;
          if (values.position) stepData.position = values.position;
          break;
        default:
          break;
      }
    }

    return stepData;
  };

  const saveStepData = async (stepNumber) => {
    try {
      const token = getCookie("authToken");
      if (!token) return;

      const stepData = getStepDataForSave(stepNumber, formik.values);
      const formData = new FormData();
      const isBusiness = formik.values.isBusinessProfile;

      Object.keys(stepData).forEach(key => {
        if (stepData[key] !== null && stepData[key] !== undefined) {
          if (key === 'city') {
            if (stepData[key] && stepData[key].trim() !== "" && /^[0-9a-fA-F]{24}$/.test(stepData[key])) {
              formData.append(key, stepData[key]);
            }
          } else if (Array.isArray(stepData[key])) {
            formData.append(key, stepData[key].join(","));
          } else {
            formData.append(key, stepData[key]);
          }
        }
      });

      if (isBusiness) {
        formData.append("isBusinessProfile", "true");
        if (stepNumber === 1) {
          if (formik.values.businessLogo) {
            if (formik.values.businessLogo instanceof File) {
              formData.append("profileImage", formik.values.businessLogo);
            } else if (typeof formik.values.businessLogo === 'string' && formik.values.businessLogo.startsWith('data:')) {
              const response = await fetch(formik.values.businessLogo);
              const blob = await response.blob();
              formData.append("profileImage", blob, "logo.jpg");
            }
          }
          if (formik.values.businessCoverImage) {
            if (formik.values.businessCoverImage instanceof File) {
              formData.append("coverImage", formik.values.businessCoverImage);
            } else if (typeof formik.values.businessCoverImage === 'string' && formik.values.businessCoverImage.startsWith('data:')) {
              const response = await fetch(formik.values.businessCoverImage);
              const blob = await response.blob();
              formData.append("coverImage", blob, "cover.jpg");
            }
          }
        }
      } else {
        if (stepNumber === 9 && formik.values.photo) {
          if (formik.values.photo instanceof File) {
            formData.append("profileImage", formik.values.photo);
          } else if (typeof formik.values.photo === 'string' && formik.values.photo.startsWith('data:')) {
            const response = await fetch(formik.values.photo);
            const blob = await response.blob();
            formData.append("profileImage", blob, "profile.jpg");
          }
        }
      }

      formData.append("stepNumber", stepNumber.toString());

      const response = await fetch(`${API_BASE_URL}/api/user/profile/step`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error saving step:", data.message);
      }
    } catch (error) {
      console.error("Error saving step data:", error);
    }
  };

  const nextStep = async () => {
    const currentStepFields = getStepFields(currentStep);

    currentStepFields.forEach(field => {
      formik.setFieldTouched(field, true);
    });

    let hasErrors = false;
    for (const field of currentStepFields) {
      try {
        await validationSchema.validateAt(field, formik.values);
        if (formik.errors[field]) {
          formik.setFieldError(field, undefined);
        }
      } catch (error) {
        hasErrors = true;
        formik.setFieldError(field, error.message);
      }
    }

    if (!hasErrors) {
      setLoading(true);
      try {
        if (currentStep < totalSteps) {
          await saveStepData(currentStep);
          setCurrentStep(currentStep + 1);
        } else if (currentStep === totalSteps) {
          await saveStepData(currentStep);
          handleSubmit();
        }
      } catch (error) {
        console.error("Error in nextStep:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const [previousStep, setPreviousStep] = useState(1);

  // Reload saved data when navigating backward
  useEffect(() => {
    if (currentStep < previousStep && currentStep > 0) {
      const reloadStepData = async () => {
        try {
          const token = getCookie("authToken");
          if (!token) return;

          const response = await fetch(`${API_BASE_URL}/api/user/profile/progress`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) return;

          const data = await response.json();

          if (data.success && data.data && data.data.profile) {
            const profile = data.data.profile;
            const currentValues = formik.values;

            let cityId = currentValues.city || "";
            if (profile.city) {
              try {
                const citiesResponse = await fetch(`${API_BASE_URL}/api/list/city`, {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                if (citiesResponse.ok) {
                  const citiesResult = await citiesResponse.json();
                  if (citiesResult.success && citiesResult.data && citiesResult.data.city) {
                    const cities = citiesResult.data.city;
                    const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.city);
                    if (isObjectId) {
                      cityId = profile.city;
                    } else {
                      const matchedCity = cities.find(
                        city => city.name && city.name.toLowerCase().trim() === profile.city.toLowerCase().trim()
                      );
                      if (matchedCity) {
                        cityId = matchedCity._id;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching cities for matching:", err);
              }
            }

            let positionId = currentValues.position || "";
            if (profile.position) {
              try {
                const positionsResponse = await fetch(`${API_BASE_URL}/api/list/positions`, {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                if (positionsResponse.ok) {
                  const positionsResult = await positionsResponse.json();
                  if (positionsResult.success && positionsResult.data && positionsResult.data.positions) {
                    const positions = positionsResult.data.positions;
                    const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.position);
                    if (isObjectId) {
                      positionId = profile.position;
                    } else {
                      const matchedPosition = positions.find(
                        pos => pos.name && pos.name.toLowerCase().trim() === profile.position.toLowerCase().trim()
                      );
                      if (matchedPosition) {
                        positionId = matchedPosition._id;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching positions for matching:", err);
              }
            }

            let industryId = currentValues.industry || "";
            if (profile.industry) {
              try {
                const industriesResponse = await fetch(`${API_BASE_URL}/api/list/industries`, {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                if (industriesResponse.ok) {
                  const industriesResult = await industriesResponse.json();
                  if (industriesResult.success && industriesResult.data && industriesResult.data.industries) {
                    const industries = industriesResult.data.industries;
                    const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.industry);
                    if (isObjectId) {
                      industryId = profile.industry;
                    } else {
                      const matchedIndustry = industries.find(
                        ind => ind.name && ind.name.toLowerCase().trim() === profile.industry.toLowerCase().trim()
                      );
                      if (matchedIndustry) {
                        industryId = matchedIndustry._id;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching industries for matching:", err);
              }
            }

            let companyId = currentValues.company || "";
            if (profile.company && (industryId || profile.industry)) {
              try {
                const companiesUrl = industryId 
                  ? `${API_BASE_URL}/api/list/companies?industryId=${industryId}`
                  : `${API_BASE_URL}/api/list/companies`;

                const companiesResponse = await fetch(companiesUrl, {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                if (companiesResponse.ok) {
                  const companiesResult = await companiesResponse.json();
                  if (companiesResult.success && companiesResult.data && companiesResult.data.companies) {
                    const companies = companiesResult.data.companies;
                    const isObjectId = /^[0-9a-fA-F]{24}$/.test(profile.company);
                    if (isObjectId) {
                      companyId = profile.company;
                    } else {
                      const matchedCompany = companies.find(
                        comp => comp.name && comp.name.toLowerCase().trim() === profile.company.toLowerCase().trim()
                      );
                      if (matchedCompany) {
                        companyId = matchedCompany._id;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching companies for matching:", err);
              }
            }

            const updates = profile.isBusinessProfile ? {
              isBusinessProfile: true,
              businessName: profile.businessName || currentValues.businessName || "",
              city: cityId,
              pincode: profile.pincode || currentValues.pincode || "",
              businessCategory: profile.businessCategory || profile.businessCategoryId || currentValues.businessCategory || "",
              contactPerson: profile.contactPerson || currentValues.contactPerson || "",
              email: profile.email || currentValues.email || "",
              website: profile.website || currentValues.website || "",
              whatsappNumber: profile.whatsappNumber || currentValues.whatsappNumber || "",
              facebook: profile.facebook || currentValues.facebook || "",
              instagram: profile.instagram || currentValues.instagram || "",
              linkedIn: profile.linkedIn || currentValues.linkedIn || "",
              youtube: profile.youtube || currentValues.youtube || "",
              twitter: profile.twitter || currentValues.twitter || "",
              businessLogo: profile.businessLogo || currentValues.businessLogo || null,
              businessCoverImage: profile.businessCoverImage || currentValues.businessCoverImage || null,
              businessTagline: profile.businessTagline || currentValues.businessTagline || "",
              businessDescription: profile.businessDescription || currentValues.businessDescription || "",
              mobileNumber: phoneNumber || currentValues.mobileNumber || "",
            } : {
              isBusinessProfile: false,
              fullName: profile.fullName || currentValues.fullName || "",
              city: cityId,
              pincode: profile.pincode || currentValues.pincode || "",
              religion: profile.religion || currentValues.religion || "",
              maritalStatus: profile.status || currentValues.maritalStatus || "",
              email: profile.email || currentValues.email || "",
              gender: profile.gender || currentValues.gender || "",
              birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : (currentValues.birthDate || ""),
              language: profile.preferredLanguage || currentValues.language || "",
              habits: (profile.habits && profile.habits.length > 0) ? profile.habits : (currentValues.habits || []),
              interest: (profile.interests && profile.interests.length > 0) ? profile.interests : (currentValues.interest || []),
              skill: (profile.skills && profile.skills.length > 0) ? profile.skills : (currentValues.skill || []),
              sports: (profile.sports && profile.sports.length > 0) ? profile.sports : (currentValues.sports || []),
              industry: industryId || "",
              company: companyId || "",
              position: positionId || "",
              photo: profile.profileImage || currentValues.photo || null,
              mobileNumber: phoneNumber || currentValues.mobileNumber || "",
            };

            formik.setValues(prev => ({ ...prev, ...updates }));
          }
        } catch (error) {
          console.error("Error reloading step data:", error);
        }
      };

      reloadStepData();
    }

    setPreviousStep(currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const prevStep = async () => {
    if (currentStep > 1) {
      await saveStepData(currentStep);
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step) => {
    const isBusiness = formik.values.isBusinessProfile;
    if (isBusiness) {
      switch (step) {
        case 1:
          return ['businessName', 'businessCategory', 'businessTagline'];
        case 2:
          return ['contactPerson', 'whatsappNumber', 'email', 'city', 'pincode'];
        case 3:
          return [];
        default:
          return [];
      }
    } else {
      switch (step) {
        case 1:
          return ['fullName', 'city', 'pincode', 'religion', 'maritalStatus'];
        case 2:
          return ['email', 'gender', 'birthDate'];
        case 3:
          return ['language'];
        case 4:
          return ['habits'];
        case 5:
          return ['interest'];
        case 6:
          return ['skill'];
        case 7:
          return ['sports'];
        case 8:
          return ['industry', 'company', 'position'];
        case 9:
          return ['photo'];
        default:
          return [];
      }
    }
  };

  const handleSubmit = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      for (let step = 1; step <= totalSteps; step++) {
        const stepFields = getStepFields(step);
        const stepHasError = stepFields.some(field => errors[field]);
        if (stepHasError) {
          stepFields.forEach(field => {
            formik.setFieldTouched(field, true, false);
          });
          setCurrentStep(step);
          setApiError(`Please correct the errors in Step ${step} before submitting.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      setApiError("Please review and complete all required fields.");
    } else {
      formik.handleSubmit();
    }
  };

  const renderStep = () => {
    const isBusiness = formik.values.isBusinessProfile;
    if (isBusiness) {
      switch (currentStep) {
        case 1:
          return <BusinessStep1 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} phoneNumber={phoneNumber} />;
        case 2:
          return <BusinessStep2 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 3:
          return <BusinessStep3 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 1:
          return <Step1 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} phoneNumber={phoneNumber} />;
        case 2:
          return <Step2 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 3:
          return <Step3 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 4:
          return <Step4 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 5:
          return <Step5 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 6:
          return <Step6 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 7:
          return <StepSports data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 8:
          return <Step8 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        case 9:
          return <Step7 data={formik.values} updateData={updateData} errors={formik.errors} touched={formik.touched} />;
        default:
          return null;
      }
    }
  };

  return (
    <div className="verification-wrapper">
      <DynamicAuthImage />

      <div className="right-side">
        <div className="container">
          <div className="form-card">
            <div className="form-header">
              <img src={logo} className="logo-image" alt="Connect Logo"></img>
              <ProgressSteps
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            </div>

            <div className="form-content">
              {renderStep()}

              {apiError && (
                <div className="message-error">
                  {apiError}
                </div>
              )}

              {success && (
                <div className="message-success">
                  {success}
                </div>
              )}
            </div>

            <FormNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={nextStep}
              onPrevious={prevStep}
              onSubmit={handleSubmit}
              loading={loading || formik.isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profileverification;
