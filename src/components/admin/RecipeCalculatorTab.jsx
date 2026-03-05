import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import RecipesSection from "./RecipesSection";
import IngredientsSection from "./IngredientsSection";
import LaborSection from "./LaborSection";
import OverheadSection from "./OverheadSection";
import CalculateSection from "./CalculateSection";

const emptyRow = () => ({ name: "", quantity: "", unit: "kg", unitCost: "" });

const RecipeCalculatorTab = ({ externalLaborTotal = 0, externalOverheadTotal = 0, initialRows = null, ingredientsList = [] }) => {
  const [rows, setRows] = useState([emptyRow()]);

  const updateRow = (index, key, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [key]: value };
    setRows(copy);
  };

  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const totals = useMemo(() => {
    let totalCost = 0;
    const items = rows.map((r) => {
      const q = parseFloat(r.quantity) || 0;
      const c = parseFloat(r.unitCost) || 0;
      const cost = q * c;
      totalCost += cost;
      return { ...r, cost };
    });
    const labor = parseFloat(externalLaborTotal) || 0;
    const overhead = parseFloat(externalOverheadTotal) || 0;
    const grandTotal = totalCost + labor + overhead;
    return { items, totalCost, labor, overhead, grandTotal };
  }, [rows, externalLaborTotal, externalOverheadTotal]);

  // allow parent to provide initial rows (e.g., when selecting a saved recipe)
  React.useEffect(() => {
    if (initialRows && Array.isArray(initialRows)) {
      setRows(initialRows.map((r) => ({ ...emptyRow(), ...r })));
    }
  }, [initialRows]);

  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("active") || "recipes";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-2xl font-semibold mb-4">Recipe Calculator</h3>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setSearchParams({ active: "recipes" })} className="px-3 py-2 bg-gray-200 rounded">Recipes</button>
        <button onClick={() => setSearchParams({ active: "ingredients" })} className="px-3 py-2 bg-gray-200 rounded">Ingredients</button>
        <button onClick={() => setSearchParams({ active: "labor" })} className="px-3 py-2 bg-gray-200 rounded">Labor</button>
        <button onClick={() => setSearchParams({ active: "overhead" })} className="px-3 py-2 bg-gray-200 rounded">Overhead</button>
        <button onClick={() => setSearchParams({ active: "calculate" })} className="px-3 py-2 bg-gray-200 rounded">Calculate</button>
      </div>

      <div className="space-y-3">
        {active === "recipes" ? (
          <RecipesSection
            rows={rows}
            updateRow={updateRow}
            removeRow={removeRow}
            addRow={addRow}
            ingredientsList={ingredientsList}
          />
        ) : active === "ingredients" ? (
          <IngredientsSection />
        ) : active === "labor" ? (
          <LaborSection />
        ) : active === "overhead" ? (
          <OverheadSection />
        ) : (
          <CalculateSection />
        )}
      </div>
    </div>
  );
};

export default RecipeCalculatorTab;
