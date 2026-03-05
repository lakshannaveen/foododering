import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

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
          <>
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  list="ingredients-list"
                  value={row.name}
                  onChange={(e) => updateRow(idx, "name", e.target.value)}
                  className="col-span-4 p-2 border rounded"
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  value={row.quantity}
                  onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                  className="col-span-2 p-2 border rounded"
                  min="0"
                  step="0.01"
                />

                <select
                  value={row.unit}
                  onChange={(e) => updateRow(idx, "unit", e.target.value)}
                  className="col-span-2 p-2 border rounded bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="liter">liter</option>
                  <option value="lb">lb</option>
                  <option value="pcs">pcs</option>
                </select>

                <input
                  type="number"
                  placeholder="Unit price (price for 1)"
                  value={row.unitCost}
                  onChange={(e) => updateRow(idx, "unitCost", e.target.value)}
                  className="col-span-2 p-2 border rounded"
                  min="0"
                  step="0.01"
                />

                <div className="col-span-1 text-right">
                  <span className="block text-sm font-medium">
                    {(() => {
                      const q = parseFloat(row.quantity) || 0;
                      const c = parseFloat(row.unitCost) || 0;
                      return (q * c).toFixed(2);
                    })()}
                  </span>
                </div>

                <div className="col-span-1 text-right">
                  <button
                    onClick={() => removeRow(idx)}
                    className="text-red-600 hover:underline text-sm"
                    aria-label="Remove row"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <datalist id="ingredients-list">
              {ingredientsList && ingredientsList.map((it) => (
                <option key={it.id || it.name} value={it.name} />
              ))}
            </datalist>
          </>
        ) : (
          <div className="p-6 border rounded bg-gray-50 text-gray-700">
            {`Welcome to the ${active.charAt(0).toUpperCase() + active.slice(1)} section`}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCalculatorTab;
