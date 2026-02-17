// src/redux/reducers/menuReducer.js
import {
  MENU_FETCH_REQUEST,
  MENU_FETCH_SUCCESS,
  MENU_FETCH_FAIL,
  MENU_ADD_REQUEST,
  MENU_ADD_SUCCESS,
  MENU_ADD_FAIL,
  MENU_UPDATE_REQUEST,
  MENU_UPDATE_SUCCESS,
  MENU_UPDATE_FAIL,
  MENU_STATUS_UPDATE_REQUEST,
  MENU_STATUS_UPDATE_SUCCESS,
  MENU_STATUS_UPDATE_FAIL,
  MENU_SEARCH_REQUEST,
  MENU_SEARCH_SUCCESS,
  MENU_SEARCH_FAIL,
} from "../constants/menuConstants";

const initialState = {
  menuItems: [],
  loading: false,
  error: null,
};

export const menuReducer = (state = initialState, action) => {
  switch (action.type) {
    case MENU_FETCH_REQUEST:
    case MENU_SEARCH_REQUEST:
    case MENU_ADD_REQUEST:
    case MENU_UPDATE_REQUEST:
    case MENU_STATUS_UPDATE_REQUEST:
      return { ...state, loading: true, error: null };

    case MENU_FETCH_SUCCESS:
    case MENU_SEARCH_SUCCESS:
      return { ...state, loading: false, menuItems: action.payload };

    case MENU_ADD_SUCCESS:
    case MENU_UPDATE_SUCCESS:
    case MENU_STATUS_UPDATE_SUCCESS:
      return { ...state, loading: false };

    case MENU_FETCH_FAIL:
    case MENU_SEARCH_FAIL:
    case MENU_ADD_FAIL:
    case MENU_UPDATE_FAIL:
    case MENU_STATUS_UPDATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
