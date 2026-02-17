import axios from "axios";
import { toast } from "react-toastify";
import api from "../index"; // Import base URL from index.js

// Use base URL from index.js instead of hardcoded URL
const API_URL = api.defaults.baseURL || "https://foodorderingbackend.dockyardsoftware.com";

export const orderService = {
  // NEW: Get or create active order for table (single order per table)
  getOrCreateActiveOrder: async (tableId) => {
    try {
      console.log("🔵 orderService.getOrCreateActiveOrder called with TableId:", tableId);
      
      if (!tableId) {
        throw new Error("TableId is required");
      }

      const requestData = { TableId: parseInt(tableId) };
      console.log("📤 Sending to /Order/GetOrCreateActiveOrder:", requestData);

      const response = await axios.post(`${API_URL}/Order/GetOrCreateActiveOrder`, requestData);
      console.log("📥 Backend response:", response.data);

      if (response.data.StatusCode === 200 && response.data.ResultSet) {
        return response.data.ResultSet; // Returns { OrderId, TableId, OrderStatus, TotalAmount, CreatedAt, IsNewOrder }
      } else {
        throw new Error(response.data.Result || "Failed to get/create order");
      }
    } catch (error) {
      console.error("❌ getOrCreateActiveOrder failed:", error);
      throw error;
    }
  },

  // NEW: Complete order after payment
  completeOrder: async (orderId) => {
    try {
      console.log("🔵 orderService.completeOrder called with OrderId:", orderId);
      
      if (!orderId) {
        throw new Error("OrderId is required");
      }

      const requestData = { OrderId: parseInt(orderId) };
      console.log("📤 Sending to /Order/CompleteOrder:", requestData);

      const response = await axios.post(`${API_URL}/Order/CompleteOrder`, requestData);
      console.log("📥 Backend response:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ completeOrder failed:", error);
      throw error;
    }
  },

  addOrder: async ({ TableId, SessionId }) => {
    try {
      console.log("🔵 orderService.addOrder called with:", { TableId, SessionId });
      
      // Validate parameters
      if (!TableId) {
        throw new Error("TableId is required");
      }
      if (!SessionId) {
        throw new Error("SessionId is required");
      }

      const requestData = {
        TableId: parseInt(TableId),
        SessionId: parseInt(SessionId),
      };

      console.log("📤 Sending to backend:", requestData);

      const response = await axios.post(`${API_URL}/Order/AddOrder`, requestData);

      console.log("📥 Backend response:", response.data);

      const orderId = Number(response.data.Result);

      return { OrderId: orderId, status: response.data.ResultStatusCode };
    } catch (error) {
      console.error("❌ Add order failed:", error);
      throw error;
    }
  },

  addOrderItem: async ({ OrderId, MenuItemId, Quantity, MenuItemSizeId }) => {
    try {
      console.log("Sending request to add order item:", {
        OrderId,
        MenuItemId,
        Quantity,
        MenuItemSizeId,
      });

      const response = await axios.post(`${API_URL}/OrderItem/AddOrderItems`, {
        OrderId,
        MenuItemId,
        Quantity,
        MenuItemSizeId,
      });

      console.log("Backend response for addOrderItem:", response.data);

      return response.data;
    } catch (error) {
      console.error("Add order item failed:", error);
      throw error;
    }
  },

  // Optional: Add method to get order details
  getOrderDetails: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/Order/GetOrderDetails`, {
        params: { orderId },
      });

      return response.data;
    } catch (error) {
      console.error("Get order details failed:", error);
      throw error;
    }
  },

  // Optional: Add method to update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(`${API_URL}/Order/UpdateOrderStatus`, {
        orderId,
        status,
      });

      return response.data;
    } catch (error) {
      console.error("Update order status failed:", error);
      throw error;
    }
  },

  // Update order total after adding items
  updateOrderTotal: async (orderId) => {
    try {
      console.log("💰 Updating order total for OrderId:", orderId);
      const response = await axios.post(`${API_URL}/Order/UpdateOrderTotal`, {
        OrderId: parseInt(orderId),
      });

      console.log("✅ Order total updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Update order total failed:", error);
      throw error;
    }
  },
};
