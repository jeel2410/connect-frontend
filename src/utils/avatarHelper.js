import male_20_30 from "../assets/image/male_20_30.png";
import male_30_45 from "../assets/image/male_30_45.png";
import male_45_60 from "../assets/image/male_45_60.png";
import male_60_plus from "../assets/image/male_60_plus.png";
import female_20_30 from "../assets/image/female_20_30.png";
import female_30_45 from "../assets/image/female_30_45.png";
import female_45_60 from "../assets/image/female_45_60.png";
import female_60_plus from "../assets/image/female_60_plus.png";
import maleDefault from "../assets/image/maleProfile.png";
import femaleDefault from "../assets/image/userProfile.png";
import API_BASE_URL from "./config";

// Helper function to calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Utility function to get age-appropriate default avatar based on gender and age/dob
export const getAvatar = (gender, ageOrDob) => {
  const g = (gender || "").toLowerCase();
  
  let age = null;
  if (typeof ageOrDob === 'number') {
    age = ageOrDob;
  } else if (typeof ageOrDob === 'string' && ageOrDob.trim() !== '') {
    if (!isNaN(ageOrDob)) {
      age = parseInt(ageOrDob, 10);
    } else {
      age = calculateAge(ageOrDob);
    }
  }

  // Fallback default avatar if age is not available
  if (age === null || isNaN(age)) {
    return g === "male" ? maleDefault : femaleDefault;
  }

  if (g === "male") {
    if (age <= 30) return male_20_30;
    if (age <= 45) return male_30_45;
    if (age <= 60) return male_45_60;
    return male_60_plus;
  } else {
    // Female / default
    if (age <= 30) return female_20_30;
    if (age <= 45) return female_30_45;
    if (age <= 60) return female_45_60;
    return female_60_plus;
  }
};

// Resolve local upload relative paths to fully-qualified API server URLs
export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = url.startsWith("/") ? url : "/" + url;
  return `${base}${path}`;
};
