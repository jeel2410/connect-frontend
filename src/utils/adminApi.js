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
