import { toast } from "react-toastify";
import {
  GET_ADMINS_REQUEST,
  GET_ADMINS_SUCCESS,
  GET_ADMINS_FAIL,
} from "../constants/adminConstants";
import { getAllAdmins } from "../services/adminService";
import { registerAdmin } from "../services/authService";

export const fetchAdmins = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ADMINS_REQUEST });

    const data = await getAllAdmins();
    console.log("🟢 Data from service:", data);

    if (data.StatusCode === 200 && Array.isArray(data.ResultSet)) {
      dispatch({ type: GET_ADMINS_SUCCESS, payload: data.ResultSet });
    } else {
      toast.error(data.Result || "No admins found");
      dispatch({
        type: GET_ADMINS_FAIL,
        payload: data.Result || "No admins found",
      });
    }
  } catch (error) {
    console.error("❌ FetchAdmins Error:", error);
    toast.error(error.message || "Failed to fetch admins");
    dispatch({
      type: GET_ADMINS_FAIL,
      payload: error.message || "Failed to fetch admins",
    });
  }
};

export const addAdmin = (adminData) => async (dispatch) => {
  try {
    dispatch({ type: GET_ADMINS_REQUEST });

    const data = await registerAdmin(adminData);
    console.log("🟢 Register admin response:", data);

    if (data?.StatusCode === 200 || data?.Status === "Success") {
      // refresh list
      const list = await getAllAdmins();
      if (list.StatusCode === 200 && Array.isArray(list.ResultSet)) {
        dispatch({ type: GET_ADMINS_SUCCESS, payload: list.ResultSet });
        toast.success("User added successfully");
      } else {
        dispatch({ type: GET_ADMINS_FAIL, payload: list.Result || "Failed to refresh" });
      }
    } else {
      const message = data?.Result || data?.message || "Failed to add admin";
      toast.error(message);
      dispatch({ type: GET_ADMINS_FAIL, payload: message });
    }
  } catch (error) {
    console.error("❌ AddAdmin Error:", error);
    const msg = error?.Result || error?.message || error || "Failed to add admin";
    toast.error(msg);
    dispatch({ type: GET_ADMINS_FAIL, payload: msg });
  }
};
