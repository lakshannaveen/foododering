import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// PDF download removed per request

export default function CompleteOrderSuccessModal({ isOpen, onClose, amount, orderId, totalFoods, tableNumber, items = [] }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      try { onClose && onClose(); } catch (e) {}
      try { navigate('/'); } catch (e) {}
    }, 3000);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isOpen) return null;

  // PDF generation removed — download button removed as requested

  const formatCurrency = (val) => {
    try {
      return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(Number(val)).replace('LKR', 'Rs.');
    } catch (e) {
      return `Rs. ${val}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#E6F5FB] flex items-center justify-center">
            <CheckCircle className="w-10 h-10" style={{ color: '#18749B' }} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Completed</h3>
        <p className="text-sm text-gray-600 mb-4">Your order has been completed successfully.</p>

        <div className="text-sm text-gray-700 font-medium mb-2">Order ID: <span className="font-bold">#{orderId}</span></div>
        <div className="text-sm text-gray-700 font-medium mb-2">Table: <span className="font-bold">#{tableNumber ?? ''}</span></div>

        <div className="mb-4 text-left">
          <div className="text-sm text-gray-600 mb-2">Items</div>
          <div className="max-h-36 overflow-y-auto bg-gray-50 p-3 rounded">
            {items.length ? (
              <ul className="space-y-2">
                {items.map((it, i) => (
                  <li key={i} className="flex justify-between text-sm text-gray-800">
                    <span className="font-medium">{it.MenuItemName || it.name || it.title || 'Item'}</span>
                    <span className="text-gray-600">x{it.quantity ?? it.Qty ?? it.qty ?? 1}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No items available</div>
            )}
          </div>
        </div>

        <div className="text-lg text-gray-900 font-bold mb-4">Amount: {formatCurrency(amount)}</div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              try { onClose && onClose(); } catch (e) {}
              try { navigate('/'); } catch (e) {}
            }}
            className="px-6 py-3 bg-[#18749B] text-white rounded-lg font-semibold hover:bg-[#156285] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
