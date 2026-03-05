import React, { useState, useMemo } from "react";

const emptyRow = () => ({ name: "", quantity: "", unit: "", unitCost: "" });

const RecipeCalculatorTab = () => {
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
    return { items, totalCost };
  }, [rows]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-2xl font-semibold mb-4">Recipe Calculator</h3>
      <p className="text-sm text-gray-500 mb-4">Enter ingredients, quantities and unit costs to compute total recipe cost.</p>

      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <input
              type="text"
              placeholder="Ingredient"
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
            />
            <input
              type="text"
              placeholder="Unit (e.g. kg, g)"
              value={row.unit}
              onChange={(e) => updateRow(idx, "unit", e.target.value)}
              className="col-span-2 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Unit cost"
              value={row.unitCost}
              onChange={(e) => updateRow(idx, "unitCost", e.target.value)}
              className="col-span-2 p-2 border rounded"
              min="0"
              step="0.01"
            />
            <div className="col-span-1 text-right">
              <span className="block text-sm font-medium">{(parseFloat(row.quantity || 0) * parseFloat(row.unitCost || 0)).toFixed(2)}</span>
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

        <div className="flex gap-2">
          <button onClick={addRow} className="px-3 py-2 bg-[#18749b] text-white rounded">Add Ingredient</button>
          <button onClick={() => setRows([emptyRow()])} className="px-3 py-2 bg-gray-200 rounded">Reset</button>
        </div>

        <div className="mt-4 p-4 border rounded bg-gray-50">
          <div className="flex justify-between">
            <span className="font-medium">Total Cost</span>
            <span className="font-semibold">{totals.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCalculatorTab;
