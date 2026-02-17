import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Sparkles, Clock } from "lucide-react";

const PaymentSuccessModal = ({ isOpen, onClose, orderId, prepTime = "Instant" }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    onClose?.();
    navigate("/menu");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 border border-gray-100 overflow-hidden ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-10 text-white overflow-hidden">
          <div className="relative text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-2xl sm:text-3xl font-bold">Payment Successful</h2>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-blue-50 text-base leading-relaxed">Thank you! Your payment was processed successfully.</p>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col gap-6 items-center">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-base font-semibold text-gray-700">Order #{orderId}</span>
          </div>

          <div className="flex flex-col w-full gap-3">
            <button
              className="w-full bg-gradient-to-r from-[#18749b] to-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-base shadow-lg hover:shadow-xl"
              onClick={handleContinue}
            >
              Continue Ordering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
