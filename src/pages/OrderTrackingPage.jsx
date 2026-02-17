import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  Star,
  Package,
  ChefHat,
  Utensils,
  ShoppingBag,
} from "lucide-react";
import Header from "../components/Header";
import Cart from "../components/Cart";
import { cartService } from "../services/cartService";
import api from "../index"; // Import from index.js
import { sessionManager } from "../utils/sessionManager";
import { orderService } from "../services/order_user";

const OrderTrackingPage = () => {
  const { OrderId: urlOrderId } = useParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(urlOrderId || "");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasPlayedReadySound, setHasPlayedReadySound] = useState(false);
  // Cart side panel state and handlers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  // Cart logic
  const loadCart = () => {
    const items = cartService.getCart();
    setCartItems(items);
    setCartItemsCount(cartService.getCartItemsCount());
  };

  const handleCartClick = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);
  const handleUpdateQuantity = (itemId, newQuantity) => {
    cartService.updateQuantity(itemId, newQuantity);
    loadCart();
  };
  const handleRemoveItem = (itemId) => {
    cartService.removeFromCart(itemId);
    loadCart();
  };
  const handleCartUpdated = () => loadCart();

  useEffect(() => {
    loadCart();
  }, []);
 const API_BASE_URL = api.defaults.baseURL;
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("LKR", "Rs.");

  // Fetch order status from API
  const fetchOrderStatus = async (orderIdToFetch) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Order/GetOrderById?OrderId=${orderIdToFetch}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order status");
      }

      const data = await response.json();
      console.log("Order status API response:", data);

      // Handle different response formats
      let orderData = data;
      if (
        data.ResultSet &&
        Array.isArray(data.ResultSet) &&
        data.ResultSet.length > 0
      ) {
        orderData = data.ResultSet[0];
      }

      if (orderData) {
        const status = orderData.OrderStatus || orderData.Status || "pending";
        const previousStatus = orderStatus;

        setOrderStatus(status.toLowerCase());
        setOrderInfo({
          orderId: orderData.OrderId,
          tableId: orderData.TableId,
          totalAmount: parseFloat(orderData.TotalAmount) || 0,
          status: orderData.Status,
        });
        setLastUpdated(new Date());

        // Play sound when status changes to "ready"
        if (
          status.toLowerCase() === "ready" &&
          previousStatus !== "ready" &&
          !hasPlayedReadySound
        ) {
          playReadyNotification();
          setHasPlayedReadySound(true);
        }

        // Reset sound flag if status changes away from ready
        if (status.toLowerCase() !== "ready") {
          setHasPlayedReadySound(false);
        }
      }
    } catch (err) {
      console.error("Error fetching order status:", err);
      // Don't set error here as it might interfere with order items display
    }
  };

  // Play notification sound when order is ready
  const playReadyNotification = () => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create a simple notification tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.6);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("Order Ready!", {
          body: `Your order #${orderId} is ready for pickup!`,
          icon: "/favicon.ico",
        });
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch order items from API
  const fetchOrderItems = async (orderIdToFetch) => {
    if (!orderIdToFetch) return;

    try {
      setLoading(true);
      setError(null);
      setSearchAttempted(true);

      // Always attempt to parse JSON body even if HTTP status is non-2xx
      const response = await fetch(
        `${API_BASE_URL}/OrderItem/getOrderItems?OrderId=${orderIdToFetch}`
      );

      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.warn('Failed to parse order items response JSON', parseErr);
        data = null;
      }


      // Handle different response formats. If ResultSet is null or empty,
      // treat as an empty list (order exists but has no items yet).
      let orderItems = [];
      if (Array.isArray(data)) {
        orderItems = data;
      } else if (data && Array.isArray(data.ResultSet)) {
        orderItems = data.ResultSet;
      } else if (data && data.ResultSet === null) {
        // Explicit null ResultSet from backend -> zero items
        orderItems = [];
      } else if (data && Array.isArray(data.orderItems)) {
        orderItems = data.orderItems;
      } else if (data && Array.isArray(data.data)) {
        orderItems = data.data;
      } else if (data && data.StatusCode && (data.ResultSet === undefined)) {
        // Backend may use StatusCode to indicate result; no ResultSet means no items
        orderItems = [];
      } else if (data == null) {
        // No JSON body - assume empty
        orderItems = [];
      } else {
        // Unexpected shape: log and treat as empty so UI can still show order status
        console.log("Unexpected API response format for order items:", data);
        orderItems = [];
      }

      // Transform API data to match component format
      const transformedOrder = {
        id: orderIdToFetch,
        orderId: orderIdToFetch,
        tableId: orderItems[0]?.TableId || null,
        items: orderItems.map((item, index) => ({
          id: item.OrderItemId || index + 1,
          name: item.MenuItemName || "Menu Item",
          price: parseFloat(item.MenuItemPrice) || 0,
          quantity: parseFloat(item.Quantity) || 1,
          totalAmount: parseFloat(item.TotalAmount) || 0,
          image:
            item.ImageUrl ||
            `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500&q=80`,
          specialInstructions: item.SpecialInstructions || null,
          menuItemSizeId: item.MenuItemSizeId || null,
        })),
        total: orderItems.reduce(
          (sum, item) => sum + (parseFloat(item.TotalAmount) || 0),
          0
        ),
        orderTime: new Date().toISOString(),
      };

      setOrderDetails(transformedOrder);
      setError(null);

      // Also fetch order status (will populate orderInfo/status). Even if there are
      // no items, the order may exist and have a status.
      await fetchOrderStatus(orderIdToFetch);
    } catch (err) {
      console.error("Error fetching order items:", err);
      // Do not treat empty-result responses as fatal here. If there's a real error
      // (network, parse failure), show a helpful message and clear orderDetails.
      setError(
        err.message ||
          "Failed to load order details. Please check your order ID and try again."
      );
      // Keep orderDetails as-is only if it was previously set. If not, clear it.
      if (!orderDetails) {
        setOrderDetails(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (orderId.trim()) {
      fetchOrderItems(orderId.trim());
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Auto-load order from URL, session, or create/get active order for table
  useEffect(() => {
    // If there's no order in session and no order in the URL, redirect to home.
    // This prevents users navigating directly to the tracking page without an order.
    const sessionOrderId = sessionManager.getOrderId();
    if (!sessionOrderId && !urlOrderId) {
      navigate('/');
      return;
    }
    const initLoad = async () => {
      try {
        // 1) If orderId is present in URL, use it
        if (urlOrderId) {
          await fetchOrderItems(urlOrderId);
          return;
        }

        // 2) Try to load orderId from sessionManager
        const existingOrderId = sessionManager.getOrderId();
        if (existingOrderId) {
          await fetchOrderItems(existingOrderId);
          return;
        }

        // 3) No orderId found: try to get or create active order for this table
        const tableId = sessionManager.getTableId();
        if (tableId) {
          const resp = await orderService.getOrCreateActiveOrder(tableId);
          if (resp && resp.StatusCode === 200) {
            // resp.ResultSet might be an object or array depending on backend
            let newOrderId = null;
            if (Array.isArray(resp.ResultSet) && resp.ResultSet.length > 0) {
              newOrderId = resp.ResultSet[0].OrderId || resp.ResultSet[0].orderId;
            } else if (resp.ResultSet && typeof resp.ResultSet === 'object') {
              newOrderId = resp.ResultSet.OrderId || resp.ResultSet.orderId;
            } else if (resp.ResultSet && typeof resp.ResultSet === 'string') {
              newOrderId = resp.ResultSet;
            }

            if (newOrderId) {
              // persist and load
              sessionManager.saveOrder(newOrderId);
              await fetchOrderItems(newOrderId);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Auto-load order failed:', err);
      }
    };

    initLoad();
  }, [urlOrderId]);

  // Poll for order status updates
  useEffect(() => {
    if (!orderDetails) return;

    const pollInterval = setInterval(() => {
      fetchOrderStatus(orderDetails.id);
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [orderDetails]);

  const getStatusPercentage = () => {
    switch (orderStatus.toLowerCase()) {
      case "pending":
        return 10;
      case "preparing":
        return 40;
      case "ready":
        return 90;
      case "served":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusMessage = () => {
    switch (orderStatus.toLowerCase()) {
      case "pending":
        return "Order pending";
      case "preparing":
        return "Preparing your food";
      case "ready":
        return "Ready for pickup";
      case "served":
        return "Order served";
      default:
        return "Tracking your order";
    }
  };

  const getStatusIcon = () => {
    switch (orderStatus.toLowerCase()) {
      case "pending":
        return <Package className="w-5 h-5" />;
      case "preparing":
        return <ChefHat className="w-5 h-5" />;
      case "ready":
        return <CheckCircle className="w-5 h-5" />;
      case "served":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString([], options);
  };

  const getStatusColor = () => {
    switch (orderStatus.toLowerCase()) {
      case "pending":
        return "bg-[#18749b]";
      case "preparing":
        return "bg-yellow-500";
      case "ready":
        return "bg-green-500";
      case "served":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  // Prepare status ordering for step indicators
  const STATUS_STEPS = ["pending", "preparing", "ready", "served"];
  const currentStatusIndex = Math.max(0, STATUS_STEPS.indexOf(orderStatus?.toLowerCase()));

  return (

    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <Header
        cartItemsCount={cartItemsCount}
        onCartClick={handleCartClick}
        onMenuToggle={() => {}}
      />
      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCartUpdated={handleCartUpdated}
      />

  <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Loading State */}
        {loading && (
          <div className="min-h-[200px] bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="w-16 h-16 border-4 border-[#18749b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg sm:text-xl text-gray-800 font-bold mb-2">Searching for your order...</p>
              <p className="text-sm text-gray-500">Please wait a moment</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 border-t-4 border-red-500">
            <div className="text-center py-8 sm:py-12">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Order Not Found
              </h2>
              <div className="w-16 h-1 bg-red-500 mx-auto mb-4 rounded-full"></div>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setSearchAttempted(false);
                  setOrderId("");
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-xl sm:rounded-2xl hover:from-[#156285] hover:to-teal-700 transition-all duration-200 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Try Another Order ID
              </button>
            </div>
          </div>
        )}

        {/* Order Details */}
        {orderDetails && !loading && (
          <>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <ChefHat className="w-7 h-7 mr-3" />
                    Order Details
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-[#18749b] to-teal-600 rounded-full"></div>
                </div>
                {orderStatus === 'pending' && (
                  <span className="flex items-center px-4 py-2 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-full text-sm font-semibold shadow-md">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Active
                  </span>
                )}
              </div>

              {/* Status Progress */}
              <div className="mb-8 sm:mb-10 bg-gradient-to-br from-gray-50 to-white p-5 sm:p-6 rounded-2xl border-2 border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div
                      className={`p-3 sm:p-4 rounded-full ${getStatusColor()} text-white shadow-lg`}
                    >
                      {getStatusIcon()}
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-bold text-gray-900 block">
                        {getStatusMessage()}
                      </span>
                      {orderStatus &&
                        !["served"].includes(orderStatus.toLowerCase()) && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">Preparing your delicious meal...</p>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-bold bg-[#18749b]/10 px-3 py-1 rounded-full">
                      {getStatusPercentage()}%
                    </span>
                  </div>
                </div>

                <div className="relative mb-6">
                  <div className="overflow-hidden h-3 sm:h-4 mb-6 sm:mb-8 text-xs flex rounded-full bg-gray-300 shadow-inner">
                    <div
                      style={{ width: `${getStatusPercentage()}%` }}
                      className={`shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getStatusColor()} rounded-full`}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 sm:gap-5">
                  {STATUS_STEPS.map((status, index) => {
                    const isActive = currentStatusIndex >= index;
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full mb-2 sm:mb-3 transition-all duration-300 shadow-md ${
                            isActive
                              ? getStatusColor() + " ring-4 ring-offset-2 ring-offset-white scale-110"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span
                          className={`text-xs sm:text-sm text-center leading-tight font-medium ${
                            orderStatus?.toLowerCase() === status
                              ? "font-bold"
                              : "text-gray-500"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t-2 border-gray-200 pt-6 sm:pt-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <Utensils className="w-6 h-6 mr-3" />
                  Order Items
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[#18749b] to-teal-600 rounded-full mb-6"></div>
                <div className="space-y-4 sm:space-y-6">
                  {orderDetails.items && orderDetails.items.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mb-4 text-gray-600">
                        This order has no items yet.
                      </div>
                      <button
                        onClick={() => navigate('/menu')}
                        className="px-8 py-4 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
                      >
                        Browse Menu
                      </button>
                    </div>
                  ) : (
                    orderDetails.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-[#18749b]/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg mb-1">
                          {item.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          {formatPrice(item.price)} each
                        </p>
                        {item.menuItemSizeId && (
                          <p className="text-xs text-gray-500 mb-2">
                            Size ID: {item.menuItemSizeId}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-xs sm:text-sm text-gray-500 italic bg-white px-2 py-1 rounded">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm sm:text-base lg:text-lg mb-2">
                          {formatPrice(item.totalAmount)}
                        </p>
                        <span className="text-xs font-bold text-[#18749b] bg-[#18749b]/10 px-2 py-1 rounded">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))) }
                </div>

                {/* Order Summary (match CheckoutPage style) */}
                <div className="mt-6 sm:mt-8">
                  <div className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-xl mb-3">
                    <span className="text-gray-700 font-semibold flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Table Number
                    </span>
                    <span className="font-bold text-gray-900 text-xl py-1 rounded-lg">#{orderInfo?.tableId || orderDetails.tableId || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-semibold">Order ID</span>
                    <span className="font-bold text-gray-900 text-xl py-1 rounded-lg">#{orderDetails.id}</span>
                  </div>

                  <div className="bg-gradient-to-r from-[#18749b] to-teal-600 rounded-2xl p-6 mt-6 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total Amount</span>
                      <span className="text-3xl sm:text-4xl font-bold text-white">{formatPrice(orderInfo?.totalAmount || orderDetails.total)}</span>
                    </div>
                    <p className="text-blue-100 text-sm mt-2">≈ ${( (orderInfo?.totalAmount || orderDetails.total) / 300 ).toFixed(2)} USD</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
  </div>
    </div>
  );
};

export default OrderTrackingPage;
