import React, { useState, useEffect } from "react";
import { Edit, Trash2, ChefHat, UtensilsCrossed, Hash, BookOpen } from "lucide-react";
import RecipeModal from "./RecipeModal";
import recipeService from "../../services/recipeService";

const RecipesSection = ({ rows, updateRow, removeRow, addRow, ingredientsList }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ 
    id: null, 
    name: "", 
    menuItemId: "",
    menuItemName: "",
    menuItemSizeId: "",
    size: "",
    ingredients: [{ name: "", quantity: "", unit: "kg", unitCost: "" }] 
  });
  const [showForm, setShowForm] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("All"); // "All", "Small", "Medium", "Large"

  const openNew = () => {
    setForm({ 
      id: null, 
      name: "", 
      menuItemId: "",
      menuItemName: "",
      menuItemSizeId: "",
      size: "",
      ingredients: [{ name: "", quantity: "", unit: "kg", unitCost: "" }] 
    });
    setShowForm(true);
  };

  const saveRecipe = async () => {
    if (!form.name || !form.menuItemId || !form.menuItemSizeId) return;
    
    setSaving(true);
    try {
      // Call the API with MenuItemSizeId (not MenuItemId)
      await recipeService.addRecipe({
        MenuItemSizeId: form.menuItemSizeId,
        RecipeName: form.name
      });
      
      const recipeData = {
        id: form.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
        name: form.name,
        menuItemId: form.menuItemId,
        menuItemName: form.menuItemName,
        menuItemSizeId: form.menuItemSizeId,
        size: form.size,
        ingredients: form.ingredients,
      };
      
      if (form.id) {
        setRecipes(prev => prev.map(r => r.id === form.id ? { ...r, ...recipeData } : r));
      } else {
        setRecipes(prev => [...prev, recipeData]);
      }
      setShowForm(false);
    } catch (e) {
      console.error('Failed to save recipe', e);
      window.alert('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const editRecipe = (r) => {
    setForm({ 
      ...r,
      menuItemId: r.menuItemId || "",
      menuItemName: r.menuItemName || "",
      menuItemSizeId: r.menuItemSizeId || "",
      size: r.size || "",
    });
    setShowForm(true);
  };

  const deleteRecipe = async (id) => {
    const ok = window.confirm('Are you sure?');
    if (!ok) return;
    setSaving(true);
    try {
      await recipeService.updateRecipeStatus(id, 'I');
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('Failed to update recipe status', e);
      window.alert('Failed to update recipe status');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await loadRecipesFromApi(
        (list) => { if (mounted) setRecipes(list); },
        setLoading,
        setError
      );
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Filter recipes based on selected size
  const filteredRecipes = recipes.filter(r => {
    if (sizeFilter === "All") return true;
    return r.size === sizeFilter;
  });

  // Helper to get size badge colors
  const getSizeBadgeColors = (size) => {
    switch (size) {
      case "Small":
        return "bg-sky-20 text-sky-700 border-sky-200";
      case "Medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Large":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Status badge with blue theme
  // const StatusBadge = ({ status }) => {
  //   const effectiveStatus = status || 'A';
  //   const isActive = effectiveStatus === 'A';
  //   return (
  //     <span
  //       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //         isActive
  //           ? 'bg-blue-50 text-blue-700 border border-blue-200'
  //           : 'bg-gray-50 text-gray-700 border border-gray-200'
  //       }`}
  //     >
  //       <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`} />
  //       {isActive ? 'Active' : 'Inactive'}
  //     </span>
  //   );
  // };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#18749b]/20 to-[#2c5a97]/20 border border-[#18749b]/20">
            <ChefHat size={22} className="text-[#18749b]" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-gray-800">Recipes</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 ml-1">
          Manage your culinary recipes and their affiliated menu items
        </p>
      </div>

      {/* Size Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-gray-200/80 pb-3">
        {["All", "Small", "Medium", "Large"].map((size) => (
          <button
            key={size}
            onClick={() => setSizeFilter(size)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              sizeFilter === size
                ? "text-[#18749b] border-b-2 border-[#18749b] bg-[#18749b]/5"
                : "text-gray-500 hover:text-[#18749b] hover:bg-[#18749b]/5"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-gradient-to-r from-[#18749b] to-[#2c5a97] hover:from-[#1a6a8e] hover:to-[#25508a] text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Recipe
        </button>

        {filteredRecipes.length > 0 && (
          <span className="text-sm text-gray-400 font-medium">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe" : "recipes"}
          </span>
        )}
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

      {/* Recipe Cards */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-500 text-sm">Loading recipes...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            Failed to load recipes: {error}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-gray-100/60 mb-4">
              <BookOpen size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No recipes yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first recipe to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(r => (
              <div
                key={r.id}
                className="group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Top accent with blue gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#18749b] to-[#2c5a97] rounded-t-2xl" />

                {/* Inner container with 16px padding */}
                <div className="relative p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#18749b]/10 to-[#2c5a97]/10 flex items-center justify-center border border-[#18749b]/20">
                        <ChefHat size={16} className="text-[#18749b]" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 truncate leading-tight">
                        {r.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {/* <StatusBadge status={r.status} /> */}
                      <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => editRecipe(r)}
                          className="text-gray-400 hover:text-[#18749b] p-1.5 rounded-lg hover:bg-[#18749b]/10 transition-all"
                          aria-label="Edit recipe"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => deleteRecipe(r.id)}
                          className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                          aria-label="Delete recipe"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mb-4 h-px bg-gradient-to-r from-gray-200/80 via-gray-200/40 to-transparent" />

                  {/* Detail rows */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-6 flex justify-center text-gray-400">
                        <BookOpen size={14} />
                      </div>
                      <span className="text-sm text-gray-500 w-20 shrink-0">Recipe</span>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {r.name || <span className="text-gray-400 italic">—</span>}
                      </span>
                    </div>

                    {r.size && (
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 w-6 flex justify-center text-gray-400">
                          <Hash size={14} />
                        </div>
                        <span className="text-sm text-gray-500 w-20 shrink-0">Size</span>
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {r.size}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-6 flex justify-center text-gray-400">
                        <UtensilsCrossed size={14} />
                      </div>
                      <span className="text-sm text-gray-500 w-20 shrink-0">Menu Item</span>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {r.menuItemName || <span className="text-gray-400 italic">—</span>}
                      </span>
                    </div>
                  </div>

                  {/* Bottom tags with size-specific colors */}
                  {(r.menuItemName || r.size) && (
                    <div className="mt-5 pt-3 border-t border-gray-100/80 flex flex-wrap items-center gap-2">
                      {/* {r.menuItemName && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#18749b]/10 text-[#18749b] text-xs font-medium rounded-full border border-[#18749b]/20">
                          <UtensilsCrossed size={12} className="text-[#18749b]" />
                          {r.menuItemName}
                        </span>
                      )} */}
                      {r.size && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${getSizeBadgeColors(
                            r.size
                          )}`}
                        >
                          <UtensilsCrossed size={12} className="text-[#18749b]" />
                          {r.size}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to load recipes from API and map to our structure, including status
export const loadRecipesFromApi = async (setRecipes, setLoading, setError) => {
  setLoading(true);
  setError(null);
  try {
    const res = await recipeService.getAllRecipes();
    const list = Array.isArray(res?.ResultSet) ? res.ResultSet : [];
    const mapped = list.map(r => ({
      id: r.RecipeId || r.Id || r.id,
      name: r.RecipeName || r.Name || r.recipeName || r.name,
      menuItemId: r.MenuItemId,
      menuItemName: r.MenuItemName,
      size: r.Size || r.size || null,
      menuItemSizeId: r.MenuItemSizeId,
      status: r.Status, // 'A', 'I', or null
    }));
    setRecipes(mapped);
  } catch (e) {
    setError(e?.message || 'Unknown error');
  } finally {
    setLoading(false);
  }
};

export default RecipesSection;