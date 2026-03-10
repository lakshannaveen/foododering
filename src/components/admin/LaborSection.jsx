import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from 'react-toastify';
import laborService from "../../services/laborService";

const LaborSection = ({ initialLabor = [] }) => {
  const [laborList, setLaborList] = useState(Array.isArray(initialLabor) ? initialLabor.map(i => ({ ...i })) : []);
  const [loading, setLoading] = useState(false);
  const grandTotal = laborList.reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
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
    setFormData({ roleName: "", price: "", paymentType: "weekly" });
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
          laborName: formData.roleName.trim(),
          role: formData.roleName.trim(),
          costType: formData.paymentType,
          rate: formData.price,
        });
        // Refresh list
        const refreshed = await laborService.getAllLabor();
        setLaborList(refreshed.map((l) => ({
          id: l.LaborId || l.Id || l.id || Date.now(),
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
          laborName: formData.roleName.trim(),
        });
        const refreshed = await laborService.getAllLabor();
        setLaborList(refreshed.map((l) => ({
          id: l.LaborId || l.Id || l.id || Date.now(),
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

  const handleDelete = (id) => {
    // No delete API provided; remove locally for now
    setLaborList((prev) => prev.filter((item) => item.id !== id));
    toast.success('Labor entry removed');
  };

  return (
    <div className="p-6 border rounded-xl bg-gray-50/70 text-gray-800 shadow-sm">
      <button
        onClick={handleAdd}
        disabled={saving}
        className={"px-5 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm mb-6 flex items-center gap-2 " + (saving ? 'opacity-60 cursor-not-allowed' : '')}
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

      {/* Table */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
          </div>
        ) : laborList.length === 0 ? (
          <div className="text-sm text-gray-500">
            No labor entries yet. Click "Add Labor" to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100/80 text-gray-700 text-sm uppercase tracking-wide">
                    <th className="py-3 px-5 text-left font-semibold">Role</th>
                    <th className="py-3 px-5 text-left font-semibold">Price (LKR)</th>
                    <th className="py-3 px-5 text-left font-semibold">Payment Type</th>
                    <th className="py-3 px-5 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {laborList.map((labor) => (
                    <tr key={labor.id} className="hover:bg-blue-50/30 transition">
                      <td className="py-3.5 px-5 font-medium">{labor.roleName}</td>
                      <td className="py-3.5 px-5">{labor.price}</td>
                      <td className="py-3.5 px-5">{labor.paymentType}</td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-5">
                            <button
                              onClick={() => handleEdit(labor)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(labor.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {laborList.length > 0 && (
        <div className="mt-6 flex justify-end">
          <div className="bg-white border border-gray-200 rounded-lg px-8 py-4 shadow-sm">
            <span className="text-lg font-semibold text-gray-800">
              Grand Total: <span className="text-emerald-700">LKR {grandTotal.toFixed(2)}</span>
            </span>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────
          Modern Add / Edit Modal
      ──────────────────────────────────────────────── */}
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
                <div className="flex-1 min-w-[200px]">
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
                className={"px-6 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm " + (saving ? 'opacity-60 cursor-not-allowed' : '')}
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>Saving...</span>
                ) : (
                  (editingId ? "Update Entry" : "Save Labor")
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