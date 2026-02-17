import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaTable,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTimes,
  FaSave,
  FaExclamationTriangle,
  FaSync,
  FaCalendarAlt,
  FaHashtag,
  FaMoneyBillWave,
  FaList,
  FaEye,
  FaUtensils,
  FaChevronDown,
  FaChevronUp,
  FaShoppingBag,
  FaReceipt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  updateOrderStatus,
  updateFilters,
  updateSearch,
  resetFilters,
} from "../../actions/orderActions";

// API function to fetch order items with error handling
const fetchOrderItems = async (OrderId) => {
  try {
    if (!OrderId) {
      console.warn("OrderId is required");
      return [];
    }

    const response = await fetch(
      `https://foodorderingbackend.dockyardsoftware.com/OrderItem/getOrderItems?OrderId=${OrderId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.ResultSet)) {
      return data.ResultSet;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch order items:", error);
    return [];
  }
};

// Helper function to safely parse and format amounts
const formatAmount = (amount, showCurrency = false) => {
  const numAmount = parseFloat(amount || 0);
  const formatted = numAmount.toFixed(2);
  return showCurrency ? `${formatted}` : formatted;
};

// Helper function to calculate order total from items
const calculateOrderTotal = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    const itemTotal = parseFloat(item.TotalAmount || 0);
    return total + itemTotal;
  }, 0);
};

const OrderTab = () => {
  const dispatch = useDispatch();
  const orderState = useSelector((state) => state.order || {});
  const {
    orders = [],
    loading = false,
    filters = {},
    searchQuery = "",
  } = orderState;

  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [orderItems, setOrderItems] = useState(new Map());
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Only fetch orders on mount, not on refresh (handleRefresh will do it)
  useEffect(() => {
    setError(null);
    dispatch(fetchOrders()).catch((err) => {
      setError("Failed to load orders");
      console.error("Error loading orders:", err);
    });
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setError(null);
      await dispatch(fetchOrders());
    } catch (err) {
      setError("Failed to refresh orders");
      console.error("Error refreshing orders:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [dispatch]);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        await dispatch(updateOrderStatus(orderId, newStatus));
        toast.success(`Order status updated to ${newStatus}!`);
        // Refresh orders after update
        setTimeout(() => {
          dispatch(fetchOrders());
        }, 500);
      } catch (err) {
        console.error("Error updating order status:", err);
        toast.error("Failed to update order status");
      }
    },
    [dispatch]
  );

  const toggleOrderExpansion = useCallback(
    async (orderId) => {
      if (!orderId) return;

      const newExpandedOrders = new Set(expandedOrders);

      if (expandedOrders.has(orderId)) {
        newExpandedOrders.delete(orderId);
      } else {
        newExpandedOrders.add(orderId);

        // Fetch order items if not already loaded
        if (!orderItems.has(orderId)) {
          setLoadingItems((prev) => new Set([...prev, orderId]));
          try {
            const items = await fetchOrderItems(orderId);
            setOrderItems((prev) => new Map(prev).set(orderId, items));
          } catch (error) {
            console.error("Failed to fetch order items:", error);
          } finally {
            setLoadingItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(orderId);
              return newSet;
            });
          }
        }
      }

      setExpandedOrders(newExpandedOrders);
    },
    [expandedOrders, orderItems]
  );

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    let filtered = orders;

    // Search
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          (order.OrderId && order.OrderId.toString().includes(query)) ||
          (order.TableId && order.TableId.toString().includes(query)) ||
          (order.OrderStatus && order.OrderStatus.toLowerCase().includes(query))
      );
    }

    // Filters
    if (filters.status) {
      filtered = filtered.filter((order) => order.Status === filters.status);
    }
    if (filters.orderStatus) {
      filtered = filtered.filter(
        (order) =>
          order.OrderStatus?.toLowerCase() === filters.orderStatus.toLowerCase()
      );
    }
    if (filters.tableNumber) {
      filtered = filtered.filter(
        (order) =>
          order.TableId &&
          order.TableId.toString().includes(filters.tableNumber)
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (order) => new Date(order.CreatedAt) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (order) =>
          new Date(order.CreatedAt) <= new Date(filters.dateTo + "T23:59:59")
      );
    }

    return filtered;
  }, [orders, filters, searchQuery]);

  const reversedOrders = useMemo(() => {
    return [...filteredOrders].reverse();
  }, [filteredOrders]);

  const paginatedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return reversedOrders.slice(startIdx, startIdx + pageSize);
  }, [reversedOrders, currentPage]);

  const getStatusIcon = useCallback((orderStatus) => {
    switch (orderStatus?.toLowerCase()) {
      case "pending":
        return <FaClock className="w-3 h-3" />;
      case "preparing":
        return <FaTruck className="w-3 h-3" />;
      case "ready":
      case "served":
        return <FaCheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaClock className="w-3 h-3" />;
    }
  }, []);

  const getStatusColor = useCallback((orderStatus) => {
    switch (orderStatus?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "served":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  }, []);

  const getOrderTotal = useCallback(
    (order) => {
      const items = orderItems.get(order.OrderId);
      if (items && items.length > 0) {
        const calculatedTotal = calculateOrderTotal(items);
        return calculatedTotal > 0
          ? calculatedTotal
          : parseFloat(order.TotalAmount || 0);
      }
      return parseFloat(order.TotalAmount || 0);
    },
    [orderItems]
  );

  const StatusUpdateModal = ({ isOpen, onClose, order }) => {
    const [selectedStatus, setSelectedStatus] = useState("pending");
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
      if (order?.OrderStatus) {
        setSelectedStatus(order.OrderStatus.toLowerCase());
      }
    }, [order]);

    const handleSubmit = (e) => {
      e.preventDefault();
      setIsConfirming(true);
    };

    const handleConfirm = () => {
      if (order) {
        handleUpdateStatus(order.OrderId, selectedStatus);
        setIsConfirming(false);
        onClose();
      }
    };

    if (!isOpen || !order) return null;

    const statusOptions = [
      {
        value: "pending",
        label: "Pending",
        description: "Order received, waiting to be prepared",
      },
      {
        value: "preparing",
        label: "Preparing",
        description: "Kitchen is working on this order",
      },
      {
        value: "ready",
        label: "Ready",
        description: "Order is ready for pickup/serving",
      },
      {
        value: "served",
        label: "Served",
        description: "Order has been served to customer",
      },
      {
        value: "cancelled",
        label: "Cancelled",
        description: "Order has been cancelled",
      },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Update Order Status
              </h3>
              <p className="text-sm text-gray-600">
                Order {order.OrderId} - Table {order.TableId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {!isConfirming ? (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStatus === option.value
                        ? "border-[#18749b] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1 ml-3">
                      <p className="font-medium text-gray-900">
                        {option.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="w-5 h-5 text-[#18749b]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Confirm Status Update
                  </h4>
                  <p className="text-xs text-gray-600">
                    Change order status to "
                    {
                      statusOptions.find((s) => s.value === selectedStatus)
                        ?.label
                    }
                    "?
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] transition-colors"
                >
                  <FaSave className="w-4 h-4" />
                  <span>Confirm</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const items = orderItems.get(order.OrderId) || [];
    const orderTotal = getOrderTotal(order);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order Details
              </h3>
              <p className="text-sm text-gray-600">
                Order {order.OrderId} - Table {order.TableId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Order Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Order ID:</span>{" "}
                    {order.OrderId}
                  </p>
                  <p>
                    <span className="font-medium">Table:</span> #{order.TableId}
                  </p>
                  {order.CreatedAt && (
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(order.CreatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </h4>
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    order.OrderStatus
                  )}`}
                >
                  {getStatusIcon(order.OrderStatus)}
                  <span className="ml-1 capitalize">
                    {order.OrderStatus || "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {items && items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Order Items
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Item Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={item.OrderItemId || index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.MenuItemName || "Unknown Item"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatAmount(item.Quantity || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatAmount(item.MenuItemPrice || 0, true)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatAmount(item.TotalAmount || 0, true)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: {formatAmount(orderTotal, true)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Error boundary component
  if (error) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Orders
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Title and Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#18749b] to-[#5A8FD1] rounded-lg">
            <FaReceipt className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSync className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Pagination Card */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredOrders.length)} to{" "}
            {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} items
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 font-medium">
              Page {currentPage}
            </span>
            <button
              onClick={() =>
                currentPage < Math.ceil(filteredOrders.length / pageSize) &&
                setCurrentPage(currentPage + 1)
              }
              disabled={currentPage >= Math.ceil(filteredOrders.length / pageSize)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters (Integrated in Card) */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Order ID, table..."
                  value={searchQuery}
                  onChange={(e) => dispatch(updateSearch(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                />
              </div>
            </div>

            {/* Order Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                value={filters.orderStatus || ""}
                onChange={(e) =>
                  dispatch(
                    updateFilters({ ...filters, orderStatus: e.target.value })
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Table Number Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Table
              </label>
              <div className="relative">
                <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Table #"
                  value={filters.tableNumber || ""}
                  onChange={(e) =>
                    dispatch(
                      updateFilters({ ...filters, tableNumber: e.target.value })
                    )
                  }
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => dispatch(resetFilters())}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaSync className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
            </div>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FaReceipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {orders.length === 0
                ? "No orders have been placed yet."
                : "Try adjusting your search or filters."}
            </p>
            {orders.length > 0 && (
              <button
                onClick={() => dispatch(resetFilters())}
                className="mt-4 px-4 py-2 text-sm font-medium text-[#18749b] hover:text-[#2c5a97]"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.map((order) => (
                    <React.Fragment key={order.OrderId}>
                      <tr className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-[#18749b]">
                                {order.OrderId}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Order {order.OrderId}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {order.TableId}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowStatusModal(true);
                              }}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(
                                order.OrderStatus
                              )}`}
                            >
                              {getStatusIcon(order.OrderStatus)}
                              <span className="ml-1 capitalize">
                                {order.OrderStatus || "Pending"}
                              </span>
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatAmount(getOrderTotal(order), true)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleOrderExpansion(order.OrderId)}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-xs font-medium text-[#18749b] rounded-full hover:bg-blue-100 transition-colors"
                          >
                            <FaShoppingBag className="w-3 h-3" />
                            <span>
                              {expandedOrders.has(order.OrderId)
                                ? "Hide"
                                : "Show"}{" "}
                              Items
                            </span>
                            {expandedOrders.has(order.OrderId) ? (
                              <FaChevronUp className="w-3 h-3" />
                            ) : (
                              <FaChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </td>


                      </tr>

                      {/* Expanded Order Items Row */}
                      {expandedOrders.has(order.OrderId) && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            {loadingItems.has(order.OrderId) ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#18749b] border-t-transparent"></div>
                                <span className="ml-2 text-sm text-gray-600">
                                  Loading items...
                                </span>
                              </div>
                            ) : (
                              <div className="max-w-4xl">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                  Order Items:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {orderItems
                                    .get(order.OrderId)
                                    ?.map((item, index) => (
                                      <div
                                        key={item.OrderItemId || index}
                                        className="bg-white rounded-lg p-3 border border-gray-200"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <h5 className="font-medium text-gray-900">
                                              {item.MenuItemName ||
                                                "Unknown Item"}
                                            </h5>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Item ID: {item.OrderItemId}
                                            </p>
                                          </div>
                                          <div className="text-right ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                              {formatAmount(item.Quantity || 0)}
                                              x{" "}
                                              {formatAmount(
                                                item.MenuItemPrice || 0,
                                                true
                                              )}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              Total:{" "}
                                              {formatAmount(
                                                item.TotalAmount || 0,
                                                true
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {paginatedOrders.map((order) => (
                <div
                  key={order.OrderId}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#18749b] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Order {order.OrderId}
                        </h4>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowStatusModal(true);
                            }}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:shadow-md transition-all ${getStatusColor(
                              order.OrderStatus
                            )}`}
                          >
                            {getStatusIcon(order.OrderStatus)}
                            <span className="ml-1 capitalize">
                              {order.OrderStatus || "Pending"}
                            </span>
                          </button>
                          <div
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              order.Status === "A"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {order.Status === "A" ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaTable className="w-4 h-4 text-gray-400" />
                          <span>Table #{order.TableId}</span>
                        </div>
                        <div className="flex items-center space-x-2 sm:col-span-2">
                          <span className="font-medium text-gray-900">
                            Amount: {formatAmount(getOrderTotal(order), true)}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Order Items Toggle */}
                      <button
                        onClick={() => toggleOrderExpansion(order.OrderId)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-full justify-center mb-4 mt-4"
                      >
                        <FaShoppingBag className="w-4 h-4" />
                        <span>
                          {expandedOrders.has(order.OrderId) ? "Hide" : "Show"}{" "}
                          Order Items
                        </span>
                        {expandedOrders.has(order.OrderId) ? (
                          <FaChevronUp className="w-4 h-4" />
                        ) : (
                          <FaChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {/* Mobile Expanded Items */}
                      {expandedOrders.has(order.OrderId) && (
                        <div className="mb-4">
                          {loadingItems.has(order.OrderId) ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#18749b] border-t-transparent"></div>
                              <span className="ml-2 text-sm text-gray-600">
                                Loading items...
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-gray-700">
                                Order Items:
                              </h5>
                              {orderItems
                                .get(order.OrderId)
                                ?.map((item, index) => (
                                  <div
                                    key={item.OrderItemId || index}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h6 className="font-medium text-gray-900 text-sm">
                                          {item.MenuItemName || "Unknown Item"}
                                        </h6>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Item ID: {item.OrderItemId}
                                        </p>
                                      </div>
                                      <div className="text-right ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                          {formatAmount(item.Quantity || 0)}x{" "}
                                          {formatAmount(
                                            item.MenuItemPrice || 0,
                                            true
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Total:{" "}
                                          {formatAmount(
                                            item.TotalAmount || 0,
                                            true
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-all"
                    >
                      <FaEye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderTab;
