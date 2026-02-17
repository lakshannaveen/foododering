// import api from "../index"; // your axios instance with baseURL

// // Add new subcategory
// export const addSubCategory = async (subcategoryData) => {
//   try {
//     const response = await api.post(
//       "/SubCategory/AddSubCategory",
//       subcategoryData
//     );
//     console.log("✅ Response Data:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error adding subcategory:", error);
//     throw error;
//   }
// };
// export const fetchSubCategories = async () => {
 
//   try {
//     const response = await api.get("/SubCategory/GetAllSubCategory");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     throw error.response ? error.response.data : { message: "Server error" };
//   }
// };

import api from "../index"; // your axios instance with baseURL

// ✅ Add new subcategory
export const addSubCategory = async (subcategoryData) => {
  console.log("➡️ [addSubCategory] Sending data:", subcategoryData);

  try {
    const response = await api.post(
      "/SubCategory/AddSubCategory",
      subcategoryData
    );

    console.log("✅ [addSubCategory] Response status:", response.status);
    console.log("✅ [addSubCategory] Response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ [addSubCategory] Error occurred:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
      console.error("   Headers:", error.response.headers);
    } else if (error.request) {
      console.error("   No response received:", error.request);
    } else {
      console.error("   Setup error:", error.message);
    }
    throw error;
  }
};

// ✅ Fetch all subcategories
export const fetchSubCategories = async () => {
  console.log(
    "➡️ [fetchSubCategories] Requesting /SubCategory/GetAllSubCategory"
  );

  try {
    const response = await api.get("/SubCategory/GetAllSubCategory");

    console.log("✅ [fetchSubCategories] Response status:", response.status);
    console.log("✅ [fetchSubCategories] Response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ [fetchSubCategories] Error occurred:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
      console.error("   Headers:", error.response.headers);
    } else if (error.request) {
      console.error("   No response received:", error.request);
    } else {
      console.error("   Setup error:", error.message);
    }
    throw error.response ? error.response.data : { message: "Server error" };
  }
};

export const inactivateSubCategory = async (subcategory) => {
  const body = {
    SubCategoryId: subcategory.SubCategoryId,
    Status: subcategory.Status,
  };
  try {
    const res = await api.post("/SubCategory/InactiveSubCategory", body);
    return res.data;
  } catch (error) {
    console.error("Error inactivating subcategory:", error);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};
