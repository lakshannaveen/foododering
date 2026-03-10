import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from 'react-toastify';

const OverheadSection = ({ initialOverhead = [] }) => {
  const [overheadList, setOverheadList] = useState(
    Array.isArray(initialOverhead) ? initialOverhead.map((i) => ({ ...i })) : []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", cost: "" });
  const [saving, setSaving] = useState(false);

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

  const handleSave = () => {
    if (!formData.name || !formData.cost) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      const overheadToSave = {
        id: editingId || Date.now(),
        name: formData.name.trim(),
        cost: formData.cost,
      };

      if (editingId) {
        setOverheadList((prev) =>
          prev.map((item) => (item.id === editingId ? overheadToSave : item))
        );
      } else {
        setOverheadList((prev) => [...prev, overheadToSave]);
      }

      setShowForm(false);
      setEditingId(null);
      toast.success(editingId ? "Overhead updated" : "Overhead added");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setOverheadList((prev) => prev.filter((item) => item.id !== id));
    toast.success("Overhead entry removed");
  };

  const grandTotal = overheadList.reduce((sum, item) => {
    return sum + parseFloat(item.cost || 0);
  }, 0);

  return (
    <div className="p-6 border rounded-xl bg-gray-50/70 text-gray-800 shadow-sm">
      <button
        onClick={handleAdd}
        disabled={saving}
        className={
          "px-5 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm mb-6 flex items-center gap-2 " +
          (saving ? "opacity-60 cursor-not-allowed" : "")
        }
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

      {/* Table */}
      <div>
        {overheadList.length === 0 ? (
          <div className="text-sm text-gray-500">
            No overhead entries yet. Click "Add Overhead Cost" to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100/80 text-gray-700 text-sm uppercase tracking-wide">
                    <th className="py-3 px-5 text-left font-semibold">Name</th>
                    <th className="py-3 px-5 text-left font-semibold">Cost (LKR)</th>
                    <th className="py-3 px-5 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overheadList.map((overhead) => (
                    <tr key={overhead.id} className="hover:bg-blue-50/30 transition">
                      <td className="py-3.5 px-5 font-medium">{overhead.name}</td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-700">
                        LKR {parseFloat(overhead.cost).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-5">
                          <button
                            onClick={() => handleEdit(overhead)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(overhead.id)}
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

      {/* Add / Edit Modal */}
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
