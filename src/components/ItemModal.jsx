import React, { useState } from "react";
import { X, Plus, Minus, Clock, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api  from "../index"
import { sessionManager } from "../utils/sessionManager";
// Use the same image URL logic as MenuPage
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('/Images/MenuItems/')) {
    return `https://foodorderingbackend.dockyardsoftware.com${imagePath}`;
  }
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `https://foodorderingbackend.dockyardsoftware.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const ItemModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  // Initialize selected size when modal opens
  React.useEffect(() => {
    if (item && item.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0]);
    } else {
      setSelectedSize(null);
    }
    setQuantity(1); // Reset quantity when item changes
  }, [item]);

  if (!isOpen || !item) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("LKR", "Rs.");
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };


  const handleAddToCart = () => {

    // If there's no order in session, redirect to home. This prevents adding
    // items to a cart when there is no active order context (same UX as tracking page).
    const currentOrderId = sessionManager.getOrderId();
    if (!currentOrderId) {
      navigate('/');
      return;
    }

    let cartItem = { ...item };
    // If item has sizes, include selected size information
    if (item.sizes && item.sizes.length > 0 && selectedSize) {
      cartItem = {
        ...item,
        selectedSize: selectedSize,
        price: parseFloat(selectedSize.Price),
        displayName: `${item.name || item.MenuItemName} (${selectedSize.Size})`,
      };
    }
    // Pass selectedSize as third argument
    onAddToCart(cartItem, quantity, selectedSize);
    setQuantity(1);
    onClose();
  };

  const getCurrentPrice = () => {
    if (item.sizes && item.sizes.length > 0 && selectedSize) {
      return parseFloat(selectedSize.Price);
    }
    return item.Price || item.price || item.originalPrice || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "A":
        return "text-green-600 bg-green-50";
      case "I":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "A":
        return "Available";
      case "I":
        return "Unavailable";
      default:
        return "Unknown";
    }
  };

  const isInactive = item.Status === "I";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#18749b]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Backdrop - click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Bottom Sheet Container */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden transform transition-all duration-500 border-t border-gray-100 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          
          {/* Close Button */}
          <button
            className="absolute top-3 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            onClick={onClose}
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] scrollbar-hide">
          <div className="flex flex-col">
          {/* Image Section */}
          <div className="w-full h-56 sm:h-72 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="absolute inset-0 bg-gradient-to-br from-[#18749b]/5 to-teal-500/5"></div>

            {/* Status Badge */}
            {(item.Status === "A" || item.Status === "I") && (
              <div
                className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border-2 ${getStatusColor(
                  item.Status
                )} ${item.Status === "A" ? 'border-green-300' : 'border-red-300'}`}
              >
                {getStatusText(item.Status)}
              </div>
            )}

            <img
              src={getImageUrl(item.image) || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={item.MenuItemName || item.SubName || item.ItemName || item.name}
              className="relative w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
              }}
            />

            {/* Inactive Overlay */}
            {isInactive && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                <div className="bg-white rounded-2xl px-6 py-4 shadow-2xl border-4 border-red-200 transform hover:scale-105 transition-transform">
                  <span className="text-red-600 font-bold text-sm flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>Currently Unavailable</span>
                  </span>
                </div>
              </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          {/* Content Section */}
          <div className="w-full px-6 sm:px-8 py-6 sm:py-8">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {item.MenuItemName || item.SubName || item.ItemName || item.name}
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.Description || item.description || "Delicious menu item prepared with care and quality ingredients."}
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#18749b] to-teal-600 bg-clip-text text-transparent">
                  {formatPrice(getCurrentPrice())}
                </div>
              </div>
            </div>

            {/* Size Selection */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center text-base">
                  <div className="bg-[#18749b] rounded-lg p-1.5 mr-2">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  Size Options
                </h4>
                <div className="flex flex-col gap-3">
                  {item.sizes.map((size) => (
                    <div
                      key={size.MenuItemSizeId}
                      className={`group flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-102 ${
                        selectedSize?.MenuItemSizeId === size.MenuItemSizeId
                          ? "border-[#18749b] bg-gradient-to-r from-[#18749b]/10 to-teal-500/10 shadow-md"
                          : "border-gray-200 hover:border-[#18749b]/40 hover:bg-gradient-to-r hover:from-gray-50 hover:to-teal-50/30 shadow-sm hover:shadow-md"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            selectedSize?.MenuItemSizeId === size.MenuItemSizeId
                              ? "border-[#18749b] bg-[#18749b] shadow-lg"
                              : "border-gray-300 group-hover:border-[#18749b]/50"
                          }`}
                        >
                          {selectedSize?.MenuItemSizeId === size.MenuItemSizeId && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white animate-scaleIn"></div>
                          )}
                        </div>
                        <span className="font-semibold text-gray-800 text-base">
                          {size.Size}
                        </span>
                      </div>
                      <span className={`font-bold text-base ${
                        selectedSize?.MenuItemSizeId === size.MenuItemSizeId
                          ? "bg-gradient-to-r from-[#18749b] to-teal-600 bg-clip-text"
                          : ""
                      }`}>
                        {formatPrice(parseFloat(size.Price))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t-2 border-gray-100">
              <div className="flex items-center justify-between gap-4 pb-6">
                                  <h4 className="font-bold text-gray-900 flex items-center text-base">
                    <div className="bg-[#18749b] rounded-lg p-1.5 mr-2">
                      <ChefHat className="w-4 h-4 text-white" />
                    </div>
                    Quantity
                  </h4>
                <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                  <button
                    className={`px-4 py-2.5 rounded-l-xl transition-all duration-300 ${
                      quantity <= 1 || isInactive
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-[#18749b] hover:text-white active:scale-95"
                    }`}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isInactive}
                  >
                    <Minus size={18} strokeWidth={2.5} />
                  </button>
                  <span className="px-6 py-2.5 border-x-2 border-gray-200 text-gray-900 font-bold bg-white min-w-[60px] text-center text-lg">
                    {quantity}
                  </span>
                  <button
                    className={`px-4 py-2.5 rounded-r-xl transition-all duration-300 ${
                      isInactive
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-[#18749b] hover:text-white active:scale-95"
                    }`}
                    onClick={() => handleQuantityChange(1)}
                    disabled={isInactive}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform text-lg shadow-lg focus:outline-none focus:ring-4 active:scale-95 ${
                  isInactive
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "text-white bg-gradient-to-r from-[#18749b] to-teal-600 hover:from-[#156285] hover:to-teal-700 hover:scale-105 hover:shadow-xl focus:ring-[#18749b]/30"
                }`}
                onClick={handleAddToCart}
                disabled={isInactive}
              >
                {isInactive ? (
                  <>
                    <Clock size={22} strokeWidth={2.5} />
                    <span>Unavailable</span>
                  </>
                ) : (
                  <>
                    <Plus size={22} strokeWidth={2.5} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Additional Info (no preparation time) */}
              {item.SubName && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Category:</span>
                  <span className="text-gray-900 font-semibold capitalize bg-white px-3 py-1 rounded-lg text-sm border border-gray-200">
                    {item.SubName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(100%);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ItemModal;
