
import { orderService } from "../services/orderService";
import {
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_STATUS_UPDATE,
  ORDER_FILTERS_UPDATE,
  ORDER_SEARCH_UPDATE,
  ORDER_RESET_FILTERS,
} from "../constants/orderConstants";
import { toast } from "react-toastify";

// Fetch all orders
export const fetchOrders = () => async (dispatch) => {
  dispatch({ type: ORDER_LIST_REQUEST });
  try {
    const orders = await orderService.getAllOrders();
    dispatch({ type: ORDER_LIST_SUCCESS, payload: orders });
    // Removed toast for successful load
  } catch (error) {
    dispatch({ type: ORDER_LIST_FAIL, payload: error.message });
    toast.error("❌ Failed to load orders: " + error.message);
  }
};

// Update status
export const updateOrderStatus =
  (orderId, newStatus) => async (dispatch, getState) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus);

      if (result.ResultStatusCode === 1) {
        const { orders } = getState().order;
        const updatedOrders = orders.map((order) =>
          order.OrderId === orderId
            ? { ...order, OrderStatus: newStatus }
            : order
        );

        dispatch({ type: ORDER_STATUS_UPDATE, payload: updatedOrders });
        toast.success(`✅ Order #${orderId} status updated to ${newStatus}`);
      } else {
        console.error("Backend error:", result.Result);
        
      }
    } catch (error) {
      console.error("Error in updateOrderStatus action:", error);
      toast.error("❌ Error updating order status");
    }
  };

// Update filters
export const updateFilters = (filters) => ({
  type: ORDER_FILTERS_UPDATE,
  payload: filters,
});

// Update search query
export const updateSearch = (query) => ({
  type: ORDER_SEARCH_UPDATE,
  payload: query,
});

// Reset filters and search
export const resetFilters = () => ({
  type: ORDER_RESET_FILTERS,
});
