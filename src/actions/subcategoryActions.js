import { toast } from "react-toastify";
import {
  GET_SUBCATEGORIES_REQUEST,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORIES_FAIL,
  ADD_SUBCATEGORY_REQUEST,
  ADD_SUBCATEGORY_SUCCESS,
  ADD_SUBCATEGORY_FAIL,
  INACTIVATE_SUBCATEGORY_REQUEST,
  INACTIVATE_SUBCATEGORY_SUCCESS,
  INACTIVATE_SUBCATEGORY_FAIL,
} from "../constants/subcategoryConstants";

import {
  addSubCategory,
  fetchSubCategories,
  inactivateSubCategory, // new service
} from "../services/subcategoryService";

// Fetch subcategories
export const fetchAllSubcategories = () => async (dispatch) => {
  try {
    dispatch({ type: GET_SUBCATEGORIES_REQUEST });
    const data = await fetchSubCategories();
    dispatch({
      type: GET_SUBCATEGORIES_SUCCESS,
      payload: data.ResultSet || [],
    });
  } catch (error) {
    toast.error(error.message || "Failed to fetch subcategories");
    dispatch({
      type: GET_SUBCATEGORIES_FAIL,
      payload: error.message || "Failed to fetch subcategories",
    });
  }
};

// Add new subcategory
export const addNewSubcategory = (subcategoryData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_SUBCATEGORY_REQUEST });
    const data = await addSubCategory(subcategoryData);

    if (data.StatusCode === 200) {
      toast.success(data.Result || "Subcategory added successfully!");
      dispatch({
        type: ADD_SUBCATEGORY_SUCCESS,
        payload: {
          id: data.ResultSet?.id || Date.now(),
          ...subcategoryData,
        },
      });
      // Immediately fetch subcategories to get correct IDs
      dispatch(fetchAllSubcategories());
    } else {
      toast.error(data.Result || "Failed to add subcategory");
      dispatch({
        type: ADD_SUBCATEGORY_FAIL,
        payload: data.Result || "Failed to add subcategory",
      });
    }
  } catch (error) {
    toast.error(error.message || "Something went wrong");
    dispatch({
      type: ADD_SUBCATEGORY_FAIL,
      payload: error.message || "Something went wrong",
    });
  }
};

// Inactivate subcategory
export const toggleSubcategoryStatus = (subcategory) => async (dispatch) => {
  try {
    dispatch({ type: INACTIVATE_SUBCATEGORY_REQUEST });

    const updatedSubcategory = {
      SubCategoryId: subcategory.SubCategoryId,
      Status: subcategory.Status === "A" ? "I" : "A",
    };

    await inactivateSubCategory(updatedSubcategory); // call service

    dispatch({ type: INACTIVATE_SUBCATEGORY_SUCCESS, payload: { ...subcategory, Status: updatedSubcategory.Status } });
    // Optionally refresh list if needed:
    // dispatch(fetchAllSubcategories());

    toast.success(
      `Subcategory "${subcategory.Name}" is now ${
        updatedSubcategory.Status === "A" ? "Active" : "Inactive"
      }`
    );
  } catch (error) {
    dispatch({
      type: INACTIVATE_SUBCATEGORY_FAIL,
      payload: error.message || "Failed to update status",
    });
    toast.error(`Status update failed: ${error.message || "Unknown error"}`);
  }
};
