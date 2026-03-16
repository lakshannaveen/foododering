import React, { useState, useEffect } from "react";
import { Edit, Trash2, Coins, Receipt } from "lucide-react";
import { toast } from 'react-toastify';
import overheadService from "../../services/overheadService";

const OverheadSection = ({ initialOverhead = [] }) => {
  const [overheadList, setOverheadList] = useState(
    Array.isArray(initialOverhead) ? initialOverhead.map((i) => ({ ...i })) : []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", cost: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // On mount: use provided initialOverhead if present, otherwise fetch overheads.
  // Run only once to avoid repeated fetches when parent re-creates arrays (prevents spinner blinking).
  useEffect(() => {
    let mounted = true;
    const loadOverheads = async () => {
      if (initialOverhead && initialOverhead.length > 0) {
        if (mounted) setOverheadList(initialOverhead.map(i => ({ ...i })));
        return;
      }
      setLoading(true);
      try {
        const res = await overheadService.getAllOverhead();
        // backend may return ResultSet array
        const list = Array.isArray(res) ? res : [];
        const mapped = list.map(i => ({
          id: i.OverheadId || i.Id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
          name: i.OverheadName || i.Name || i.name || "",
          cost: i.CostPerHour != null ? String(i.CostPerHour) : (i.Cost != null ? String(i.Cost) : "0"),
          status: i.Status || "A",
        }));
        if (mounted) setOverheadList(mapped);
      } catch (e) {
        console.warn('Failed to load overheads', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadOverheads();
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setFormData({ name: "", cost: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (overhead) => {
    setFormData({ name: overhead.name, cost: overhead.cost });
    setEditingId(overhead.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.cost) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      // prepare payload expected by backend
      const payload = {
        overheadName: formData.name.trim(),
        costPerHour: String(formData.cost || "0"),
      };

      let newId;
      if (editingId) {
        // Update existing overhead
        payload.overheadId = editingId;
        await overheadService.updateOverhead(payload);
        newId = editingId;
        setOverheadList((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, name: formData.name.trim(), cost: formData.cost } : item))
        );
      } else {
        // Add new overhead
        const res = await overheadService.addOverhead(payload);
        // if backend returned an id, use it; otherwise generate a local id
        newId = res?.OverheadId || res?.Result?.OverheadId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
        setOverheadList((prev) => [...prev, { id: newId, name: formData.name.trim(), cost: formData.cost, status: "A" }]);
      }

      setShowForm(false);
      setEditingId(null);
      toast.success(editingId ? "Overhead updated" : "Overhead added");
    } catch (e) {
      console.error("Failed to save overhead", e);
      toast.error("Failed to save overhead. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this overhead entry?');
    if (!ok) return;
    setSaving(true);
    try {
      // call backend to mark as inactive (status 'I')
      await overheadService.removeOverhead('I', id);
      // success -> remove from local list so it no longer shows
      setOverheadList((prev) => prev.filter((item) => item.id !== id));
      toast.success("Overhead entry removed");
    } catch (e) {
      console.error('Failed to remove overhead', e);
      toast.error('Failed to remove overhead entry');
    } finally {
      setSaving(false);
    }
  };

  const grandTotal = overheadList.reduce((sum, item) => {
    return sum + parseFloat(item.cost || 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#18749b]" />
            Overhead Costs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track additional expenses like utilities, rent, and supplies
          </p>
        </div>
        <button
          onClick={handleAdd}
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
          Add Overhead Cost
        </button>
      </div>

      {/* Glassmorphic Container */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading overheads...</span>
            </div>
          </div>
        ) : overheadList.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No overhead entries yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click the "Add Overhead Cost" button to get started.</p>
          </div>
        ) : (
          <>
            {/* Elegant Table */}
            <div className="overflow-x-auto">
              {/* Table Header - Subtle Gradient with Blur */}
              <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 text-sm font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-sm rounded-t-xl border-b border-blue-200/50">
                <div className="col-span-6">Name</div>
                <div className="col-span-4">Cost (LKR)</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200/50">
                {overheadList.map((overhead) => (
                  <div
                    key={overhead.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors"
                  >
                    {/* Name */}
                    <div className="col-span-6 text-gray-800 font-medium text-sm truncate">
                      {overhead.name}
                    </div>

                    {/* Cost */}
                    <div className="col-span-4 text-gray-700 text-sm font-mono">
                      {parseFloat(overhead.cost || 0).toFixed(2)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 text-right flex justify-end items-center gap-3">
                      <button
                        onClick={() => handleEdit(overhead)}
                        className="text-blue-700 hover:text-blue-900 transition-colors p-1"
                        aria-label="Edit overhead"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(overhead.id)}
                        className="text-red-700 hover:text-red-900 transition-colors p-1"
                        aria-label="Delete overhead"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
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

      {/* Add / Edit Modal (unchanged) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-gray-50 border-b">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                {editingId ? (
                  <>
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Overhead Entry
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add Overhead Cost
                  </>
                )}
              </h3>
            </div>

            {/* Form Content - Horizontal Layout */}
            <div className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[250px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Gas / Electricity"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost (LKR)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="100.00"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
              <button onClick={handleCancel} disabled={saving} className={"px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition " + (saving ? 'opacity-60 cursor-not-allowed' : '')}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className={"px-6 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm " + (saving ? 'opacity-60 cursor-not-allowed' : '')}>
                {saving ? (
                  <span className="inline-flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>Saving...</span>
                ) : (
                  (editingId ? "Update Entry" : "Save")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverheadSection;