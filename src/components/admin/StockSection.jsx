import React, { useState, useEffect } from "react";
import { Trash2, Edit, Package } from "lucide-react";
import { toast } from 'react-toastify';
import StockModal from "./StockModal";
import recipeService from "../../services/recipeService";

const emptyItem = () => ({ id: null, name: "", quantity: "", unit: "kg", unitPrice: "0.00" });

const StockSection = ({ initialItems = [] }) => {
  const [items, setItems] = useState(initialItems.map(i => ({ ...i })));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const [isEditing, setIsEditing] = useState(false);

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addItem = async () => {
    if (!form.name) {
      toast.error('Please provide an item name');
      return;
    }
    setSaving(true);
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
      toast.success('Stock item saved successfully');
    } catch (e) {
      console.error('Failed to save stock item', e);
      toast.error('Failed to save stock item. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const cancelAdd = () => {
    setForm(emptyItem());
    setShowForm(false);
    setIsEditing(false);
  };

  const updateItemLocal = (id, key, value) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: value } : it));
  };

  const updateItem = async () => {
    if (!form.id) {
      toast.error('No item selected for update');
      return;
    }
    setSaving(true);
    try {
      const res = await recipeService.updateIngredient(form.id, form.quantity);
      
      // After successful update, refresh the entire list from backend
      const refreshRes = await recipeService.getAllIngredients();
      const list = Array.isArray(refreshRes?.ResultSet) ? refreshRes.ResultSet : (Array.isArray(refreshRes) ? refreshRes : []);
      const mapped = list.map(i => ({
        id: i.IngredientId || i.Id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
        name: i.IngredientName || i.Name || i.name || "",
        quantity: i.CurrentStock != null ? String(i.CurrentStock) : (i.Quantity != null ? String(i.Quantity) : "0"),
        unit: i.Unit || "kg",
        unitPrice: i.CostPerUnit != null ? String(i.CostPerUnit) : (i.UnitPrice != null ? String(i.UnitPrice) : "0"),
      }));
      setItems(mapped);
      
      setForm(emptyItem());
      setShowForm(false);
      setIsEditing(false);
      toast.success('Stock item updated successfully');
    } catch (e) {
      console.error('Failed to update stock item', e);
      toast.error('Failed to update stock item. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setForm({ ...item });
    setIsEditing(true);
    setShowForm(true);
  };

  const removeItem = async (id) => {
    // Confirm before deactivating
    const ok = window.confirm('Are you sure.');
    if (!ok) return;
    setSaving(true);
    try {
      // call backend to mark as inactive (status 'I')
      const res = await recipeService.updateIngredientStatus(id, 'I');
      // success -> remove from local list so it no longer shows
      setItems(prev => prev.filter(it => it.id !== id));
      toast.success('Stock item deleted successfully');
    } catch (e) {
      console.error('Failed to update ingredient status', e);
      toast.error('Failed to update stock status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#18749b]" />
            Stock & Ingredients
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your inventory and track costs effortlessly
          </p>
        </div>
        <button
          onClick={() => { setForm(emptyItem()); setIsEditing(false); setShowForm(true); }}
          disabled={saving}
          className={`mt-4 sm:mt-0 px-6 py-2.5 bg-gradient-to-r from-[#18749b] to-[#2c5a97] hover:from-[#0f5a7a] hover:to-[#1e3f6b] text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 backdrop-blur-sm backdrop-filter ${
            saving ? 'opacity-60 cursor-not-allowed' : ''
          }`}
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
      </div>

      {/* Glassmorphic Table Container */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading stock...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No stock items yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click the "Add Stock" button to get started.</p>
          </div>
        ) : (
          <>
            {/* Elegant Table */}
            <div className="overflow-x-auto">
              {/* Table Header - Subtle Gradient with Blur */}
              <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 text-sm font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-sm rounded-t-xl border-b border-blue-200/50">
                <div className="col-span-3">Item</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-2">Unit Price (LKR)</div>
                <div className="col-span-2 ">Total</div>
                <div className="col-span-1 ">Actions</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200/50">
                {items.map(item => {
                  const q = parseFloat(item.quantity) || 0;
                  const p = parseFloat(item.unitPrice) || 0;
                  const total = (q * p).toFixed(2);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors"
                    >
                      {/* Item Name */}
                      <div className="col-span-3 text-gray-800 font-medium text-sm truncate">
                        {item.name}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 text-gray-700 text-sm">
                        {item.quantity}
                      </div>

                      {/* Unit */}
                      <div className="col-span-2 text-gray-700 text-sm">
                        {item.unit}
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-2 text-gray-700 text-sm font-mono">
                        {parseFloat(item.unitPrice || 0).toFixed(2)}
                      </div>

                      {/* Total */}
                      <div className="col-span-2  font-medium text-gray-800 text-sm">
                        {total}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1  flex justify-end items-center gap-3">
                        <button
                          onClick={() => editItem(item)}
                          className="text-blue-700 hover:text-blue-900 transition-colors p-1"
                          aria-label="Edit item"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-700 hover:text-red-900 transition-colors p-1"
                          aria-label="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grand Total - Refined Card */}
            <div className="mt-8 flex justify-end">
              <div className="bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-xl px-8 py-5 shadow-md">
                <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Grand Total</div>
                <div className="text-3xl font-bold text-gray-800 leading-tight">LKR {grandTotal.toFixed(2)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stock Modal (unchanged) */}
      <StockModal
        isOpen={showForm}
        onClose={cancelAdd}
        form={form}
        setForm={setForm}
        onSave={addItem}
        saving={saving}
        onCancel={cancelAdd}
        isEditing={isEditing}
        onUpdate={updateItem}
      />
    </div>
  );
};

export default StockSection;