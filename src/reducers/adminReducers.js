// reducers/adminReducer.js
import {
  GET_ADMINS_REQUEST,
  GET_ADMINS_SUCCESS,
  GET_ADMINS_FAIL,
} from "../constants/adminConstants";

const initialState = {
  loading: false,
  users: [],
  error: null,
};

export const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ADMINS_REQUEST:
      return { ...state, loading: true };
    case GET_ADMINS_SUCCESS:
      return { ...state, loading: false, users: action.payload };
    case GET_ADMINS_FAIL:
      return { ...state, loading: false, error: action.payload, users: [] };
    default:
      return state;
  }
};
