import api from "../index";

const handleError = (err) => {
  console.error("API Error:", err?.message || err);
  return { StatusCode: err.response?.status || 500, ResultSet: [], Result: err.response?.data || err.message };
};

export const addIngredient = async (ingredient) => {
  try {
    const response = await api.post(`/Ingredient/AddIngredient`, ingredient);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getIngredientById = async (id) => {
  try {
    const response = await api.post(`/Ingredient/GetIngredientById?IngredientId=${encodeURIComponent(id)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllIngredients = async () => {
  try {
    const response = await api.post(`/Ingredient/GetAllIngredients`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateIngredientStatus = async (IngredientId, status) => {
  try {
    const response = await api.post(`/Ingredient/UpdateIngredientStatus?IngredientId=${encodeURIComponent(IngredientId)}&status=${encodeURIComponent(status)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addLabor = async ({ Role, CostType, Rate, LaborName }) => {
  try {
    const qs = `?Role=${encodeURIComponent(Role||"")}&CostType=${encodeURIComponent(CostType||"")}&Rate=${encodeURIComponent(Rate||"")}&LaborName=${encodeURIComponent(LaborName||"")}`;
    const response = await api.post(`/Labor/AddLabor${qs}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateLabor = async ({ LaborId, LaborName, Role, CostType, Rate }) => {
  try {
    const qs = `?LaborName=${encodeURIComponent(LaborName||"")}&Role=${encodeURIComponent(Role||"")}&CostType=${encodeURIComponent(CostType||"")}&Rate=${encodeURIComponent(Rate||"")}&LaborId=${encodeURIComponent(LaborId||"")}`;
    const response = await api.post(`/Labor/UpdateLabor${qs}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllLabor = async () => {
  try {
    const response = await api.get(`/Labor/GetAllLabor`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateLaborStatus = async (LaborId, Status) => {
  try {
    const response = await api.post(`/Labor/UpdateLaborStatus?LaborId=${encodeURIComponent(LaborId)}&Status=${encodeURIComponent(Status)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addRecipe = async ({ MenuItemId, RecipeName }) => {
  try {
    const qs = `?MenuItemId=${encodeURIComponent(MenuItemId||"")}&RecipeName=${encodeURIComponent(RecipeName||"")}`;
    const response = await api.post(`/Recipe/AddRecipe${qs}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllRecipes = async () => {
  try {
    const response = await api.get(`/Recipe/GetAllRecipes`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getRecipeById = async (RecipeId) => {
  try {
    const response = await api.post(`/Recipe/GetRecipeById?RecipeId=${encodeURIComponent(RecipeId)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateRecipeStatus = async (RecipeId, Status) => {
  try {
    const response = await api.post(`/Recipe/UpdateRecipeStatus?RecipeId=${encodeURIComponent(RecipeId)}&Status=${encodeURIComponent(Status)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export default {
  addIngredient,
  getIngredientById,
  getAllIngredients,
  updateIngredientStatus,
  addLabor,
  updateLabor,
  getAllLabor,
  updateLaborStatus,
  addRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipeStatus,
};
