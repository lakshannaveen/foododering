import { toast } from "react-toastify";
import {
  GET_ADMINS_REQUEST,
  GET_ADMINS_SUCCESS,
  GET_ADMINS_FAIL,
} from "../constants/adminConstants";
import { getAllAdmins } from "../services/adminService";

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
