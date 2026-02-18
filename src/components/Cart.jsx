import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  CreditCard,
  ImageOff,
} from "lucide-react";
import { cartService } from "../services/cartService";
import { orderService } from "../services/order_user";
import { sessionManager } from "../utils/sessionManager";
import api from "../index";


const Cart = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCartUpdated,
  onOrderSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [userError, setUserError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      return sessionStorage.getItem('restaurant-payment-method') || 'cash';
    } catch (e) {
      return 'cash';
    }
  });


  const menuIds = JSON.parse(localStorage.getItem("menuIds") || "[]");

  const navigate = useNavigate();

  const [orderIdDisplay, setOrderIdDisplay] = useState(() => sessionManager.getOrderId());
  const [tableIdDisplay, setTableIdDisplay] = useState(() => sessionManager.getTableId());

  useEffect(() => {
    // Refresh displayed order/table when cart opens or items change
    setOrderIdDisplay(sessionManager.getOrderId());
    setTableIdDisplay(sessionManager.getTableId());
  }, [isOpen, cartItems]);

  const handleExploreMenu = () => {
    // Close the cart and navigate to the menu page
    if (typeof onClose === 'function') onClose();
    navigate('/menu');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("/Images/MenuItems/")) {
      return `https://foodorderingbackend.dockyardsoftware.com${imagePath}`;
    }
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `${api.defaults.baseURL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("LKR", "Rs.");

  const handleImageError = (itemId) => {
    setImageErrors((prev) => new Set([...prev, itemId]));
  };

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateItemCount = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  const validateCartItems = () => {
    const invalidItems = [];

    for (const item of cartItems) {
      const menuItemSizeId =
        item.selectedSize?.MenuItemSizeId || item.menuItemSizeId;

      if (!menuItemSizeId) {
        invalidItems.push({
          name: item.name,
          issue: "Missing MenuItemSizeId",
        });
      }

      if (!item.id) {
        invalidItems.push({
          name: item.name,
          issue: "Missing MenuItemId",
        });
      }

      if (!item.quantity || item.quantity <= 0) {
        invalidItems.push({
          name: item.name,
          issue: "Invalid quantity",
        });
      }
    }

    return invalidItems;
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      console.error("Cart is empty");
      setUserError("Your cart is empty. Add items to proceed.");
      return;
    }

    // Get tableId and orderId
    const tableId = sessionManager.getTableId();
    let orderId = sessionManager.getOrderId();

    // Validate tableId exists
    if (!tableId) {
      console.error("No table ID found");
      setUserError("No table ID found. Please scan the QR code again.");
      return;
    }

    // If no orderId, get or create active order for this table
    if (!orderId) {
      try {
        console.log("No orderId in storage, getting/creating active order for table:", tableId);
        const orderResponse = await orderService.getOrCreateActiveOrder(tableId);
        
        if (orderResponse.StatusCode === 200 && orderResponse.ResultSet) {
          orderId = orderResponse.ResultSet.OrderId;
          sessionManager.saveOrder(orderId); // Save it to sessionStorage
          console.log("✅ Got/created active order:", orderId);
        } else {
          throw new Error("Failed to get or create order");
        }
      } catch (error) {
        console.error("Failed to get/create order:", error);
        setUserError("Could not create order. Please try scanning the QR code again.");
        return;
      }
    }

    // Validate cart items before proceeding
    const invalidItems = validateCartItems();
    if (invalidItems.length > 0) {
      console.error("Invalid cart items:", invalidItems);
      setUserError(
        `Some items in your cart are invalid:\n${invalidItems
          .map((item) => `• ${item.name}: ${item.issue}`)
          .join("\n")}`
      );
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Starting checkout process...");
      console.log("Table ID:", tableId, "| Order ID:", orderId);
      console.log("Cart items:", cartItems);

      // Use existing active order (NEW: no need to create a new order)
      console.log("✅ Using active OrderId:", orderId);

      // Add items to order with better error handling
      console.log("🛒 Adding items to order...");
      const failedItems = [];
      const successfulItems = [];

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const menuItemSizeId =
          item.selectedSize?.MenuItemSizeId || item.menuItemSizeId;

        const orderItemData = {
          OrderId: orderId,
          MenuItemId: item.id,
          Quantity: item.quantity,
          MenuItemSizeId: menuItemSizeId,
        };

        console.log(`📦 Adding item ${i + 1}/${cartItems.length}:`, {
          itemName: item.name,
          data: orderItemData,
        });

        try {
          const response = await orderService.addOrderItem(orderItemData);
          console.log(`✅ Item ${i + 1} added successfully:`, response);
          successfulItems.push(item.name);
        } catch (itemError) {
          console.error(`❌ Failed to add item ${i + 1}:`, itemError);
          failedItems.push({
            name: item.name,
            error: itemError.message || itemError.toString(),
            data: orderItemData,
          });
        }
      }

      // Check results and act accordingly
      if (failedItems.length > 0) {
        console.error("❌ Some items failed to add:", failedItems);

        // If none succeeded, throw and show error
        if (successfulItems.length === 0) {
          throw new Error(
            `No items were added to the order. Issues: ${failedItems
              .map((item) => `${item.name}: ${item.error}`)
              .join("; ")}`
          );
        }

        // Partial success: preserve local cart so user can retry or retry specific items
        const msg = `Some items were added but some failed:\n${failedItems
          .map((it) => `• ${it.name}: ${it.error}`)
          .join("\n")}\nYour cart has been preserved so you can try again.`;
        setUserError(msg);
        console.warn(msg);
      } else {
        // All items added successfully -> update total and clear storage
        console.log("✅ All items added successfully!");

        // Update order total after adding all items
        console.log("💰 Updating order total...");
        await orderService.updateOrderTotal(orderId);
        console.log("✅ Order total updated");

        // store snapshot so checkout/receipt can still access selected items after clearing
        try {
          const snapshot = { items: cartItems, paymentMethod };
          sessionStorage.setItem('restaurant-cart-snapshot', JSON.stringify(snapshot));
        } catch (e) {
          console.warn('Failed to store cart snapshot', e);
        }

        // Clear cart and clear table info since order is complete
        cartService.clearCart();
        try { sessionManager.clearAll(); } catch (e) { console.warn('Failed to clear session/table', e); }

        if (typeof onCartUpdated === "function") onCartUpdated();
        if (typeof onOrderSuccess === "function") {
          console.log("Calling onOrderSuccess with order payload for orderId:", orderId);
          const payload = {
            orderId,
            items: cartItems,
            total: calculateTotal(),
            tableId: tableId,
            paymentMethod: sessionStorage.getItem('restaurant-payment-method') || 'cash',
          };
          onOrderSuccess(payload);
        }
        onClose();
      }
    } catch (error) {
      console.error("💥 Checkout failed:", error);

      // More detailed error message
      let errorMessage = "❌ Failed to place order. ";

      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Unknown error occurred.";
      }

  errorMessage += "\n\nPlease try again or contact staff for assistance.";
  console.error(errorMessage);
  setUserError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    isOpen && (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="flex justify-end h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full w-full sm:max-w-md lg:max-w-lg bg-white shadow-2xl flex flex-col transform transition-all duration-300 ease-out animate-in slide-in-from-right">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#18749b] via-teal-600 to-teal-700 text-white p-5 sm:p-7 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl border border-white/20 shadow-lg">
                      <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Your Cart</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-blue-100 text-sm sm:text-base font-medium">
                          {calculateItemCount()} {calculateItemCount() === 1 ? "item" : "items"}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                            <span className="text-xs text-white/80">Order</span>
                            <span className="font-semibold">{orderIdDisplay ?? '—'}</span>
                          </span>

                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                            <span className="text-xs text-white/80">Table</span>
                            <span className="font-semibold">{tableIdDisplay ?? '—'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2.5 hover:bg-white/15 rounded-xl transition-all duration-200 touch-manipulation border border-white/10 hover:border-white/30"
                    aria-label="Close cart"
                  >
                    <X className="w-6 h-6 transition-opacity" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Items */}
              {userError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-4">
                  <p className="text-sm text-red-700 whitespace-pre-line">{userError}</p>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 sm:p-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#18749b]/20 to-teal-500/20 rounded-full blur-2xl"></div>
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-[#18749b]/10 to-teal-500/10 rounded-3xl flex items-center justify-center border-2 border-[#18749b]/20">
                        <ShoppingBag className="w-14 h-14 sm:w-16 sm:h-16" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-600 mb-8 text-sm sm:text-base max-w-xs leading-relaxed">
                      Add some delicious items from our menu to get started!
                    </p>
                    <button
                      onClick={handleExploreMenu}
                      className="bg-gradient-to-r from-[#18749b] to-teal-600 hover:from-[#156285] hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 touch-manipulation text-base"
                    >
                      Explore Menu
                    </button>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 space-y-4">
                    {cartItems.map((item, index) => {
                      const menuItemSizeId = item.selectedSize?.MenuItemSizeId || item.menuItemSizeId;
                      const hasValidSizeId = !!menuItemSizeId;
                      // Use composite key for React key to avoid duplicate keys for same id with different sizes
                      const cartKey = `${item.id}_${menuItemSizeId || ''}`;
                      return (
                        <div
                          key={cartKey}
                          className={`group bg-white rounded-2xl p-4 sm:p-5 border-2 shadow-md transition-all duration-200 hover:shadow-lg ${!hasValidSizeId ? "border-red-300 bg-red-50" : "border-gray-100 hover:border-[#18749b]/30"}`}
                          style={{ animation: `slideInUp 0.3s ease-out ${index * 40}ms both` }}
                        >
                          <div className="flex items-start space-x-4">
                            {/* Image */}
                            <div className="relative flex-shrink-0">
                              {item.image && !imageErrors.has(item.id) ? (
                                <div className="relative overflow-hidden rounded-2xl">
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover shadow-md ring-2 ring-gray-200 transition-all duration-200"
                                    onError={() => handleImageError(item.id)}
                                  />
                                </div>
                              ) : (
                                <div className="relative overflow-hidden rounded-2xl">
                                  <img
                                    src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400"
                                    alt="Default food"
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover shadow-md ring-2 ring-gray-200 transition-all duration-200"
                                  />
                                </div>
                              )}
                            </div>
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex-1 pr-2">
                                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight mb-1">
                                    {item.name}
                                  </h3>
                                  {/* Size Information */}
                                  {item.selectedSize && (
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${hasValidSizeId ? "bg-[#18749b]/10 border-[#18749b]/20" : "bg-red-100 text-red-800 border-red-200"}`}>
                                        Size: {item.selectedSize.Size}
                                      </span>
                                      {item.selectedSize.MenuItemSizeId && (
                                        <span className="text-xs text-gray-500">ID: {item.selectedSize.MenuItemSizeId}</span>
                                      )}
                                    </div>
                                  )}
                                  {item.size && !item.selectedSize && (
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${hasValidSizeId ? "bg-[#18749b]/10 border-[#18749b]/20" : "bg-red-100 text-red-800 border-red-200"}`}>Size: {item.size}</span>
                                      {item.menuItemSizeId && (<span className="text-xs text-gray-500">ID: {item.menuItemSizeId}</span>)}
                                    </div>
                                  )}
                                  {/* Error warning for invalid items */}
                                  {!hasValidSizeId && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">⚠️ Invalid size configuration</span>
                                    </div>
                                  )}
                                  {item.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">{item.description}</p>
                                  )}
                                  {item.menuItemName && item.menuItemName !== item.name && (
                                    <p className="text-xs text-gray-500 mt-1">Menu: {item.menuItemName}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => onRemoveItem(item.id, menuItemSizeId)}
                                  className="ml-2 p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 touch-manipulation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              {/* Price & Quantity */}
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
                                  <button
                                    onClick={() =>
                                      onUpdateQuantity(
                                        item.id,
                                        Math.max(1, item.quantity - 1),
                                        menuItemSizeId
                                      )
                                    }
                                    className="p-2 sm:p-2.5 hover:bg-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                                  </button>
                                  <span className="px-3 sm:px-4 py-1 font-bold text-gray-900 min-w-[2.5rem] sm:min-w-[3rem] text-center text-sm sm:text-base">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      onUpdateQuantity(
                                        item.id,
                                        item.quantity + 1,
                                        menuItemSizeId
                                      )
                                    }
                                    className="p-2 sm:p-2.5 hover:bg-white rounded-full transition-all duration-200 touch-manipulation"
                                  >
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                                  </button>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {item.selectedSize ? `${item.selectedSize.Size} - Total:` : "Total:"}
                                  </div>
                                  <div className="font-bold text-gray-900 text-sm sm:text-base">
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                  {item.quantity > 1 && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {formatPrice(item.price)} each
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 sm:p-7 space-y-5">
                  <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-md border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Subtotal ({calculateItemCount()} items)
                      </span>
                      <span className="font-bold text-gray-900 text-base sm:text-lg">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Service Charge
                      </span>
                      <span className="font-bold text-gray-900 text-base sm:text-lg">
                        Rs. 0
                      </span>
                    </div>
                    <div className="border-t-2 border-gray-100 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          Total Amount
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#18749b] to-teal-600 bg-clip-text text-transparent">
                          {formatPrice(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>

                    {/* Payment method selector */}
                    <div className="flex items-center justify-between px-2 sm:px-4">
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center space-x-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={() => { setPaymentMethod('cash'); try { sessionStorage.setItem('restaurant-payment-method','cash'); } catch(e){} }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Cash</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => { setPaymentMethod('card'); try { sessionStorage.setItem('restaurant-payment-method','card'); } catch(e){} }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Card</span>
                        </label>
                      </div>
                    </div>

                  {/* Validation warnings */}
                  {validateCartItems().length > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm">
                      <h4 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Cart Issues Detected
                      </h4>
                      <p className="text-red-700 text-xs leading-relaxed">
                        Some items have configuration issues. Please remove and
                        re-add them from the menu.
                      </p>
                    </div>
                  )}

                  {/* Mobile: continue adding items (visible only on small screens) */}
                  <button
                    onClick={handleExploreMenu}
                    className="w-full md:hidden mb-3 bg-white text-[#18749b] border border-[#18749b]/20 font-semibold py-3 rounded-2xl transition-all duration-150 hover:bg-[#f8feff]"
                  >
                    Continue adding items
                  </button>

                  <button
                    className="w-full bg-gradient-to-r from-[#18749b] to-teal-600 hover:from-[#156285] hover:to-teal-700 text-white py-4 sm:py-5 rounded-2xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl touch-manipulation text-base sm:text-lg"
                    onClick={handleCheckout}
                    disabled={
                      loading ||
                      cartItems.length === 0 ||
                      validateCartItems().length > 0
                    }
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>
                          Placing Order...
                        </span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" strokeWidth={2.5} />
                        <span>
                          Place Order • {formatPrice(calculateTotal())}
                        </span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center leading-relaxed px-3">
                    By placing this order, you agree to our terms of service and
                    privacy policy.
                  </p>
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slide-in-from-right {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-in { animation: slide-in-from-right 0.3s ease-out; }
            .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .touch-manipulation { touch-action: manipulation; }
          `}</style>
        </div>
      )
  );
};

export default Cart;