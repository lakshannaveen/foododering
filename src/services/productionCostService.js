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

    // Build query string per backend API contract. Only include MenuItemSizeId when valid (>0)
    try {
      const params = new URLSearchParams();
      // Always send a numeric MenuItemSizeId. Use 0 when missing to avoid varchar->int conversion errors on the server.
      const safeMid = (isNaN(mid) || mid <= 0) ? 0 : mid;
      params.append('MenuItemSizeId', String(safeMid));
      // Backend expects integer values (no decimals) for costs — send rounded integers to avoid varchar->int conversion errors
      const icInt = Math.round(ic);
      const lcInt = Math.round(lc);
      const ocInt = Math.round(oc);
      const tcInt = Math.round(tc);
      const spInt = Math.round(sp);

      params.append('IngredientCost', String(icInt));
      params.append('LaborCost', String(lcInt));
      params.append('OverheadCost', String(ocInt));
      params.append('TotalCost', String(tcInt));
      // SuggestedPrice optional
      if (!isNaN(spInt) && spInt > 0) params.append('SuggestedPrice', String(spInt));

      const url = `/ProductionCosts/AddProductionCosts/?${params.toString()}`;
      // Debug: log the exact URL and numeric values sent to the backend to help trace conversion issues
      console.debug('[productionCostService] POST', url, { MenuItemSizeId: safeMid, IngredientCost: icInt, LaborCost: lcInt, OverheadCost: ocInt, TotalCost: tcInt, SuggestedPrice: spInt });

      const response = await api.post(url);
      const data = response?.data;

      // Treat backend internal status fields as authoritative
      const backendStatus = data?.StatusCode ?? data?.ResultStatusCode ?? null;
      if (backendStatus !== null && backendStatus !== 200 && backendStatus !== 1) {
        return { success: false, status: response.status, error: data };
      }

      // If server responded with an HTTP error code, surface it
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
