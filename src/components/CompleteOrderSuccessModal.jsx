import React from 'react';
import { CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CompleteOrderSuccessModal({ isOpen, onClose, amount, orderId, totalFoods, tableNumber, items = [] }) {
  if (!isOpen) return null;

  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Header background
    doc.setFillColor(24, 116, 155); // teal-ish
    doc.rect(0, 0, 595, 70, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Food Ordering Receipt', 40, 42);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const dateStr = new Date().toLocaleString();
    doc.text(`Order ID: #${orderId || ''}`, 40, 95);
    doc.text(`Table: #${tableNumber ?? ''}`, 220, 95);
    doc.text(`Date: ${dateStr}`, 360, 95);

    // Items table
    const tableBody = items.map((it, idx) => {
      const name = it.MenuItemName || it.name || it.title || 'Item';
      const qty = it.quantity ?? it.Qty ?? it.qty ?? 1;
      const price = it.Price ?? it.price ?? it.pricePerUnit ?? it.unitPrice ?? 0;
      const total = (Number(qty) * Number(price)) || 0;
      return [String(idx + 1), name, String(qty), formatCurrency(price), formatCurrency(total)];
    });

    // Add autoTable
    doc.autoTable({
      startY: 115,
      head: [['#', 'Item', 'Qty', 'Price', 'Total']],
      body: tableBody,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [24, 116, 155], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Totals
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 300;
    doc.setFontSize(12);
    doc.text(`Total Items: ${totalFoods ?? items.length}`, 40, finalY + 10);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Amount: ${formatCurrency(amount)}`, 360, finalY + 10);

    doc.save(`receipt_${orderId || 'order'}.pdf`);
  };

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

        <div className="flex justify-center gap-3">
          <button
            onClick={generatePDF}
            className="px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-lg font-semibold hover:shadow-sm transition-colors"
          >
            Download PDF Receipt
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#18749B] text-white rounded-lg font-semibold hover:bg-[#156285] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
