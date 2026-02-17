import api from "../index"; // default export

export const orderService = {
  getAllOrders: async () => {
    try {
      const response = await api.get("/Order/GetAllOrders"); // baseURL already included
      console.log("Orders fetched:", response.data);
      return response.data.ResultSet || [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

   updateOrderStatus: async (orderId, orderStatus) => {
    try {
      const response = await api.post("/Order/OrderStatus", {
        OrderId: orderId,
        OrderStatus: orderStatus,
      });

      console.log("Order status updated:", response.data);
      return response.data; // contains Result + ResultStatusCode
    } catch (error) {
      console.error("Error updating order status:", error);
      return { Result: "Error", ResultStatusCode: 0 };
    }
  },

  
};
