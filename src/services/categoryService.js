import api from "../index";


// categoryService.js
export const addCategoryAPI = async (category) => {
  console.log("📌 addCategoryAPI called with:", category);
  try {
    const response = await api.post("/Category/AddCategory", {
      Name: category.Name,  // backend expects "Name"
      Status: category.Status || "A",
    });
    console.log("✅ API success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding category:", error);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};





// Fetch all categories (if needed later)
export const getCategoriesAPI = async () => {
  try {
    const response = await api.get("/Category/GetAllCategory");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};
// Fetch category by ID
export const getCategoryByIdAPI = async (categoryId) => {
  try {
    const response = await api.post("/Category/GetCategoryByID", {
      categoryId: categoryId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${categoryId}:`, error);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};

// Inactivate (delete) category
// // Inactivate (delete) category
export const inactivateCategoryAPI = async (category) => {
  try {
    const response = await api.post("/Category/InactiveCategory", {
      categoryId: category.CategoryId,
      Status: category.Status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating menu item status:", error);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};
