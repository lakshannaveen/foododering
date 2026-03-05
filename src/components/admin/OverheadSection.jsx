import React, { useState } from "react";

const OverheadSection = () => {
  const [overheadList, setOverheadList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
  });

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
    setFormData({
      name: overhead.name,
      cost: overhead.cost,
    });
    setEditingId(overhead.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.cost) {
      alert("Please fill in all fields");
      return;
    }

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
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setOverheadList((prev) => prev.filter((item) => item.id !== id));
  };

  const grandTotal = overheadList.reduce((sum, item) => {
    return sum + parseFloat(item.cost || 0);
  }, 0);

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
                    <th className="py-3 px-5 text-left font-semibold">Cost ($)</th>
                    <th className="py-3 px-5 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overheadList.map((overhead) => (
                    <tr key={overhead.id} className="hover:bg-blue-50/30 transition">
                      <td className="py-3.5 px-5 font-medium">{overhead.name}</td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-700">
                        ${parseFloat(overhead.cost).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-5">
                          <button
                            onClick={() => handleEdit(overhead)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(overhead.id)}
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

            <div className="mt-6 flex justify-end">
              <div className="bg-white border border-gray-200 rounded-lg px-8 py-4 shadow-sm">
                <span className="text-lg font-semibold text-gray-800">
                  Grand Total: <span className="text-emerald-700">${grandTotal.toFixed(2)}</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cost (LKR)
                  </label>
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
                {editingId ? "Update Entry" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverheadSection;
