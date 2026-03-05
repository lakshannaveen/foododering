import React, { useState } from "react";

const RECIPES = [
  { id: 1, name: "Margherita Pizza" },
  { id: 2, name: "Beef Burger" },
  { id: 3, name: "Caesar Salad" },
  { id: 4, name: "Grilled Salmon" },
  { id: 5, name: "Chicken Alfredo Pasta" },
  { id: 6, name: "Mushroom Risotto" },
];

const STOCK_OPTIONS = [
  "Flour", "Tomato Sauce", "Mozzarella Cheese", "Olive Oil",
  "Chicken Breast", "Beef Patty", "Lettuce", "Salmon Fillet",
  "Pasta", "Heavy Cream", "Mushrooms", "Arborio Rice",
];

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "piece", "tbsp", "tsp", "cup"];

const OVERHEAD_OPTIONS = [
  "Electricity", "Gas", "Water", "Packaging", "Cleaning Supplies", "Rent",
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const CalculateSection = () => {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [profitMargin, setProfitMargin] = useState(20);

  const [stock, setStock] = useState([]);
  const [labor, setLabor] = useState([]);
  const [overhead, setOverhead] = useState([]);

  const [result, setResult] = useState(null);

  // --- Stock handlers ---
  const addStock = () => {
    setStock([
      ...stock,
      { id: generateId(), name: "", quantity: "", unit: "kg", unitCost: "" },
    ]);
  };
  const updateStock = (id, field, value) => {
    setStock(stock.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };
  const removeStock = (id) => setStock(stock.filter((i) => i.id !== id));

  // --- Labor handlers ---
  const addLabor = () => {
    setLabor([...labor, { id: generateId(), role: "", hours: "", hourlyRate: "" }]);
  };
  const updateLabor = (id, field, value) => {
    setLabor(labor.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };
  const removeLabor = (id) => setLabor(labor.filter((l) => l.id !== id));

  // --- Overhead handlers ---
  const addOverhead = () => {
    setOverhead([...overhead, { id: generateId(), name: "", cost: "" }]);
  };
  const updateOverhead = (id, field, value) => {
    setOverhead(overhead.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };
  const removeOverhead = (id) => setOverhead(overhead.filter((o) => o.id !== id));

  // --- Calculate ---
  const handleCalculate = () => {
    if (!selectedRecipe) return alert("Please select a recipe.");

    const stockTotal = stock.reduce((sum, i) => {
      return sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitCost) || 0);
    }, 0);

    const laborTotal = labor.reduce((sum, l) => {
      return sum + (parseFloat(l.hours) || 0) * (parseFloat(l.hourlyRate) || 0);
    }, 0);

    const overheadTotal = overhead.reduce((sum, o) => {
      return sum + (parseFloat(o.cost) || 0);
    }, 0);

    const totalCost = stockTotal + laborTotal + overheadTotal;
    const margin = parseFloat(profitMargin) || 0;
    const suggestedPrice = totalCost / (1 - margin / 100);

    setResult({ stockTotal, laborTotal, overheadTotal, totalCost, suggestedPrice, margin });
  };

  const inputCls =
    "border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white";
  const selectCls =
    "border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Calculate Recipe Cost</h1>

      {/* Recipe Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recipe Selection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Recipe <span className="text-red-500">*</span>
            </label>
            <select
              className={selectCls}
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
            >
              <option value="">-- Select Recipe --</option>
              {RECIPES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profit Margin (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className={inputCls}
              value={profitMargin}
              min={0}
              max={100}
              onChange={(e) => setProfitMargin(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Stock</h2>
          <button
            onClick={addStock}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Add Stock
          </button>
        </div>

        {stock.length === 0 ? (
          <p className="text-sm text-gray-400">No stock added yet.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-1">
              <div className="col-span-4">Stock</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-3">Unit Cost ($)</div>
              <div className="col-span-1"></div>
            </div>
            {stock.map((ing) => (
              <div key={ing.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <select
                    className={selectCls}
                    value={ing.name}
                    onChange={(e) => updateStock(ing.id, "name", e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {STOCK_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="0"
                    className={inputCls}
                    value={ing.quantity}
                    onChange={(e) => updateStock(ing.id, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    className={selectCls}
                    value={ing.unit}
                    onChange={(e) => updateStock(ing.id, "unit", e.target.value)}
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="0.00"
                    className={inputCls}
                    value={ing.unitCost}
                    onChange={(e) => updateStock(ing.id, "unitCost", e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeStock(ing.id)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Labor */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Labor</h2>
          <button
            onClick={addLabor}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Add Labor
          </button>
        </div>

        {labor.length === 0 ? (
          <p className="text-sm text-gray-400">No labor added yet.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-1">
              <div className="col-span-5">Role</div>
              <div className="col-span-3">Hours</div>
              <div className="col-span-3">Hourly Rate ($)</div>
              <div className="col-span-1"></div>
            </div>
            {labor.map((l) => (
              <div key={l.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="e.g. Chef"
                    className={inputCls}
                    value={l.role}
                    onChange={(e) => updateLabor(l.id, "role", e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="0"
                    className={inputCls}
                    value={l.hours}
                    onChange={(e) => updateLabor(l.id, "hours", e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="0.00"
                    className={inputCls}
                    value={l.hourlyRate}
                    onChange={(e) => updateLabor(l.id, "hourlyRate", e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeLabor(l.id)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overhead */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Overhead</h2>
          <button
            onClick={addOverhead}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Add Overhead
          </button>
        </div>

        {overhead.length === 0 ? (
          <p className="text-sm text-gray-400">No overhead added yet.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-1">
              <div className="col-span-8">Overhead Item</div>
              <div className="col-span-3">Cost ($)</div>
              <div className="col-span-1"></div>
            </div>
            {overhead.map((o) => (
              <div key={o.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-8">
                  <select
                    className={selectCls}
                    value={o.name}
                    onChange={(e) => updateOverhead(o.id, "name", e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {OVERHEAD_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="0.00"
                    className={inputCls}
                    value={o.cost}
                    onChange={(e) => updateOverhead(o.id, "cost", e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeOverhead(o.id)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Summary */}
      {result && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-base font-semibold text-teal-800 mb-3">Cost Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Stock", value: result.stockTotal },
              { label: "Labor", value: result.laborTotal },
              { label: "Overhead", value: result.overheadTotal },
              { label: "Total Cost", value: result.totalCost },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-teal-100">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-lg font-bold text-gray-800">${value.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Suggested Selling Price ({result.margin}% margin)</p>
            <p className="text-3xl font-bold text-teal-700 mt-1">${result.suggestedPrice.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCalculate}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition-colors text-sm"
        >
          Calculate Cost
        </button>
      </div>
    </div>
  );
};

export default CalculateSection;