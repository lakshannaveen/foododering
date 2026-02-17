import {
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  REGISTER_RESET,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
} from "../constants/authConstants";

export const authReducer = (state = {}, action) => {
  switch (action.type) {
    // Registration
    case REGISTER_REQUEST:
      return { loading: true };
    case REGISTER_SUCCESS:
      return { loading: false, success: true, userInfo: action.payload };
    case REGISTER_FAIL:
      return { loading: false, error: action.payload };
    case REGISTER_RESET:
      return {};

    // Login
    case LOGIN_REQUEST:
      return { loading: true };
    case LOGIN_SUCCESS:
      return { loading: false, userInfo: action.payload, error: null };
    case LOGIN_FAIL:
      return { loading: false, error: action.payload };

    // Logout
    case LOGOUT:
      return {};

    // Clear error
    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};
