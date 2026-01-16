import API_BASE_URL from "./config";
import { getCookie } from "./auth";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getCookie("authToken");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Helper function to get auth headers for FormData (no Content-Type header)
const getAuthHeadersFormData = () => {
  const token = getCookie("authToken");
  return {
    "Authorization": `Bearer ${token}`,
  };
};

// Users API
export const getUsers = async (page = 1, limit = 10, search = "") => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/users?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Skills API
export const getSkills = async (page = 1, limit = 10, search = "", isActive = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (isActive !== null) {
      queryParams.append("isActive", isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/skills?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch skills");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};

export const createSkill = async (skillData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/skills`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create skill");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

export const updateSkill = async (skillId, skillData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/skills/${skillId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update skill");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
};

export const deleteSkill = async (skillId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/skills/${skillId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete skill");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
};

// Habits API
export const getHabits = async (page = 1, limit = 10, search = "", isActive = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (isActive !== null) {
      queryParams.append("isActive", isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/habits?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Habits API endpoint not found. Please ensure the backend endpoint /api/admin/habits is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to fetch habits: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to fetch habits");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching habits:", error);
    throw error;
  }
};

export const createHabit = async (habitData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/habits`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Habits API endpoint not found. Please ensure the backend endpoint /api/admin/habits is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to create habit: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to create habit");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
};

export const updateHabit = async (habitId, habitData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/habits/${habitId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Habits API endpoint not found. Please ensure the backend endpoint /api/admin/habits/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to update habit: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to update habit");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
};

export const deleteHabit = async (habitId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/habits/${habitId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Habits API endpoint not found. Please ensure the backend endpoint /api/admin/habits/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to delete habit: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to delete habit");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
};

// Companies API
export const getCompanies = async (page = 1, limit = 10, search = "", isActive = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (isActive !== null) {
      queryParams.append("isActive", isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/companies?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Companies API endpoint not found. Please ensure the backend endpoint /api/admin/companies is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to fetch companies: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to fetch companies");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

export const createCompany = async (companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/companies`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Companies API endpoint not found. Please ensure the backend endpoint /api/admin/companies is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to create company: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to create company");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};

export const updateCompany = async (companyId, companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/companies/${companyId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Companies API endpoint not found. Please ensure the backend endpoint /api/admin/companies/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to update company: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to update company");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
};

export const deleteCompany = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/companies/${companyId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Companies API endpoint not found. Please ensure the backend endpoint /api/admin/companies/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to delete company: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to delete company");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};

// Industries API
export const getIndustries = async (page = 1, limit = 10, search = "", isActive = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (isActive !== null) {
      queryParams.append("isActive", isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/industries?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Industries API endpoint not found. Please ensure the backend endpoint /api/admin/industries is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to fetch industries: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to fetch industries");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching industries:", error);
    throw error;
  }
};

export const createIndustry = async (industryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/industries`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(industryData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Industries API endpoint not found. Please ensure the backend endpoint /api/admin/industries is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to create industry: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to create industry");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating industry:", error);
    throw error;
  }
};

export const updateIndustry = async (industryId, industryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/industries/${industryId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(industryData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Industries API endpoint not found. Please ensure the backend endpoint /api/admin/industries/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to update industry: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to update industry");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating industry:", error);
    throw error;
  }
};

export const deleteIndustry = async (industryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/industries/${industryId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Industries API endpoint not found. Please ensure the backend endpoint /api/admin/industries/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to delete industry: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to delete industry");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting industry:", error);
    throw error;
  }
};

// Interests API
export const getInterests = async (page = 1, limit = 10, search = "", isActive = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (isActive !== null) {
      queryParams.append("isActive", isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/interests?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch interests");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching interests:", error);
    throw error;
  }
};

export const createInterest = async (interestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/interests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(interestData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create interest");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating interest:", error);
    throw error;
  }
};

export const updateInterest = async (interestId, interestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/interests/${interestId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(interestData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update interest");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating interest:", error);
    throw error;
  }
};

export const deleteInterest = async (interestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/interests/${interestId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete interest");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting interest:", error);
    throw error;
  }
};

// Cities API
export const getCities = async (page = 1, limit = 10, search = "", isActive = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (isActive !== null) {
      queryParams.append("isActive", isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/cities?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch cities");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
};

export const createCity = async (cityData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/cities`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(cityData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create city");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating city:", error);
    throw error;
  }
};

export const updateCity = async (cityId, cityData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/cities/${cityId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(cityData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update city");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating city:", error);
    throw error;
  }
};

export const deleteCity = async (cityId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/cities/${cityId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete city");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting city:", error);
    throw error;
  }
};

// Cards API
export const getCards = async (page = 1, limit = 10, search = "", isActive = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (isActive !== null) {
      queryParams.append("isActive", isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/cards?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Cards API endpoint not found. Please ensure the backend endpoint /api/admin/cards is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to fetch cards: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to fetch cards");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
};

export const createCard = async (cardData) => {
  try {
    const formData = new FormData();
    formData.append("name", cardData.name);
    formData.append("description", cardData.description || "");
    formData.append("url", cardData.url || "");
    
    // Append features array
    if (cardData.features && Array.isArray(cardData.features)) {
      cardData.features.forEach((feature) => {
        formData.append("features[]", feature);
      });
    }
    
    // Append logo image if it's a File
    if (cardData.logo_image instanceof File) {
      formData.append("logo_image", cardData.logo_image);
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/cards`, {
      method: "POST",
      headers: getAuthHeadersFormData(),
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Cards API endpoint not found. Please ensure the backend endpoint /api/admin/cards is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to create card: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to create card");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating card:", error);
    throw error;
  }
};

export const updateCard = async (cardId, cardData) => {
  try {
    const formData = new FormData();
    formData.append("name", cardData.name);
    formData.append("description", cardData.description || "");
    formData.append("url", cardData.url || "");
    
    // Append features array
    if (cardData.features && Array.isArray(cardData.features)) {
      cardData.features.forEach((feature) => {
        formData.append("features[]", feature);
      });
    }
    
    // Append logo image if it's a File (only if it's a new file)
    if (cardData.logo_image instanceof File) {
      formData.append("logo_image", cardData.logo_image);
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/cards/${cardId}`, {
      method: "PUT",
      headers: getAuthHeadersFormData(),
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Cards API endpoint not found. Please ensure the backend endpoint /api/admin/cards/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to update card: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to update card");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

export const deleteCard = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/cards/${cardId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Cards API endpoint not found. Please ensure the backend endpoint /api/admin/cards/:id is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to delete card: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to delete card");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};

// Broadcast Notification API
export const broadcastNotification = async (notificationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      if (response.status === 404) {
        throw new Error("Broadcast notification API endpoint not found. Please ensure the backend endpoint /api/admin/notifications/broadcast is implemented.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Failed to send broadcast notification: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || "Failed to send broadcast notification");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending broadcast notification:", error);
    throw error;
  }
};
