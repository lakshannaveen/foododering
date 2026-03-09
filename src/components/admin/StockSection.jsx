import React, { useState, useEffect } from "react";
import { Trash2, Edit } from "lucide-react";
import StockModal from "./StockModal";
import recipeService from "../../services/recipeService";

const emptyItem = () => ({ id: null, name: "", quantity: "", unit: "kg", unitPrice: "0.00" });

const StockSection = ({ initialItems = [] }) => {
  const [items, setItems] = useState(initialItems.map(i => ({ ...i })));
  const [loading, setLoading] = useState(false);

  // On mount: use provided initialItems if present, otherwise fetch ingredients.
  // Run only once to avoid repeated fetches when parent re-creates arrays (prevents spinner blinking).
  useEffect(() => {
    let mounted = true;
    const loadIngredients = async () => {
      if (initialItems && initialItems.length > 0) {
        if (mounted) setItems(initialItems.map(i => ({ ...i })));
        return;
      }
      setLoading(true);
      try {
        const res = await recipeService.getAllIngredients();
        // backend may return ResultSet array
        const list = Array.isArray(res?.ResultSet) ? res.ResultSet : (Array.isArray(res) ? res : []);
        const mapped = list.map(i => ({
          id: i.IngredientId || i.Id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
          name: i.IngredientName || i.Name || i.name || "",
          quantity: i.CurrentStock != null ? String(i.CurrentStock) : (i.Quantity != null ? String(i.Quantity) : "0"),
          unit: i.Unit || "kg",
          unitPrice: i.CostPerUnit != null ? String(i.CostPerUnit) : (i.UnitPrice != null ? String(i.UnitPrice) : "0"),
        }));
        if (mounted) setItems(mapped);
      } catch (e) {
        console.warn('Failed to load ingredients', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadIngredients();
    return () => { mounted = false; };
  }, []);
  const grandTotal = items.reduce((sum, it) => {
    const q = parseFloat(it.quantity) || 0;
    const p = parseFloat(it.unitPrice) || 0;
    return sum + q * p;
  }, 0);
  const [form, setForm] = useState(emptyItem());
  const [showForm, setShowForm] = useState(false);

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addItem = async () => {
    if (!form.name) return alert('Please provide an item name');
    try {
      // prepare payload expected by backend
      const payload = {
        IngredientName: form.name,
        Unit: form.unit,
        CurrentStock: String(form.quantity || "0"),
        CostPerUnit: String(form.unitPrice || "0"),
      };

      const res = await recipeService.addIngredient(payload);

      // if backend returned an id, use it; otherwise generate a local id
      const newId = res?.IngredientId || res?.Result?.IngredientId || (form.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)));

      // if editing existing item (form.id present), update it
      if (form.id) {
        setItems(prev => prev.map(it => it.id === form.id ? { ...it, ...form } : it));
      } else {
        setItems(prev => [...prev, { ...form, id: newId }] );
      }

      setForm(emptyItem());
      setShowForm(false);
      alert('Stock item saved successfully');
    } catch (e) {
      console.error('Failed to save stock item', e);
      alert('Failed to save stock item. See console for details.');
    }
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading stock...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
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
                  readOnly
                  className="col-span-4 p-2 border rounded bg-gray-50 cursor-default"
                />

                <input
                  type="number"
                  value={item.quantity}
                  readOnly
                  className="col-span-2 p-2 border rounded bg-gray-50 cursor-default"
                  min="0"
                  step="0.01"
                />

                <div className="col-span-2 p-2">
                  <input
                    type="text"
                    value={item.unit}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-50 cursor-default text-sm"
                  />
                </div>

                <input
                  type="number"
                  value={item.unitPrice}
                  readOnly
                  className="col-span-2 p-2 border rounded bg-gray-50 cursor-default"
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
            <div className="mt-6 flex justify-end">
              <div className="bg-white border border-gray-200 rounded-lg px-8 py-4 shadow-sm">
                <span className="text-lg font-semibold text-gray-800">
                  Grand Total: <span className="text-emerald-700">LKR {grandTotal.toFixed(2)}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockSection;
