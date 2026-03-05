import React from "react";

const RecipeModal = ({ isOpen, onClose, form, setForm, onSave, onCancel }) => {
  if (!isOpen) return null;

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 z-10">
        <h3 className="text-lg font-semibold mb-4">{form.id ? 'Edit Recipe' : 'Add Recipe'}</h3>

        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-6 font-semibold text-sm text-gray-600">Recipe Name</div>
          <div className="col-span-6 font-semibold text-sm text-gray-600">Description</div>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-3 items-center">
          <input
            type="text"
            placeholder="Recipe name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="col-span-6 p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Short description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="col-span-6 p-2 border rounded"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onSave} className="px-4 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded">Save</button>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
