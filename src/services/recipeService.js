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

export const updateIngredient = async (IngredientId, CurrentStock) => {
  try {
    const response = await api.post(`/Ingredient/UpdateIngredient?IngredientId=${encodeURIComponent(IngredientId)}&CurrentStock=${encodeURIComponent(CurrentStock)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addRecipe = async ({ MenuItemSizeId, RecipeName }) => {
  try {
    const qs = `?MenuItemSizeId=${encodeURIComponent(MenuItemSizeId||"")}&RecipeName=${encodeURIComponent(RecipeName||"")}`;
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

export const getIngredientsByRecipe = async (RecipeId) => {
  try {
    const response = await api.get(`/RecipeIngredient/GetIngredientByRecipe?RecipeId=${encodeURIComponent(RecipeId)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getLaborByRecipe = async (RecipeId) => {
  try {
    const response = await api.get(`/RecipeLabor/GetLaborByRecipe?RecipeId=${encodeURIComponent(RecipeId)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getOverheadByRecipe = async (RecipeId) => {
  try {
    const response = await api.get(`/RecipeOverhead/GetOverHeadByRecipe?RecipeId=${encodeURIComponent(RecipeId)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addIngredientToRecipe = async (IngredientId, RecipeId, QuantityRequired) => {
  try {
    const response = await api.post(`/RecipeIngredient/AddIngredientToRecipe?IngredientId=${encodeURIComponent(IngredientId)}&RecipeId=${encodeURIComponent(RecipeId)}&QuantityRequired=${encodeURIComponent(QuantityRequired)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addLaborByRecipe = async (LaborId, RecipeId, TimeRequired) => {
  try {
    const response = await api.post(`/RecipeLabor/AddLaborByRecipe?LaborId=${encodeURIComponent(LaborId)}&RecipeId=${encodeURIComponent(RecipeId)}&TimeRequired=${encodeURIComponent(TimeRequired)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addLaborToRecipe = async (LaborId, RecipeId, MinutesRequired, Rate) => {
  try {
    const response = await api.post(`/RecipeLabor/AddLaborToRecipe?LaborId=${encodeURIComponent(LaborId)}&RecipeId=${encodeURIComponent(RecipeId)}&MinutesRequired=${encodeURIComponent(MinutesRequired)}&Rate=${encodeURIComponent(Rate)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addOverheadByRecipe = async (RecipeId, OverheadId, HoursUsed) => {
  try {
    const response = await api.post(`/RecipeOverhead/AddOverHeadByRecipe?RecipeId=${encodeURIComponent(RecipeId)}&OverheadId=${encodeURIComponent(OverheadId)}&HoursUsed=${encodeURIComponent(HoursUsed)}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addOverheadToRecipe = async (OverheadId, RecipeId, MinutesRequired, CostPerHour) => {
  try {
    const response = await api.post(`/RecipeOverhead/AddOverheadToRecipe?OverheadId=${encodeURIComponent(OverheadId)}&RecipeId=${encodeURIComponent(RecipeId)}&MinutesRequired=${encodeURIComponent(MinutesRequired)}&CostPerHour=${encodeURIComponent(CostPerHour)}`);
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
  updateIngredient,
  addRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipeStatus,
  getIngredientsByRecipe,
  getLaborByRecipe,
  getOverheadByRecipe,
  addIngredientToRecipe,
  addLaborByRecipe,
  addLaborToRecipe,
  addOverheadByRecipe,
  addOverheadToRecipe,
};
