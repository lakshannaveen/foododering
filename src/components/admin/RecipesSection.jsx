import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import RecipeModal from "./RecipeModal";
import recipeService from "../../services/recipeService";

const RecipesSection = ({ rows, updateRow, removeRow, addRow, ingredientsList }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: null, name: "", ingredients: rows || [{ name: "", quantity: "", unit: "kg", unitCost: "" }] });
  const [showForm, setShowForm] = useState(false);

  const openNew = () => {
    setForm({ id: null, name: "", ingredients: [{ name: "", quantity: "", unit: "kg", unitCost: "" }] });
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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await loadRecipesFromApi((list) => { if (mounted) setRecipes(list); }, setLoading, setError);
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-[#18749b] hover:bg-[#2c5a97] text-white font-medium rounded-lg transition shadow-sm mb-0 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Recipe
          </button>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading recipes...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">Failed to load recipes: {error}</div>
        ) : recipes.length === 0 ? (
          <div className="text-sm text-gray-500">No recipes yet. Add a recipe above.</div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 items-center p-2 text-sm font-semibold text-gray-600">
              <div className="col-span-11">Recipe</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {recipes.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded bg-white">
                <div className="col-span-11">
                  <div className="font-medium">{r.name}</div>
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

// load recipes from API on mount
export const loadRecipesFromApi = async (setRecipes, setLoading, setError) => {
  setLoading(true);
  setError(null);
  try {
    const res = await recipeService.getAllRecipes();
    const list = Array.isArray(res?.ResultSet) ? res.ResultSet : [];
    const mapped = list.map(r => ({ id: r.RecipeId || r.Id || r.id, name: r.RecipeName || r.Name || r.recipeName || r.name }));
    setRecipes(mapped);
  } catch (e) {
    setError(e?.message || 'Unknown error');
  } finally {
    setLoading(false);
  }
};

export default RecipesSection;
