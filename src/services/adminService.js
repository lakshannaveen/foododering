import api from "../index";

export const getAllAdmins = async () => {
  try {
    const response = await api.get("/Admin/GetAllAdmins");

    console.log("✅ Full API Response:", response);
    console.log("✅ Response Data:", response.data);

    return response.data; // <-- return full data object
  } catch (err) {
    console.error("❌ Error fetching admins:", err.message || err);
    if (err.response) {
      console.error("❌ Error Response Data:", err.response.data);
      console.error("❌ Error Status:", err.response.status);
    }
    return { StatusCode: err.response?.status || 500, ResultSet: [], Result: err.message };
  }
};
