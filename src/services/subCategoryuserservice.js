import axios from "axios";

import api from "../index"
const API_BASE_URL = api.defaults.baseURL;
export const subCategoryuserservice = {
  // Get subcategories by category
  getSubCategoriesByCategory: async (categoryId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/menuuser/GetSubCategoryByCategory?categoryId=${categoryId}`
      );
      if (response.data && response.data.ResultSet) {
        return response.data.ResultSet.filter((sub) => sub.Status === "A");
      }
      return [];
    } catch (error) {
      handleError(error, "getSubCategoriesByCategory");
      throw error;
    }
  },

  // Get menu items by subcategory
  getMenuItemsBySubCategory: async (subCategoryId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/menuuser/MenuItemBySubCategory?subCategoryId=${subCategoryId}`
      );
      if (response.data && response.data.ResultSet) {
        return response.data.ResultSet;
      }
      return [];
    } catch (error) {
      handleError(error, "getMenuItemsBySubCategory");
      throw error;
    }
  },
};

