// src/services/tableService.js
import  api  from "../index";

export const getAllTables = async () => {
  try {
    const response = await api.get("/Admin/GetAllTable");
    console.log("✅ Tables Data:", response.data); // log data
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching tables:", error);
    throw error;
  }
};

export const addTable = async (tableData) => {
  try {
    const response = await api.post("/Admin/AddTable", tableData);
    console.log("✅ Table Added:", response.data); // log data
    return response.data;
  } catch (error) {
    console.error("❌ Error adding table:", error);
    throw error;
  }
};
export const updateTable = async (tableId, tableData) => {
  try {
    const response = await api.put(`/Admin/UpdateTable/${tableId}`, tableData);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating table:", error);
    throw error;
  }
};
