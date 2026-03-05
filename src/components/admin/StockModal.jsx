import React from "react";

const StockModal = ({ isOpen, onClose, form, setForm, onSave, onCancel }) => {
  if (!isOpen) return null;

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 z-10">
        <h3 className="text-lg font-semibold mb-4">Add Stock Item</h3>

        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-4 font-semibold text-sm text-gray-600">Item</div>
          <div className="col-span-2 font-semibold text-sm text-gray-600">Quantity</div>
          <div className="col-span-1 font-semibold text-sm text-gray-600">Unit</div>
          <div className="col-span-3 font-semibold text-sm text-gray-600">Unit Price (lkr)</div>
          <div className="col-span-2 font-semibold text-sm text-gray-600">Total Price</div>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-3 items-center">
          <input
            type="text"
            placeholder="Item name (e.g. Carrot)"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="col-span-4 p-2 border rounded w-full min-w-0"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => update('quantity', e.target.value)}
            className="col-span-2 p-2 border rounded w-full min-w-0"
            min="0"
            step="0.01"
          />

          <select
            value={form.unit}
            onChange={(e) => update('unit', e.target.value)}
            className="col-span-1 p-2 border rounded bg-white w-full min-w-0"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="liter">liter</option>
            <option value="lb">lb</option>
            <option value="pcs">pcs</option>
          </select>

          <input
            type="number"
            placeholder="0.00"
            value={form.unitPrice}
            onChange={(e) => update('unitPrice', e.target.value)}
            className="col-span-3 p-2 border rounded w-full min-w-0"
            min="0"
            step="0.01"
          />

          <div className="col-span-2 p-2 border rounded bg-gray-50 text-sm text-gray-800 flex items-center justify-center w-full min-w-0">
            {(() => {
              const q = parseFloat(form.quantity) || 0;
              const p = parseFloat(form.unitPrice) || 0;
              return (q * p).toFixed(2);
            })()}
          </div>
        </div>
        

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
