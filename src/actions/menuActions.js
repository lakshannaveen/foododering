// src/redux/actions/menuActions.js
import { toast } from "react-toastify";
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

import {
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  updateMenuItemStatus,
  searchMenuItems,
} from "../services/menuService";

// Fetch all items
export const fetchMenuItems = () => async (dispatch) => {
  try {
    dispatch({ type: MENU_FETCH_REQUEST });
    const data = await getAllMenuItems();
    dispatch({ type: MENU_FETCH_SUCCESS, payload: data?.ResultSet || [] });
  } catch (error) {
    dispatch({
      type: MENU_FETCH_FAIL,
      payload: error.message || "Failed to fetch",
    });
    toast.error(`Fetch failed: ${error.message || "Unknown error"}`);
  }
};

// Search
export const searchMenu = (query) => async (dispatch) => {
  try {
    dispatch({ type: MENU_SEARCH_REQUEST });
    const data = await searchMenuItems(query);
    dispatch({ type: MENU_SEARCH_SUCCESS, payload: data });
    toast.info(`${data.length} item(s) found for "${query}"`);
  } catch (error) {
    dispatch({
      type: MENU_SEARCH_FAIL,
      payload: error.message || "Failed to search",
    });
    toast.error(`Search failed: ${error.message || "Unknown error"}`);
  }
};

// Add
export const createMenuItem = (item, imageFile) => async (dispatch) => {
  try {
    dispatch({ type: MENU_ADD_REQUEST });
    await addMenuItem(item, imageFile);
    dispatch({ type: MENU_ADD_SUCCESS });
    dispatch(fetchMenuItems());
    toast.success(`Menu item "${item.Name}" added successfully!`);
  } catch (error) {
    dispatch({
      type: MENU_ADD_FAIL,
      payload: error.message || "Failed to add",
    });
    toast.error(`Add failed: ${error.message || "Unknown error"}`);
  }
};

// Update
export const editMenuItem = (item, imageFile) => async (dispatch) => {
  try {
    dispatch({ type: MENU_UPDATE_REQUEST });
    await updateMenuItem(item, imageFile);
    dispatch({ type: MENU_UPDATE_SUCCESS });
    dispatch(fetchMenuItems());
    toast.success(`Menu item "${item.Name}" updated successfully!`);
  } catch (error) {
    dispatch({
      type: MENU_UPDATE_FAIL,
      payload: error.message || "Failed to update",
    });
    toast.error(`Update failed: ${error.message || "Unknown error"}`);
  }
};

// Update Status
export const toggleMenuStatus = (item) => async (dispatch) => {
  try {
    dispatch({ type: MENU_STATUS_UPDATE_REQUEST });
    const updatedItem = { ...item, Status: item.Status === "A" ? "I" : "A" };
    await updateMenuItemStatus(updatedItem);
    dispatch({ type: MENU_STATUS_UPDATE_SUCCESS });
    dispatch(fetchMenuItems());
    toast.success(
      `Menu item "${item.MenuItemName || item.Name}" is now ${
        updatedItem.Status === "A" ? "Active" : "Inactive"
      }`
    );
  } catch (error) {
    dispatch({
      type: MENU_STATUS_UPDATE_FAIL,
      payload: error.message || "Failed to update status",
    });
    toast.error(`Status update failed: ${error.message || "Unknown error"}`);
  }
};
