import React from "react";

const RecipesSection = ({ rows, updateRow, removeRow, addRow, ingredientsList }) => {
  return (
    <div>
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

      <div className="mt-3">
        <button onClick={addRow} className="px-3 py-2 bg-blue-600 text-white rounded">Add Ingredient</button>
      </div>
    </div>
  );
};

export default RecipesSection;
