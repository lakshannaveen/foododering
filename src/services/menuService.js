import axios from "axios";
import api  from "../index"
const API_URL = api.defaults.baseURL;
const svcLog = (...a) => console.log("%c[menuService]", "color:#8b5cf6", ...a);
const svcErr = (...a) =>
  console.error("%c[menuService:ERROR]", "color:#ef4444", ...a);

// GET all menu items
export const getAllMenuItems = async () => {
  svcLog("➡️ GET /MenuItem/GetAllMenuItem");
  try {
    const res = await axios.get(`${API_URL}/MenuItem/GetAllMenuItem`);
    svcLog("✅ getAllMenuItems:", res.status, res.data);
    return res.data;
  } catch (error) {
    const detail = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };
    svcErr("getAllMenuItems failed:", detail);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};

// ADD item (multipart with image)
export const addMenuItem = async (menuItem, imageFile) => {
  svcLog(
    "➡️ POST /MenuItem/AddMenuItem payload:",
    menuItem,
    "image:",
    !!imageFile
  );

  const formData = new FormData();
  Object.entries(menuItem).forEach(([k, v]) => formData.append(k, v ?? ""));

  if (imageFile) {
    formData.append("imageFile", imageFile, imageFile.name);
  }

  // DEBUG: show FormData entries (files shown as meta)
  const fdPreview = {};
  for (const [k, v] of formData.entries()) {
    fdPreview[k] =
      v instanceof File ? { name: v.name, size: v.size, type: v.type } : v;
  }
  svcLog("🧪 FormData entries:", fdPreview);

  try {
    const res = await axios.post(`${API_URL}/MenuItem/AddMenuItem`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    svcLog("✅ addMenuItem:", res.status, res.data);
    return res.data;
  } catch (error) {
    const detail = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };
    svcErr("addMenuItem failed:", detail);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};

// UPDATE item (supports optional image)
export const updateMenuItem = async (menuItem, imageFile) => {
  svcLog(
    "➡️ POST /MenuItem/UpdateMenuItem payload:",
    menuItem,
    "image:",
    !!imageFile
  );


  const formData = new FormData();
  Object.entries(menuItem).forEach(([k, v]) => {
    if (k === "SizesJson" && Array.isArray(v)) {
      formData.append(k, JSON.stringify(v));
    } else {
      formData.append(k, v ?? "");
    }
  });
  if (imageFile) formData.append("imageFile", imageFile.name, imageFile);

  const fdPreview = {};
  for (const [k, v] of formData.entries()) {
    fdPreview[k] =
      v instanceof File ? { name: v.name, size: v.size, type: v.type } : v;
  }
  svcLog("🧪 FormData entries (update):", fdPreview);

  try {
    const res = await axios.post(
      `${API_URL}/MenuItem/UpdateMenuItem`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    svcLog("✅ updateMenuItem:", res.status, res.data);
    return res.data;
  } catch (error) {
    const detail = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };
    svcErr("updateMenuItem failed:", detail);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};

// SEARCH by name
export const searchMenuItems = async (query) => {
  svcLog("➡️ POST /MenuItem/GetMenuItemID body:", { Name: query });
  try {
    const res = await axios.post(
      `${API_URL}/MenuItem/GetMenuItemID`,
      { Name: query },
      { headers: { "Content-Type": "application/json" } }
    );
    svcLog("✅ searchMenuItems:", res.status, res.data);
    return res.data.ResultSet || [];
  } catch (error) {
    const detail = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };
    svcErr("searchMenuItems failed:", detail);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};

// TOGGLE status
export const updateMenuItemStatus = async (menuItem) => {
  const body = { MenuItemId: menuItem.MenuItemId, Status: menuItem.Status };
  svcLog("➡️ POST /MenuItem/UpdateMenuItemStatus body:", body);
  try {
    const res = await axios.post(
      `${API_URL}/MenuItem/UpdateMenuItemStatus`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );
    svcLog("✅ updateMenuItemStatus:", res.status, res.data);
    return res.data;
  } catch (error) {
    const detail = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };
    svcErr("updateMenuItemStatus failed:", detail);
    throw error.response ? error.response.data : { message: "Server error" };
  }
};

export { API_URL };
