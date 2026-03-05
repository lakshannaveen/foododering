import React, { useState } from "react";

const emptyItem = () => ({ id: null, name: "", quantity: "", unit: "kg", unitPrice: "" });

const StockSection = ({ initialItems = [] }) => {
  const [items, setItems] = useState(initialItems.map(i => ({ ...i })));
  const [form, setForm] = useState(emptyItem());

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addItem = () => {
    if (!form.name) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setItems(prev => [...prev, { ...form, id }]);
    setForm(emptyItem());
  };

  const updateItem = (id, key, value) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: value } : it));
  };

  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));

  return (
    <div>
      <div className="grid grid-cols-12 gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Item name (e.g. Carrot)"
          value={form.name}
          onChange={(e) => updateForm('name', e.target.value)}
          className="col-span-4 p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => updateForm('quantity', e.target.value)}
          className="col-span-2 p-2 border rounded"
          min="0"
          step="0.01"
        />

        <select
          value={form.unit}
          onChange={(e) => updateForm('unit', e.target.value)}
          className="col-span-2 p-2 border rounded bg-white"
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="liter">liter</option>
          <option value="lb">lb</option>
          <option value="pcs">pcs</option>
        </select>

        <input
          type="number"
          placeholder="Unit price"
          value={form.unitPrice}
          onChange={(e) => updateForm('unitPrice', e.target.value)}
          className="col-span-2 p-2 border rounded"
          min="0"
          step="0.01"
        />

        <div className="col-span-2 text-right">
          <button onClick={addItem} className="px-3 py-2 bg-green-600 text-white rounded">Add to Stock</button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">No stock items yet. Add items above.</div>
        ) : (
          items.map(item => {
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
                />

                <div className="col-span-1 text-right font-medium">{total}</div>

                <div className="col-span-1 text-right">
                  <button onClick={() => removeItem(item.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StockSection;
