// services/authService.js
import api from "../index";

// Register Admin
export const registerAdmin = async (adminData) => {
  try {
    const response = await api.post("/Admin/RegAdmin", adminData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Login Admin
export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post("/Admin/LoginAdmin", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};
