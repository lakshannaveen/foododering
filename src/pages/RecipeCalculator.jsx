import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import RecipeCalculatorTab from "../components/admin/RecipeCalculatorTab";

const SectionNav = ({ active, setActive }) => (
  <aside className="w-64 bg-white rounded shadow p-4">
    <h2 className="text-xl font-semibold mb-4">Recipe Cost Calculator</h2>
    <ul className="space-y-2">
      {[
        { id: "recipes", label: "Recipes" },
        { id: "ingredients", label: "Ingredients" },
        { id: "labor", label: "Labor Costs" },
        { id: "overhead", label: "Overhead Costs" },
        { id: "calculate", label: "Calculate Cost" },
      ].map((s) => (
        <li key={s.id}>
          <button
            onClick={() => setActive(s.id)}
            className={`w-full text-left px-3 py-2 rounded ${active === s.id ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}
          >
            {s.label}
          </button>
        </li>
      ))}
    </ul>
  </aside>
);

const RecipeCalculator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialActive = searchParams.get("active") || "recipes";
  const [active, setActiveState] = useState(initialActive);

  useEffect(() => {
    const a = searchParams.get("active");
    if (a && a !== active) setActiveState(a);
    // keep url in sync if state changed elsewhere
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setActive = (val) => {
    setActiveState(val);
    setSearchParams({ active: val });
  };

  // data stores for small local demo
  const [recipes, setRecipes] = useState([
    { id: 1, name: "Sample Recipe", description: "Example" },
  ]);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Carrot", unit: "kg", costPerUnit: 12 },
  ]);
  const [laborItems, setLaborItems] = useState([]);
  const [overheadItems, setOverheadItems] = useState([]);

  const laborTotal = useMemo(() => laborItems.reduce((s, it) => s + (parseFloat(it.cost) || 0), 0), [laborItems]);
  const overheadTotal = useMemo(() => overheadItems.reduce((s, it) => s + (parseFloat(it.cost) || 0), 0), [overheadItems]);

  // small forms for each panel

  const RecipesPanel = () => {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const add = () => {
      if (!name) return;
      setRecipes((r) => [...r, { id: Date.now(), name, description: desc }]);
      setName("");
      setDesc("");
    };
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Recipes</h3>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Recipe name" className="p-2 border rounded" />
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="p-2 border rounded" />
            <button onClick={add} className="px-3 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded">Add Recipe</button>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.description}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setRecipes((s) => s.filter((x) => x.id !== r.id))} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const IngredientsPanel = () => {
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("kg");
    const [cost, setCost] = useState("");
    const add = () => {
      if (!name) return;
      setIngredients((i) => [...i, { id: Date.now(), name, unit, cost: parseFloat(cost) || 0 }]);
      setName("");
      setCost("");
    };
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Ingredients</h3>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="p-2 border rounded" />
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="p-2 border rounded">
              <option>kg</option>
              <option>g</option>
              <option>liter</option>
              <option>ml</option>
              <option>pcs</option>
            </select>
            <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost per unit" className="p-2 border rounded" />
            <button onClick={add} className="px-3 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded">Add Ingredient</button>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-right">Cost/Unit</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-3">{it.name}</td>
                  <td className="p-3">{it.unit}</td>
                  <td className="p-3 text-right">{(parseFloat(it.cost) || 0).toFixed(2)}</td>
                  <td className="p-3 text-right"><button onClick={() => setIngredients((s) => s.filter((x) => x.id !== it.id))} className="text-red-600">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const LaborPanel = () => {
    const [role, setRole] = useState("");
    const [cost, setCost] = useState("");
    const add = () => {
      if (!role) return;
      setLaborItems((l) => [...l, { id: Date.now(), role, cost: parseFloat(cost) || 0 }]);
      setRole("");
      setCost("");
    };
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Labor Costs</h3>
          <div className="flex gap-2">
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g., Chef)" className="p-2 border rounded" />
            <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost" className="p-2 border rounded" />
            <button onClick={add} className="px-3 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded">Add</button>
          </div>
        </div>
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {laborItems.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-3">{it.role}</td>
                  <td className="p-3 text-right">{(parseFloat(it.cost) || 0).toFixed(2)}</td>
                  <td className="p-3 text-right"><button onClick={() => setLaborItems((s) => s.filter((x) => x.id !== it.id))} className="text-red-600">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const OverheadPanel = () => {
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const add = () => {
      if (!name) return;
      setOverheadItems((o) => [...o, { id: Date.now(), name, cost: parseFloat(cost) || 0 }]);
      setName("");
      setCost("");
    };
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Overhead Costs</h3>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="p-2 border rounded" />
            <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost" className="p-2 border rounded" />
            <button onClick={add} className="px-3 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded">Add</button>
          </div>
        </div>
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overheadItems.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-3">{it.name}</td>
                  <td className="p-3 text-right">{(parseFloat(it.cost) || 0).toFixed(2)}</td>
                  <td className="p-3 text-right"><button onClick={() => setOverheadItems((s) => s.filter((x) => x.id !== it.id))} className="text-red-600">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CalculatePanel = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Calculate Cost</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm mr-2">Select Recipe:</label>
            <select className="p-2 border rounded">
              <option value="">(manual)</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <RecipeCalculatorTab
          externalLaborTotal={laborTotal}
          externalOverheadTotal={overheadTotal}
          ingredientsList={ingredients}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <SectionNav active={active} setActive={setActive} />
        </div>
        <div className="col-span-9">
          {active === "recipes" && <RecipesPanel />}
          {active === "ingredients" && <IngredientsPanel />}
          {active === "labor" && <LaborPanel />}
          {active === "overhead" && <OverheadPanel />}
          {active === "calculate" && <CalculatePanel />}
        </div>
      </div>
    </div>
  );
};

export default RecipeCalculator;
