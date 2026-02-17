import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // ✅ Vite-compatible import
import {
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
} from "../constants/authConstants";
import { registerAdmin, loginAdmin } from "../services/authService";

// Register
export const register = (adminData) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });
    const data = await registerAdmin(adminData);

    if (data.StatusCode === 200) {
      toast.success(data.Result || "Registration successful!");
      dispatch({ type: REGISTER_SUCCESS, payload: data });
      // Do NOT store userInfo in localStorage on register
    } else {
      toast.error(data.Result || "Registration failed");
      dispatch({
        type: REGISTER_FAIL,
        payload: data.Result || "Registration failed",
      });
    }
  } catch (error) {
    toast.error(
      error.response?.data?.Result || error.message || "Registration failed"
    );
    dispatch({
      type: REGISTER_FAIL,
      payload:
        error.response?.data?.Result || error.message || "Registration failed",
    });
  }
};

// Login
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const data = await loginAdmin(credentials);
    console.log("Login response:", data);

    if (data.StatusCode === 200 && data.Result?.startsWith("ey")) {
      const token = data.Result;
      const decoded = jwtDecode(token); // ✅ fixed decoding for Vite

      const userInfo = {
        token,
        email: decoded.email,
        adminid: decoded.role || decoded.TailorId || "user",
        exp: decoded.exp,
      };

      toast.success("Login successful!");
      dispatch({ type: LOGIN_SUCCESS, payload: userInfo });
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      toast.error(data.Result || "Login failed. Please try again.");
      dispatch({
        type: LOGIN_FAIL,
        payload: data.Result || "Login failed. Please try again.",
      });
    }
  } catch (error) {
    toast.error(
      error.response?.data?.Result || error.message || "Login failed"
    );
    dispatch({
      type: LOGIN_FAIL,
      payload: error.response?.data?.Result || error.message || "Login failed",
    });
  }
};

// Logout
export const logout = () => (dispatch) => {
  localStorage.removeItem("userInfo");
  toast.info("Logged out successfully");
  dispatch({ type: LOGOUT });
};
