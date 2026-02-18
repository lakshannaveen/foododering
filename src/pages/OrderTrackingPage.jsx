import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  ChefHat,
  ArrowLeft,
} from "lucide-react";
import Header from "../components/Header";
import api from "../index";
import { orderService } from "../services/order_user";

const OrderTrackingPage = () => {
  const { OrderId: urlOrderId } = useParams();

  const [orderId, setOrderId] = useState(urlOrderId || "");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [hasPlayedReadySound, setHasPlayedReadySound] = useState(false);
  const [promptVisible, setPromptVisible] = useState(true);

  const API_BASE_URL = api?.defaults?.baseURL || "";

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("LKR", "Rs.");

  const STATUS_STEPS = ["pending", "preparing", "ready", "served"];

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

  const getStatusIcon = () => {
    switch (orderStatus.toLowerCase()) {
      case "pending":
        return <Package className="w-5 h-5 text-white" />;
      case "preparing":
        return <ChefHat className="w-5 h-5 text-white" />;
      case "ready":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "served":
        return <CheckCircle className="w-5 h-5 text-white" />;
      default:
        return <Clock className="w-5 h-5 text-white" />;
    }
  };

  const playReadyNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Order Ready!", {
        body: `Your order #${orderId} is ready!`,
        icon: "/favicon.ico",
      });
    }
  };

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const fetchOrderStatus = async (orderIdToFetch) => {
    try {
      const resp = await orderService.getOrderDetails(orderIdToFetch);

      if (resp.StatusCode === 200 && resp.ResultSet && resp.ResultSet.length > 0) {
        const orderData = resp.ResultSet[0];
        const status =
          orderData.OrderStatus ||
          orderData.OrderStatusName ||
          orderData.status ||
          "pending";
        setOrderStatus(status);

        if (status.toLowerCase() === "ready" && !hasPlayedReadySound) {
          playReadyNotification();
          setHasPlayedReadySound(true);
        }
      } else {
        setOrderStatus("pending");
      }
    } catch (err) {
      console.error("Status fetch error:", err);
      setOrderStatus("pending");
    }
  };

  const fetchOrderItems = async (orderIdToFetch) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/OrderItem/getOrderItems?OrderId=${orderIdToFetch}`
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.Result || "Failed to fetch order items");
        setOrderDetails(null);
        return;
      }

      const data = await response.json();
      const orderItems = Array.isArray(data) ? data : data?.ResultSet || [];

      if (!orderItems.length) {
        setError("No items found for this order. Please check your Order ID.");
        setOrderDetails(null);
        return;
      }

      const transformedOrder = {
        id: orderIdToFetch,
        items: orderItems.map((item, index) => ({
          id: item.OrderItemId || index + 1,
          name: item.MenuItemName || "Menu Item",
          quantity: parseFloat(item.Quantity) || 1,
          totalAmount: parseFloat(item.TotalAmount) || 0,
        })),
        total: orderItems.reduce(
          (sum, item) => sum + (parseFloat(item.TotalAmount) || 0),
          0
        ),
      };

      setOrderDetails(transformedOrder);
      await fetchOrderStatus(orderIdToFetch);
      setPromptVisible(false);
    } catch (err) {
      setError("Order not found. Please check your Order ID.");
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (orderId.trim()) {
      fetchOrderItems(orderId.trim());
    }
  };

  const handleBack = () => {
    setOrderDetails(null);
    setOrderId("");
    setOrderStatus("pending");
    setError(null);
    setPromptVisible(true);
  };

  const currentStatusIndex = STATUS_STEPS.indexOf(
    orderStatus?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <Header showCart={false} hideLogout={true} />

      <div className="container mx-auto px-4 max-w-4xl py-8">
        {promptVisible && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Track Your Order</h2>

            <div className="flex space-x-3">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter Order ID"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#18749b]/30"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-xl font-semibold"
              >
                Track
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-16 h-16 border-4 border-[#18749b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-bold">Searching for your order...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setPromptVisible(true);
              }}
              className="px-6 py-3 bg-[#18749b] text-white rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}

        {orderDetails && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8">

            <button
              onClick={handleBack}
              className="flex items-center text-[#18749b] font-semibold mb-4 hover:underline"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Enter Another Order
            </button>

            <h2 className="text-2xl font-bold mb-6">
              Order #{orderDetails.id}
            </h2>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${getStatusColor()} shadow-lg`}>
                  {getStatusIcon()}
                </div>
                <span className="font-bold">
                  {orderStatus.toUpperCase()}
                </span>
              </div>

              <div className="h-3 bg-gray-300 rounded-full mb-6">
                <div
                  style={{ width: `${getStatusPercentage()}%` }}
                  className={`h-3 rounded-full transition-all duration-500 ${getStatusColor()}`}
                ></div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {STATUS_STEPS.map((status, index) => {
                  const isActive = currentStatusIndex >= index;
                  return (
                    <div key={status} className="text-center">
                      <div
                        className={`w-4 h-4 mx-auto mb-2 rounded-full ${
                          isActive ? getStatusColor() : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-sm capitalize">
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {orderDetails.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-3"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {formatPrice(item.totalAmount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-right">
              <span className="text-xl font-bold">
                Total: {formatPrice(orderDetails.total)}
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
