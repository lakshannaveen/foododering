
import api from "../index"; //your pre-configured axios instance

export const menuService = {
  // Get single menu item by ID
  getMenuItemById: async (menuItemId) => {
    try {
      console.log(`📡 Fetching menu item for ID: ${menuItemId}`); // ✅ log before API call
      const response = await api.get(
        `/MenuItem/GetMenuItemID?MenuItemID=${menuItemId}`
      );

      console.log("✅ API Response:", response.data); // ✅ log API response

      if (response.data && response.data.ResultSet) {
        return response.data.ResultSet;
      } else {
        console.warn(`⚠️ No ResultSet returned for ID: ${menuItemId}`);
        return null;
      }
    } catch (error) {
      handleError(error, "getMenuItemById");
      return null;
    }
  },

  // Get all menu items using menuIds from localStorage
  getMenuItemsFromLocalStorage: async () => {
    const storedIds = JSON.parse(localStorage.getItem("menuIds")) || [];
    console.log("📦 Retrieved menuIds from localStorage:", storedIds); // ✅ log menuIds

    if (storedIds.length === 0) {
      console.warn("⚠️ No menuIds found in localStorage.");
      return [];
    }

    const items = [];
    for (const id of storedIds) {
      const result = await menuService.getMenuItemById(id);
      if (Array.isArray(result)) {
        items.push(...result);
      } else if (result) {
        items.push(result);
      }
    }

    console.log("🍽️ Final fetched menu items:", items); //log final items
    return items;
  },
};

// Centralized error handler
function handleError(error, methodName) {
  if (error.response) {
    console.error(
      `❌ menuService.${methodName}: Server error:`,
      error.response.status,
      error.response.data
    );
  } else if (error.request) {
    console.error(
      `❌ menuService.${methodName}: No response received:`,
      error.request
    );
  } else {
    console.error(
      `❌ menuService.${methodName}: Request setup error:`,
      error.message
    );
  }
}
