import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import RecipeModal from "./RecipeModal";

const RecipesSection = ({ rows, updateRow, removeRow, addRow, ingredientsList }) => {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", description: "", ingredients: rows || [{ name: "", quantity: "", unit: "kg", unitCost: "" }] });
  const [showForm, setShowForm] = useState(false);

  const openNew = () => {
    setForm({ id: null, name: "", description: "", ingredients: [{ name: "", quantity: "", unit: "kg", unitCost: "" }] });
    setShowForm(true);
  };

  const saveRecipe = () => {
    if (!form.name) return;
    if (form.id) {
      setRecipes(prev => prev.map(r => r.id === form.id ? { ...form } : r));
    } else {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      setRecipes(prev => [...prev, { ...form, id }]);
    }
    setShowForm(false);
  };

  const editRecipe = (r) => {
    setForm({ ...r });
    setShowForm(true);
  };

  const deleteRecipe = (id) => setRecipes(prev => prev.filter(r => r.id !== id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button onClick={openNew} className="px-3 py-2 bg-blue-600 text-white rounded">Add Recipe</button>
        </div>
      </div>

      <RecipeModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        form={form}
        setForm={setForm}
        onSave={saveRecipe}
        onCancel={() => setShowForm(false)}
        ingredientsList={ingredientsList}
      />

      <div className="space-y-2">
        {recipes.length === 0 ? (
          <div className="text-sm text-gray-500">No recipes yet. Add a recipe above.</div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 items-center p-2 text-sm font-semibold text-gray-600">
              <div className="col-span-4">Recipe</div>
              <div className="col-span-6">Description</div>
              <div className="col-span-1 text-right">Ingredients</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {recipes.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded bg-white">
                <div className="col-span-4">
                  <div className="font-medium">{r.name}</div>
                </div>
                <div className="col-span-6 text-sm text-gray-600">{r.description}</div>
                <div className="col-span-1 text-right text-sm">
                  <button onClick={() => editRecipe(r)} className="text-blue-600 hover:underline">View</button>
                </div>
                <div className="col-span-1 text-right flex justify-end items-center gap-2">
                  <button onClick={() => editRecipe(r)} className="text-gray-600 hover:text-gray-800" aria-label="Edit recipe"><Edit size={16} /></button>
                  <button onClick={() => deleteRecipe(r.id)} className="text-red-600 hover:text-red-800" aria-label="Delete recipe"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipesSection;
