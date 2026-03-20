import api from "../index";

const productionCostService = {
  getAllProductionCosts: async () => {
    try {
      const response = await api.get("/ProductionCosts/GetAllProductionCosts");
      return response.data?.ResultSet || [];
    } catch (error) {
      console.error("Error fetching production costs:", error);
      return [];
    }
  },

  getProductionCostsById: async (id) => {
    try {
      const response = await api.get(`/ProductionCosts/GetProductionCostsById?ProductionCostId=${encodeURIComponent(id)}`);
      return response.data?.ResultSet || response.data || null;
    } catch (error) {
      console.error("Error fetching production cost by id:", error);
      return null;
    }
  },

  addProductionCosts: async ({ MenuItemSizeId = 0, IngredientCost = 0, LaborCost = 0, OverheadCost = 0, TotalCost = 0, SuggestedPrice = 0 } = {}) => {
    // Basic client-side validation / coercion
    const mid = parseInt(MenuItemSizeId, 10);
    const ic = parseFloat(IngredientCost) || 0;
    const lc = parseFloat(LaborCost) || 0;
    const oc = parseFloat(OverheadCost) || 0;
    const tc = parseFloat(TotalCost) || 0;
    const sp = parseFloat(SuggestedPrice) || 0;

    if (isNaN(mid) || mid <= 0) {
      return { success: false, message: 'Invalid MenuItemSizeId (must be a positive integer)', code: 400 };
    }

    try {
      // Send JSON body (more robust than query string) and coerce numeric types
      const payload = {
        MenuItemSizeId: mid,
        IngredientCost: ic,
        LaborCost: lc,
        OverheadCost: oc,
        TotalCost: tc,
        SuggestedPrice: sp,
      };

      const response = await api.post(`/ProductionCosts/AddProductionCosts`, payload);

      const data = response?.data;

      // Some backend endpoints return HTTP 200 but include an internal StatusCode/ResultStatusCode.
      // Treat those as failures unless they explicitly indicate success.
      const backendStatus = data?.StatusCode ?? data?.ResultStatusCode ?? null;
      if (backendStatus !== null && backendStatus !== 200 && backendStatus !== 1) {
        return { success: false, status: response.status, error: data };
      }

      return { success: true, status: response.status, data };
    } catch (error) {
      if (error?.response) {
        return { success: false, status: error.response.status, error: error.response.data };
      }
      console.error("Error adding production cost:", error);
      return { success: false, message: error?.message || 'Network error' };
    }
  },
};

export default productionCostService;
