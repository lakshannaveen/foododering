import React, { useState } from "react";

const LaborSection = () => {
  const [laborList, setLaborList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    roleName: "",
    price: "",
    paymentType: "weekly",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setFormData({ roleName: "", price: "", paymentType: "weekly" });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (labor) => {
    setFormData({
      roleName: labor.roleName,
      price: labor.price,
      paymentType: labor.paymentType || "weekly",
    });
    setEditingId(labor.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.roleName || !formData.price) {
      alert("Please fill in all fields");
      return;
    }

    const laborToSave = {
      id: editingId || Date.now(),
      roleName: formData.roleName.trim(),
      price: formData.price,
      paymentType: formData.paymentType,
    };

    if (editingId) {
      setLaborList((prev) =>
        prev.map((item) => (item.id === editingId ? laborToSave : item))
      );
    } else {
      setLaborList((prev) => [...prev, laborToSave]);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setLaborList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6 border rounded-xl bg-gray-50/70 text-gray-800 shadow-sm">
      <button
        onClick={handleAdd}
        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm mb-6 flex items-center gap-2"
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
        {laborList.length === 0 ? (
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
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(labor.id)}
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
          </>
        )}
      </div>

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
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                {editingId ? "Update Entry" : "Save Labor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborSection;