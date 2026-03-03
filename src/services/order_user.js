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
        const rs = response.data.ResultSet;

        // Defensive: if backend returned a cancelled/completed order, create a fresh one
        const statusVal = (rs.OrderStatus || rs.Status || "").toString().toLowerCase();
        if (statusVal.includes('cancel') || statusVal.includes('complete')) {
          console.log('⚠️ Existing order is cancelled/completed. Creating a new order for table:', tableId);
          // Create a new order explicitly. Pass SessionId=0 for safety.
          const addResp = await axios.post(`${API_URL}/Order/AddOrder`, { TableId: parseInt(tableId), SessionId: 0 });
          console.log('📥 AddOrder response:', addResp.data);
          if (addResp.data && (addResp.data.ResultStatusCode === 200 || addResp.data.Result)) {
            const newOrderId = Number(addResp.data.Result);
            return { OrderId: newOrderId, TableId: parseInt(tableId), OrderStatus: 'New', TotalAmount: 0, CreatedAt: new Date().toISOString(), IsNewOrder: true };
          }
          // Fallthrough to return original result if add failed
        }

        return rs; // Returns { OrderId, TableId, OrderStatus, TotalAmount, CreatedAt, IsNewOrder }
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
      
      // Validate parameters (allow SessionId = 0)
      if (TableId === undefined || TableId === null) {
        throw new Error("TableId is required");
      }
      if (SessionId === undefined || SessionId === null) {
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
