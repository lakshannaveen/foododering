import { toast } from "react-toastify";
import {
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAIL,
  ADD_CATEGORY_REQUEST,
  ADD_CATEGORY_SUCCESS,
  ADD_CATEGORY_FAIL,
  GET_CATEGORY_BY_ID_REQUEST,
  GET_CATEGORY_BY_ID_SUCCESS,
  GET_CATEGORY_BY_ID_FAIL,
  INACTIVATE_CATEGORY_REQUEST,
  INACTIVATE_CATEGORY_SUCCESS,
  INACTIVATE_CATEGORY_FAIL,
} from "../constants/categoryConstants";

import {
  addCategoryAPI,
  getCategoriesAPI,
  getCategoryByIdAPI,
  inactivateCategoryAPI,
} from "../services/categoryService";

// Fetch all categories
export const fetchCategories = () => async (dispatch) => {
  try {
    dispatch({ type: GET_CATEGORIES_REQUEST });
    const data = await getCategoriesAPI();

    if (data.StatusCode === 200) {
      dispatch({ type: GET_CATEGORIES_SUCCESS, payload: data.ResultSet || [] });
    } else {
      toast.error(data.Result || "Failed to fetch categories");
      dispatch({ type: GET_CATEGORIES_FAIL, payload: data.Result || "Failed" });
    }
  } catch (error) {
    toast.error(error.message || "Failed to fetch categories");
    dispatch({ type: GET_CATEGORIES_FAIL, payload: error.message || "Failed" });
  }
};

// Add category
// ✅ categoryActions.js
// categoryActions.js
export const addCategory = (category) => async (dispatch) => {
  try {
    if (!category.Name || category.Name.trim() === "") {
      toast.error("Category name is required");
      return dispatch({
        type: ADD_CATEGORY_FAIL,
        payload: "Category name is required",
      });
    }

    dispatch({ type: ADD_CATEGORY_REQUEST });
    const data = await addCategoryAPI(category);

    if (data.StatusCode === 200) {
      toast.success(data.Result || "Category added successfully!");
      dispatch({
        type: ADD_CATEGORY_SUCCESS,
        payload: {
          CategoryId: data.ResultSet?.CategoryId || Date.now(),
          Name: category.Name,
          Status: category.Status || "A",
        },
      });
      // Immediately fetch categories to get correct IDs
      dispatch(fetchCategories());
    } else {
      toast.error(data.Result || "Failed to add category");
      dispatch({ type: ADD_CATEGORY_FAIL, payload: data.Result || "Failed" });
    }
  } catch (error) {
    toast.error(error.message || "Something went wrong");
    dispatch({ type: ADD_CATEGORY_FAIL, payload: error.message || "Failed" });
  }
};



// Fetch category by ID
export const fetchCategoryById = (categoryId) => async (dispatch) => {
  try {
    dispatch({ type: GET_CATEGORY_BY_ID_REQUEST });
    const data = await getCategoryByIdAPI(categoryId);

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_CATEGORY_BY_ID_SUCCESS,
        payload: data.ResultSet[0],
      });
    } else {
      toast.error(data.Result || "Failed to fetch category");
      dispatch({
        type: GET_CATEGORY_BY_ID_FAIL,
        payload: data.Result || "Failed",
      });
    }
  } catch (error) {
    toast.error(error.message || "Failed to fetch category");
    dispatch({
      type: GET_CATEGORY_BY_ID_FAIL,
      payload: error.message || "Failed",
    });
  }
};


// Toggle category status (Activate / Inactivate)
export const toggleCategoryStatus = (category) => async (dispatch) => {
  try {
    dispatch({ type: INACTIVATE_CATEGORY_REQUEST });

    // Call the API with updated status
    const updatedCategory = { ...category, Status: category.Status === "A" ? "I" : "A" };
    const data = await inactivateCategoryAPI(updatedCategory);

    if (data.StatusCode === 200) {
      toast.success(data.Result || `Category ${updatedCategory.Status === "A" ? "activated" : "inactivated"} successfully!`);
      dispatch({ type: INACTIVATE_CATEGORY_SUCCESS, payload: updatedCategory });
    } else {
      toast.error(data.Result || "Failed to update category status");
      dispatch({
        type: INACTIVATE_CATEGORY_FAIL,
        payload: data.Result || "Failed",
      });
    }
  } catch (error) {
    toast.error(error.message || "Failed to update category status");
    dispatch({
      type: INACTIVATE_CATEGORY_FAIL,
      payload: error.message || "Failed",
    });
  }
};
