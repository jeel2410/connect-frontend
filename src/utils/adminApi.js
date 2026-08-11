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
export const getUsers = async (page = 1, limit = 10, search = "", city = "", industry = "", interest = "", religion = "", isBusiness = "") => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (city) {
      queryParams.append("city", city);
    }
    if (industry) {
      queryParams.append("industry", industry);
    }
    if (interest) {
      queryParams.append("interest", interest);
    }
    if (religion) {
      queryParams.append("religion", religion);
    }
    if (isBusiness) {
      queryParams.append("isBusiness", isBusiness);
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

export const toggleUserStatus = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
      method: "PUT",
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
      throw new Error(errorData.message || "Failed to toggle user status");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
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
      throw new Error(errorData.message || "Failed to delete user");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Shared Posts API
export const getPosts = async (page = 1, limit = 15, search = "") => {
  try {
    const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) queryParams.append("search", search);

    const response = await fetch(`${API_BASE_URL}/api/admin/posts?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch posts");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const togglePostVisibility = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/toggle-visibility`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to toggle post visibility");
    }
    return await response.json();
  } catch (error) {
    console.error("Error toggling post visibility:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete post");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting post:", error);
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

// Sports API
export const getSports = async (page = 1, limit = 10, search = "", isActive = null) => {
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

    const response = await fetch(`${API_BASE_URL}/api/admin/sports?${queryParams.toString()}`, {
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
      throw new Error(errorData.message || "Failed to fetch sports");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sports:", error);
    throw error;
  }
};

export const createSport = async (sportData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/sports`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(sportData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create sport");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating sport:", error);
    throw error;
  }
};

export const updateSport = async (sportId, sportData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/sports/${sportId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(sportData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update sport");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating sport:", error);
    throw error;
  }
};

export const deleteSport = async (sportId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/sports/${sportId}`, {
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
      throw new Error(errorData.message || "Failed to delete sport");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting sport:", error);
    throw error;
  }
};

// Positions API
export const getPositions = async (page = 1, limit = 10, search = "", isActive = null) => {
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

    const response = await fetch(`${API_BASE_URL}/api/admin/positions?${queryParams.toString()}`, {
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
      throw new Error(errorData.message || "Failed to fetch positions");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching positions:", error);
    throw error;
  }
};

export const createPosition = async (positionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/positions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(positionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create position");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating position:", error);
    throw error;
  }
};

export const updatePosition = async (positionId, positionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/positions/${positionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(positionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      if (response.status === 403) {
        throw new Error("Access denied: Admin only");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update position");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating position:", error);
    throw error;
  }
};

export const deletePosition = async (positionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/positions/${positionId}`, {
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
      throw new Error(errorData.message || "Failed to delete position");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting position:", error);
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
    formData.append("targetAgeMin", cardData.targetAgeMin !== undefined && cardData.targetAgeMin !== null ? cardData.targetAgeMin : "");
    formData.append("targetAgeMax", cardData.targetAgeMax !== undefined && cardData.targetAgeMax !== null ? cardData.targetAgeMax : "");
    
    // Append features array
    if (cardData.features && Array.isArray(cardData.features)) {
      cardData.features.forEach((feature) => {
        formData.append("features[]", feature);
      });
    }
    
    // Append eligibles array
    if (cardData.eligibles && Array.isArray(cardData.eligibles)) {
      cardData.eligibles.forEach((eligible) => {
        formData.append("eligibles[]", eligible);
      });
    }

    // Append targetCities array
    if (cardData.targetCities && Array.isArray(cardData.targetCities)) {
      cardData.targetCities.forEach((city) => {
        formData.append("targetCities[]", city);
      });
    }

    // Append targetPositions array
    if (cardData.targetPositions && Array.isArray(cardData.targetPositions)) {
      cardData.targetPositions.forEach((position) => {
        formData.append("targetPositions[]", position);
      });
    }
    
    // Append logo image if it's a File
    if (cardData.logo_image instanceof File) {
      formData.append("logo_image", cardData.logo_image);
    }

    // Append offer image if it's a File
    if (cardData.offer_image instanceof File) {
      formData.append("offer_image", cardData.offer_image);
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
    formData.append("targetAgeMin", cardData.targetAgeMin !== undefined && cardData.targetAgeMin !== null ? cardData.targetAgeMin : "");
    formData.append("targetAgeMax", cardData.targetAgeMax !== undefined && cardData.targetAgeMax !== null ? cardData.targetAgeMax : "");
    
    // Append features array
    if (cardData.features && Array.isArray(cardData.features)) {
      cardData.features.forEach((feature) => {
        formData.append("features[]", feature);
      });
    }
    
    // Append eligibles array
    if (cardData.eligibles && Array.isArray(cardData.eligibles)) {
      cardData.eligibles.forEach((eligible) => {
        formData.append("eligibles[]", eligible);
      });
    }

    // Append targetCities array
    if (cardData.targetCities && Array.isArray(cardData.targetCities)) {
      cardData.targetCities.forEach((city) => {
        formData.append("targetCities[]", city);
      });
    }

    // Append targetPositions array
    if (cardData.targetPositions && Array.isArray(cardData.targetPositions)) {
      cardData.targetPositions.forEach((position) => {
        formData.append("targetPositions[]", position);
      });
    }
    
    // Append logo image if it's a File (only if it's a new file)
    if (cardData.logo_image instanceof File) {
      formData.append("logo_image", cardData.logo_image);
    }

    // Append offer image if it's a File (only if it's a new file)
    if (cardData.offer_image instanceof File) {
      formData.append("offer_image", cardData.offer_image);
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

// Inquiries API
export const getInquiries = async (page = 1, limit = 10, search = "", status = "") => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (status) {
      queryParams.append("status", status);
    }

    const response = await fetch(`${API_BASE_URL}/api/info/inquiries?${queryParams.toString()}`, {
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
      throw new Error(errorData.message || "Failed to fetch inquiries");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    throw error;
  }
};

export const exportInquiriesToCSV = async (search = "", status = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (search) {
      queryParams.append("search", search);
    }
    if (status) {
      queryParams.append("status", status);
    }

    const url = `${API_BASE_URL}/api/info/inquiries/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
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
      throw new Error("Failed to export inquiries");
    }

    const blob = await response.blob();
    const url_blob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_blob;
    link.download = `inquiries_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_blob);

    return { success: true };
  } catch (error) {
    console.error("Error exporting inquiries:", error);
    throw error;
  }
};

// Broadcast Offer Email API
export const broadcastOfferEmail = async ({ title, description }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast-offer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send offer email");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending broadcast offer email:", error);
    throw error;
  }
};

// Auth Banners API
export const getAuthBanners = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth-banners`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch auth banners");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching auth banners:", error);
    throw error;
  }
};

export const createAuthBanner = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth-banners`, {
      method: "POST",
      headers: getAuthHeadersFormData(),
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload auth banner");
    }
    return await response.json();
  } catch (error) {
    console.error("Error uploading auth banner:", error);
    throw error;
  }
};

export const deleteAuthBanner = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth-banners/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete auth banner");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting auth banner:", error);
    throw error;
  }
};

export const toggleAuthBanner = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth-banners/${id}/toggle`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to toggle auth banner");
    }
    return await response.json();
  } catch (error) {
    console.error("Error toggling auth banner:", error);
    throw error;
  }
};

/**
 * Get count of users with incomplete profiles
 * @param {string} days - Duration ('7', '15', '30', '45', 'all')
 */
export const getIncompleteProfileCount = async (days = 'all') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast-incomplete-profile-count?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch incomplete profile count");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching incomplete profile count:", error);
    throw error;
  }
};

/**
 * Send SMS to users with incomplete profiles
 * @param {Object} data - { days, message }
 */
export const sendIncompleteProfileSms = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast-incomplete-profile-sms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send incomplete profile SMS");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending incomplete profile SMS:", error);
    throw error;
  }
};

/**
 * Get count of all users filtered by registration duration
 * @param {string} days - Duration ('7', '15', '30', '45', 'all')
 */
export const getGeneralUserCount = async (days = 'all') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast-user-count?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user count");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user count:", error);
    throw error;
  }
};

/**
 * Send general SMS broadcast
 * @param {Object} data - { days, message, templateId }
 */
export const sendGeneralSmsBroadcast = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast-general-sms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send general SMS broadcast");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending general SMS broadcast:", error);
    throw error;
  }
};

/**
 * Get count of users with email addresses filtered by registration duration
 * @param {string} days - Duration ('7', '15', '30', '45', 'all')
 */
export const getTargetedEmailUserCount = async (days = 'all') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast-targeted-email-count?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch email user count");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching email user count:", error);
    throw error;
  }
};

/**
 * Send targeted HTML email broadcast
 * @param {Object} data - { days, subject, htmlContent }
 */
export const sendTargetedEmailBroadcast = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast-targeted-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send targeted email broadcast");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending targeted email broadcast:", error);
    throw error;
  }
};

/**
 * Fetch core platform metrics snapshot for the Admin Dashboard
 * @returns {Promise<Object>} API response with dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
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
      throw new Error(errorData.message || "Failed to fetch dashboard stats");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const getTrafficSources = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/traffic-sources`, {
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
      throw new Error(errorData.message || "Failed to fetch traffic sources stats");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching traffic sources stats:", error);
    throw error;
  }
};

export const getStatsTrend = async (statId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats/trend?statId=${statId}`, {
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
      throw new Error(errorData.message || "Failed to fetch stats trend");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stats trend:", error);
    throw error;
  }
};

export const getPopupSetting = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings/popup`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch popup setting");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching popup setting:", error);
    throw error;
  }
};

export const updatePopupSetting = async (isPopupEnabled) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings/popup`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isPopupEnabled }),
    });
    if (!response.ok) {
      throw new Error("Failed to update popup setting");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating popup setting:", error);
    throw error;
  }
};

export const getCardClicks = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/cards/${cardId}/clicks`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch card clicks");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching card clicks:", error);
    throw error;
  }
};

export const broadcastCardMailer = async (cardId, subject, htmlContent) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/cards/${cardId}/broadcast`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ subject, htmlContent }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to send card broadcast");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending card broadcast:", error);
    throw error;
  }
};

// Scheduled Mailers API
export const getScheduledMailerStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-mailers/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch scheduled mailer stats");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching scheduled mailer stats:", error);
    throw error;
  }
};

export const getScheduledMailerLogs = async (page = 1, limit = 20, search = "", type = "") => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) queryParams.append("search", search);
    if (type) queryParams.append("type", type);

    const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-mailers/logs?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch scheduled mailer logs");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching scheduled mailer logs:", error);
    throw error;
  }
};

// Business Categories API
export const getAdminBusinessCategories = async (search = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (search) {
      queryParams.append("search", search);
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/business-categories?${queryParams.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch business categories");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching business categories:", error);
    throw error;
  }
};

export const createBusinessCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/business-categories`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create business category");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating business category:", error);
    throw error;
  }
};

export const toggleBusinessCategoryStatus = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/business-categories/${id}/toggle-status`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to toggle business category status");
    }
    return await response.json();
  } catch (error) {
    console.error("Error toggling business category status:", error);
    throw error;
  }
};

export const deleteBusinessCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/business-categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete business category");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting business category:", error);
    throw error;
  }
};

export const updateBusinessCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/business-categories/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update business category");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating business category:", error);
    throw error;
  }
};

export const sendTestScheduledMailer = async (type, email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-mailers/test`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, email }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send test scheduled mailer");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending test scheduled mailer:", error);
    throw error;
  }
};

export const getScheduledMailerSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-mailers/settings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch scheduled mailer settings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching scheduled mailer settings:", error);
    throw error;
  }
};

export const updateScheduledMailerSettings = async (settings) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-mailers/settings`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ settings }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update scheduled mailer settings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating scheduled mailer settings:", error);
    throw error;
  }
};





