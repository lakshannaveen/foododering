import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, MapPin, Clock, Phone, CreditCard } from "lucide-react";
import { sessionManager } from "../utils/sessionManager";

// Import logo from assets
import logoImage from "../assets/hj.png";

const Header = ({ cartItemsCount, onCartClick, onOrderTrackingClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState(2); // Mock active orders count
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target.closest(".mobile-menu-container") === null &&
        event.target.closest(".mobile-menu-button") === null
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTrackOrderClick = () => {
    setIsMenuOpen(false);
    navigate("/track-order");
    // Also call the prop function if provided
    if (onOrderTrackingClick) {
      onOrderTrackingClick();
    }
  };

  const handleCheckoutClick = () => {
      setIsMenuOpen(false);
      navigate('/checkout');
    
  };

  return (
  <header className="bg-gradient-to-r from-white/70 via-teal-50/80 to-white/70 backdrop-blur-xl shadow-2xl sticky top-0 z-50 w-full border-b border-blue-100/60 ">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Left section - Mobile menu + Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
            {/* Mobile menu button */}
            <button
              className="mobile-menu-button md:hidden p-2 rounded-xl bg-white/70 hover:bg-[#18749b]/10 border border-[#18749b]/20 shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#18749b]/30"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>

            {/* Enhanced Logo and Brand - clickable */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 cursor-pointer select-none" onClick={() => navigate('/menu')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/menu'); }}>
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#18749b] to-teal-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-200 blur-md"></div>
                <img
                  src={logoImage}
                  alt="Ocean Breeze Restaurant"
                  className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover shadow-xl ring-2 sm:ring-3 ring-white/80 group-hover:ring-[#18749b]/40 transition-all duration-200 transform group-hover:scale-105 border-2 border-white/60"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#18749b]/10 to-teal-400/10"></div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold leading-tight truncate">
                  <span className="bg-gradient-to-r from-[#18749b] to-teal-600 bg-clip-text text-transparent hover:from-[#156285] hover:to-teal-700 transition-all duration-200">
                    Ocean Breeze
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right section - Order Tracking, Cart, and Status */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Order Tracking - Desktop (visible on medium screens and up) */}
            <button
              onClick={handleTrackOrderClick}
              className="hidden md:flex relative group px-2 sm:px-3 lg:px-4 py-2 rounded-xl bg-white/70 hover:bg-[#18749b]/10 border border-[#18749b]/20 shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 font-semibold focus:outline-none focus:ring-2 focus:ring-[#18749b]/30"
              aria-label="Track orders"
            >
              <span className="text-xs sm:text-sm lg:text-base whitespace-nowrap">
                <span className="hidden lg:inline">Order </span>Tracking
              </span>
            </button>

            {/* Checkout button removed */}

            {/* Cart button */}
            <button
              onClick={onCartClick}
              className="relative group p-2 sm:p-3 rounded-xl bg-white/70 hover:bg-[#18749b]/10 border border-[#18749b]/20 shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#18749b]/30"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center rounded-full shadow-lg border border-white/60">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </span>
              )}

            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-container md:hidden">
          <div
            className=""
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="relative bg-gradient-to-br from-white/80 to-teal-50/90 backdrop-blur-xl border-t border-blue-100/60 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 space-y-3 sm:space-y-4">
              {/* Mobile Order Tracking */}
              <button
                onClick={handleTrackOrderClick}
                className="w-full flex items-center justify-center space-x-3 px-4 sm:px-5 py-3 sm:py-4 text-[black] bg-white/70 hover:bg-[lightgreen]/10 border border-[#18749b]/20 rounded-xl transition-all duration-200 font-semibold active:scale-95 shadow-md focus:outline-none focus:ring-2 focus:ring-[#18749b]/30"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[black]" />
                  <span className="text-base">Track Your Orders</span>
                </div>
              </button>

              {/* Mobile Checkout removed */}




              {/* Mobile Cart Summary */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onCartClick?.();
                }}
                className="w-full flex items-center justify-center space-x-3 px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-[#18749b] to-teal-600 hover:from-[#156285] hover:to-teal-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-base">View Cart</span>
                </div>
                {cartItemsCount > 0 && (
                  <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {cartItemsCount} {cartItemsCount === 1 ? "item" : "items"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
