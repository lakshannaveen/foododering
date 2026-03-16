import React, { useState, useEffect } from "react";
import { Edit, Trash2, Briefcase } from "lucide-react";
import { toast } from 'react-toastify';
import laborService from "../../services/laborService";

const LaborSection = ({ initialLabor = [] }) => {
  const [laborList, setLaborList] = useState(Array.isArray(initialLabor) ? initialLabor.map(i => ({ ...i })) : []);
  const [loading, setLoading] = useState(false);
  const grandTotal = laborList.reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    laborName: "",
    roleName: "",
    price: "",
    paymentType: "weekly",
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setFormData({ laborName: "", roleName: "", price: "", paymentType: "weekly" });
    setEditingId(null);
    setShowForm(true);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await laborService.getAllLabor();
        if (!mounted) return;
        // map backend fields to local shape
        const mapped = list.map((l) => ({
          id: l.LaborId || l.Id || l.id || Date.now(),
          laborName: l.LaborName || l.Name || l.laborName || "",
          roleName: l.Role || l.LaborName || l.RoleName || "",
          price: l.Rate != null ? String(l.Rate) : (l.Price != null ? String(l.Price) : "0"),
          paymentType: l.CostType || l.PaymentType || "weekly",
        }));
        if (mounted) setLaborList(mapped);
      } catch (e) {
        console.error("Error loading labors", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleEdit = (labor) => {
    setFormData({
      laborName: labor.laborName || "",
      roleName: labor.roleName,
      price: labor.price,
      paymentType: labor.paymentType || "weekly",
    });
    setEditingId(labor.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.roleName || !formData.price) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing labor via API
        await laborService.updateLabor({
          laborId: editingId,
          laborName: formData.laborName.trim() || formData.roleName.trim(),
          role: formData.roleName.trim(),
          costType: formData.paymentType,
          rate: formData.price,
        });
        // Refresh list
        const refreshed = await laborService.getAllLabor();
        setLaborList(refreshed.map((l) => ({
          id: l.LaborId || l.Id || l.id || Date.now(),
          laborName: l.LaborName || l.Name || l.laborName || "",
          roleName: l.Role || l.LaborName || l.RoleName || "",
          price: l.Rate != null ? String(l.Rate) : (l.Price != null ? String(l.Price) : "0"),
          paymentType: l.CostType || l.PaymentType || "weekly",
        })));
        toast.success('Labor updated successfully');
      } else {
        // Add new labor via API
        await laborService.addLabor({
          role: formData.roleName.trim(),
          costType: formData.paymentType,
          rate: formData.price,
          laborName: formData.laborName.trim() || formData.roleName.trim(),
        });
        const refreshed = await laborService.getAllLabor();
        setLaborList(refreshed.map((l) => ({
          id: l.LaborId || l.Id || l.id || Date.now(),
          laborName: l.LaborName || l.Name || l.laborName || "",
          roleName: l.Role || l.LaborName || l.RoleName || "",
          price: l.Rate != null ? String(l.Rate) : (l.Price != null ? String(l.Price) : "0"),
          paymentType: l.CostType || l.PaymentType || "weekly",
        })));
        toast.success('Labor added successfully');
      }
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      console.error('Failed to save labor', e);
      toast.error('Failed to save labor. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Mark this labor entry as inactive? This will hide it from the list.');
    if (!ok) return;
    setSaving(true);
    try {
      await laborService.updateLaborStatus(id, 'I');
      setLaborList((prev) => prev.filter((item) => item.id !== id));
      toast.success('Labor entry marked inactive');
    } catch (e) {
      console.error('Failed to update labor status', e);
      toast.error('Failed to update labor status');
    } finally {
      setSaving(false);
    }
  };

  // Helper to format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#18749b]" />
            Labor & Costs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage labor roles, rates, and payment schedules
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Labor
        </button>
      </div>

      {/* Glassmorphic Container */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading labor...</span>
            </div>
          </div>
        ) : laborList.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No labor entries yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click the "Add Labor" button to get started.</p>
          </div>
        ) : (
          <>
            {/* Elegant Table */}
            <div className="overflow-x-auto">
              {/* Table Header - Subtle Gradient with Blur */}
              <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 text-sm font-medium text-gray-700 uppercase tracking-wider bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-sm rounded-t-xl border-b border-blue-200/50">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-2">Rate (LKR/hr)</div>
                <div className="col-span-2">Payment Type</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200/50">
                {laborList.map((labor) => (
                  <div
                    key={labor.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors"
                  >
                    {/* Labor Name */}
                    <div className="col-span-3 text-gray-800 font-medium text-sm truncate">
                      {labor.laborName || "-"}
                    </div>

                    {/* Role */}
                    <div className="col-span-3 text-gray-700 text-sm truncate">
                      {labor.roleName}
                    </div>

                    {/* Rate */}
                    <div className="col-span-2 text-gray-700 text-sm font-mono">
                      {formatCurrency(labor.price)}
                    </div>

                    {/* Payment Type */}
                    <div className="col-span-2 text-gray-700 text-sm capitalize">
                      {labor.paymentType}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 text-right flex justify-end items-center gap-3">
                      <button
                        onClick={() => handleEdit(labor)}
                        className="text-blue-700 hover:text-blue-900 transition-colors p-1"
                        aria-label="Edit labor"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(labor.id)}
                        className="text-red-700 hover:text-red-900 transition-colors p-1"
                        aria-label="Delete labor"
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
                    Edit Labor Entry
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add New Labor
                  </>
                )}
              </h3>
            </div>

            {/* Form Content - Horizontal Layout */}
            <div className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Labor Name
                  </label>
                  <input
                    type="text"
                    name="laborName"
                    value={formData.laborName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleInputChange}
                    placeholder="e.g. Head Cook"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1000.00"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="w-40">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Payment Type
                  </label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-6 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm ${
                  saving ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  editingId ? "Update Entry" : "Save Labor"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborSection;