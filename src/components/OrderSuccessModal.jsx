
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, Sparkles } from "lucide-react";


const OrderSuccessModal = ({ isOpen, onClose, prepTime = "15-20 min", orderId }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTrackOrder = () => {
    onClose?.();
    navigate("/track-order");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-500 p-4 animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 border border-gray-100 overflow-hidden ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Success gradient header */}
        <div className="relative bg-gradient-to-br from-[#18749b] via-teal-500 to-teal-600 px-8 py-10 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>



          <div className="relative text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-2xl sm:text-3xl font-bold">Order Placed!</h2>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-blue-50 text-base leading-relaxed">
              Thank you! Your order is being prepared.
            </p>
          </div>
        </div>

        {/* Minimal content section */}
        <div className="px-6 py-6 flex flex-col gap-6 items-center">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-base font-semibold text-gray-700">Estimated: <span className="bg-gradient-to-r from-[#18749b] to-teal-600 bg-clip-text text-transparent font-bold">{prepTime}</span></span>
          </div>
          <div className="flex flex-col w-full gap-3">
            <button
              className="w-full bg-gradient-to-r from-[#18749b] to-teal-600 hover:from-[#156285] hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-base shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#18749b]/30 active:scale-95"
              onClick={onClose}
            >
              Continue Ordering
            </button>
            <button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-base shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400/30 active:scale-95"
              onClick={handleTrackOrder}
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessModal;
