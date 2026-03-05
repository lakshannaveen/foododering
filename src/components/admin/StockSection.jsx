import React, { useState } from "react";
import { Trash2, Edit } from "lucide-react";
import StockModal from "./StockModal";

const emptyItem = () => ({ id: null, name: "", quantity: "", unit: "kg", unitPrice: "0.00" });

const StockSection = ({ initialItems = [] }) => {
  const [items, setItems] = useState(initialItems.map(i => ({ ...i })));
  const [form, setForm] = useState(emptyItem());
  const [showForm, setShowForm] = useState(false);

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addItem = () => {
    if (!form.name) return;
    // if editing existing item (form.id present), update it
    if (form.id) {
      setItems(prev => prev.map(it => it.id === form.id ? { ...it, ...form } : it));
    } else {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      setItems(prev => [...prev, { ...form, id }]);
    }
    setForm(emptyItem());
    setShowForm(false);
  };

  const cancelAdd = () => {
    setForm(emptyItem());
    setShowForm(false);
  };

  const updateItem = (id, key, value) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: value } : it));
  };

  const editItem = (item) => {
    setForm({ ...item });
    setShowForm(true);
  };

  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm mb-0 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Stock
        </button>
        <StockModal
          isOpen={showForm}
          onClose={cancelAdd}
          form={form}
          setForm={setForm}
          onSave={addItem}
          onCancel={cancelAdd}
        />
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">No stock items yet. Add items above.</div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 items-center p-2 text-sm font-semibold text-gray-600">
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-2">Unit Price (lkr)</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {items.map(item => {
              const q = parseFloat(item.quantity) || 0;
              const p = parseFloat(item.unitPrice) || 0;
              const total = (q * p).toFixed(2);
              return (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded bg-white">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  className="col-span-4 p-2 border rounded"
                />

                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  className="col-span-2 p-2 border rounded"
                  min="0"
                  step="0.01"
                />

                <div className="col-span-2 p-2">
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liter">liter</option>
                    <option value="lb">lb</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>

                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                  className="col-span-2 p-2 border rounded"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />

                <div className="col-span-1 text-right font-medium">{total}</div>

                <div className="col-span-1 text-right flex justify-end items-center gap-2">
                  <button onClick={() => editItem(item)} className="text-gray-600 hover:text-gray-800" aria-label="Edit item">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800" aria-label="Delete item">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default StockSection;
