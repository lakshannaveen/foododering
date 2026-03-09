import React, { useState, useEffect } from "react";
import service from "../../services/recipeService";

/* ─── Toast Notification Component ─── */
const Toast = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white text-sm font-medium transition-all duration-300 ${
          t.type === "success" ? "bg-emerald-600" : "bg-red-500"
        }`}
      >
        {t.type === "success" ? (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {t.message}
      </div>
    ))}
  </div>
);

/* ─── Main Component ─── */
const LaborSection = () => {
  const [laborList, setLaborList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [formData, setFormData] = useState({
    laborName: "",
    role: "",
    rate: "",
    costType: "weekly",
  });

  const grandTotal = laborList.reduce((sum, it) => sum + (parseFloat(it.Rate) || 0), 0);

  /* ─── Toast helpers ─── */
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  /* ─── Fetch all labor on mount ─── */
  useEffect(() => {
    fetchLabor();
  }, []);

  const fetchLabor = async () => {
    setLoading(true);
    try {
      const res = await service.getAllLabor();
      if (res?.StatusCode === 200 || res?.ResultSet) {
        const data = Array.isArray(res.ResultSet) ? res.ResultSet : [];
        // Only show active labor (Status !== "I")
        setLaborList(data.filter((l) => l.Status !== "I"));
      } else {
        showToast("Failed to load labor entries.", "error");
      }
    } catch {
      showToast("Error fetching labor data.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Form handlers ─── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setFormData({ laborName: "", role: "", rate: "", costType: "weekly" });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (labor) => {
    setFormData({
      laborName: labor.LaborName || "",
      role: labor.Role || "",
      rate: labor.Rate || "",
      costType: labor.CostType || "weekly",
    });
    setEditingId(labor.LaborId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  /* ─── Save (Add / Update) ─── */
  const handleSave = async () => {
    if (!formData.laborName.trim() || !formData.role.trim() || !formData.rate) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        /* ── Update ── */
        const res = await service.updateLabor({
          LaborId: editingId,
          LaborName: formData.laborName.trim(),
          Role: formData.role.trim(),
          CostType: formData.costType,
          Rate: formData.rate,
        });

        if (res?.StatusCode === 200) {
          showToast("Labor entry updated successfully!");
          await fetchLabor();
          setShowForm(false);
          setEditingId(null);
        } else {
          showToast(res?.Result || "Failed to update labor entry.", "error");
        }
      } else {
        /* ── Add ── */
        const res = await service.addLabor({
          LaborName: formData.laborName.trim(),
          Role: formData.role.trim(),
          CostType: formData.costType,
          Rate: formData.rate,
        });

        if (res?.StatusCode === 200) {
          showToast("Labor entry added successfully!");
          await fetchLabor();
          setShowForm(false);
        } else {
          showToast(res?.Result || "Failed to add labor entry.", "error");
        }
      }
    } catch {
      showToast("An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Soft-delete via status update ─── */
  const handleDelete = async (laborId) => {
    if (!window.confirm("Are you sure you want to remove this labor entry?")) return;

    try {
      const res = await service.updateLaborStatus(laborId, "I");
      if (res?.StatusCode === 200) {
        showToast("Labor entry removed.");
        setLaborList((prev) => prev.filter((l) => l.LaborId !== laborId));
      } else {
        showToast(res?.Result || "Failed to remove labor entry.", "error");
      }
    } catch {
      showToast("An unexpected error occurred while deleting.", "error");
    }
  };

  /* ─── Render ─── */
  return (
    <>
      <Toast toasts={toasts} />

      <div className="p-6 border rounded-xl bg-gray-50/70 text-gray-800 shadow-sm">
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm mb-6 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Labor
        </button>

        {/* Table */}
        {loading ? (
          <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading labor entries…
          </div>
        ) : laborList.length === 0 ? (
          <div className="text-sm text-gray-500">
            No labor entries yet. Click "Add Labor" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100/80 text-gray-700 text-sm uppercase tracking-wide">
                  <th className="py-3 px-5 text-left font-semibold">Name</th>
                  <th className="py-3 px-5 text-left font-semibold">Role</th>
                  <th className="py-3 px-5 text-left font-semibold">Rate (LKR)</th>
                  <th className="py-3 px-5 text-left font-semibold">Cost Type</th>
                  <th className="py-3 px-5 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laborList.map((labor) => (
                  <tr key={labor.LaborId} className="hover:bg-blue-50/30 transition">
                    <td className="py-3.5 px-5 font-medium">{labor.LaborName}</td>
                    <td className="py-3.5 px-5">{labor.Role}</td>
                    <td className="py-3.5 px-5">{parseFloat(labor.Rate).toFixed(2)}</td>
                    <td className="py-3.5 px-5 capitalize">{labor.CostType}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-5">
                        <button
                          onClick={() => handleEdit(labor)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(labor.LaborId)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grand Total */}
        {laborList.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="bg-white border border-gray-200 rounded-lg px-8 py-4 shadow-sm">
              <span className="text-lg font-semibold text-gray-800">
                Grand Total:{" "}
                <span className="text-emerald-700">LKR {grandTotal.toFixed(2)}</span>
              </span>
            </div>
          </div>
        )}

        {/* ── Add / Edit Modal ── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
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

              {/* Form */}
              <div className="p-6">
                <div className="flex flex-wrap gap-4 items-end">
                  {/* Labor Name */}
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Labor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="laborName"
                      value={formData.laborName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Silva"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    />
                  </div>

                  {/* Role */}
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Role / Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      placeholder="e.g. Head Cook"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    />
                  </div>

                  {/* Rate */}
                  <div className="flex-1 min-w-[130px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Rate (LKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      placeholder="1000.00"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    />
                  </div>

                  {/* Cost Type */}
                  <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cost Type
                    </label>
                    <select
                      name="costType"
                      value={formData.costType}
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
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {saving ? "Saving…" : editingId ? "Update Entry" : "Save Labor"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LaborSection;