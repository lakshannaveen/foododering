import React from "react";

const StockModal = ({ isOpen, onClose, form, setForm, onSave, onCancel, saving = false, isEditing = false, onUpdate }) => {
  if (!isOpen) return null;

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleFocusClear = (key) => {
    if (key === 'unitPrice') {
      if (form.unitPrice === '0' || form.unitPrice === '0.00') update('unitPrice', '');
    }
    if (key === 'quantity') {
      if (form.quantity === '0' || form.quantity === '0.00') update('quantity', '');
    }
  };

  const handleBlurFormat = (key) => {
    if (key === 'unitPrice') {
      if (form.unitPrice === '' || form.unitPrice == null) {
        update('unitPrice', '0.00');
      } else {
        const n = parseFloat(form.unitPrice);
        update('unitPrice', isNaN(n) ? '0.00' : n.toFixed(2));
      }
    }
    if (key === 'quantity') {
      if (form.quantity === '' || form.quantity == null) {
        update('quantity', '0');
      } else {
        const n = parseFloat(form.quantity);
        update('quantity', isNaN(n) ? '0' : String(n));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 z-10">
        <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Stock Item' : 'Add Stock Item'}</h3>

        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-4 font-semibold text-sm text-gray-600">Item</div>
          <div className="col-span-2 font-semibold text-sm text-gray-600">Quantity</div>
          <div className="col-span-2 font-semibold text-sm text-gray-600">Unit</div>
          <div className="col-span-2 font-semibold text-sm text-gray-600">Unit Price (lkr)</div>
          <div className="col-span-2 font-semibold text-sm text-gray-600">Total Price</div>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-3 items-center">
          <input
            type="text"
            placeholder="Item name (e.g. Carrot)"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="col-span-4 p-2 border rounded w-full min-w-0"
            disabled={isEditing}
          />

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onFocus={() => handleFocusClear('quantity')}
            onBlur={() => handleBlurFormat('quantity')}
            onChange={(e) => update('quantity', e.target.value)}
            className="col-span-2 p-2 border rounded w-full min-w-0"
            min="0"
            step="0.01"
          />

          <select
            value={form.unit}
            onChange={(e) => update('unit', e.target.value)}
            className="col-span-2 p-2 border rounded bg-white w-full min-w-0 text-sm"
            disabled={isEditing}
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
            onFocus={() => handleFocusClear('unitPrice')}
            onBlur={() => handleBlurFormat('unitPrice')}
            onChange={(e) => update('unitPrice', e.target.value)}
            className="col-span-2 p-2 border rounded w-full min-w-0"
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
          {isEditing ? (
            <button onClick={onUpdate} disabled={saving} className={"px-4 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded " + (saving ? 'opacity-60 cursor-not-allowed' : '')}>
              {saving ? (
                <span className="inline-flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>Updating...</span>
              ) : (
                'Update'
              )}
            </button>
          ) : (
            <button onClick={onSave} disabled={saving} className={"px-4 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded " + (saving ? 'opacity-60 cursor-not-allowed' : '')}>
              {saving ? (
                <span className="inline-flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>Saving...</span>
              ) : (
                'Save'
              )}
            </button>
          )}
          <button onClick={onCancel} disabled={saving} className={"px-4 py-2 bg-gray-200 rounded " + (saving ? 'opacity-60 cursor-not-allowed' : '')}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
