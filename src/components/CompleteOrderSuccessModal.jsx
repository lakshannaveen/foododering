import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function CompleteOrderSuccessModal({ isOpen, onClose, amount, orderId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Completed</h3>
        <p className="text-sm text-gray-600 mb-4">Your order has been completed successfully.</p>

        {orderId && (
          <div className="text-sm text-gray-700 font-medium mb-2">Order ID: <span className="font-bold">#{orderId}</span></div>
        )}

        {amount !== undefined && (
          <div className="text-lg text-gray-900 font-bold mb-4">Amount: Rs. {amount}</div>
        )}

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
