import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { X } from "lucide-react";
import recipeService from "../../services/recipeService";
import laborService from "../../services/laborService";
import SearchableSelect from "../SearchableSelect";

// Recipe, stock and labor data are fetched from APIs; no hard-coded lists here.

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "piece", "tbsp", "tsp", "cup"];

const OVERHEAD_OPTIONS = [
  "Electricity", "Gas", "Water", "Packaging", "Cleaning Supplies", "Rent",
];

// Default overhead rates (LKR per hour or fixed where appropriate)
const OVERHEAD_RATES = {
  Electricity: 30,
  Gas: 50,
  Water: 10,
  Packaging: 20,
  "Cleaning Supplies": 15,
  Rent: 5000,
};
// Labor default rates are fetched from API and merged into `laborRatesState`.

const generateId    = () => Math.random().toString(36).substr(2, 9);
const newStockRow   = () => ({ id: generateId(), name: "", quantity: "0", unit: "kg", unitCost: "0.00" });
const newLaborRow   = () => ({ id: generateId(), role: "", hours: "0", minutes: "0", hourlyRate: "0.00" });
const newOverheadRow= () => ({ id: generateId(), name: "", hours: "0", rate: "0.00" });

const inputCls  = "border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const selectCls = "border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

const CalculateSection = () => {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  // remove hard-coded default; require user input (start empty)
  const [profitMargin, setProfitMargin]     = useState("");

  // dynamic data fetched from API (fallbacks above)
  const [recipesList, setRecipesList] = useState([]);
  const [stockOptionsState, setStockOptionsState] = useState([]);
  const [stockPricePerKgState, setStockPricePerKgState] = useState({});
  const [laborRatesState, setLaborRatesState] = useState({});

  const [stock,    setStock]    = useState([newStockRow()]);
  const [labor,    setLabor]    = useState([newLaborRow()]);
  const [overhead, setOverhead] = useState([newOverheadRow()]);
  const [result,   setResult]   = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [recipesRes, ingRes, laborResRaw] = await Promise.all([
          recipeService.getAllRecipes(),
          recipeService.getAllIngredients(),
          laborService.getAllLabor(),
        ]);

        // normalize labor response: laborService may return an array, recipeService style returns object with ResultSet
        const laborRes = Array.isArray(laborResRaw) ? { ResultSet: laborResRaw } : (laborResRaw || {});

        if (!mounted) return;

        if (recipesRes && Array.isArray(recipesRes.ResultSet)) {
          const mapped = recipesRes.ResultSet.map(r => ({ id: r.RecipeId || r.Id || r.id, name: r.RecipeName || r.Name || r.recipeName || r.name }));
          if (mapped.length) setRecipesList(mapped);
        }

        if (ingRes && Array.isArray(ingRes.ResultSet)) {
          const opts = ingRes.ResultSet.map(i => i.IngredientName || i.Name || i.name).filter(Boolean);
          if (opts.length) setStockOptionsState(opts);
          const prices = {};
          ingRes.ResultSet.forEach(i => {
            const key = i.IngredientName || i.Name || i.name;
            const cost = parseFloat(i.CostPerUnit || i.Cost || i.CostPerUnitInNumbers || 0) || 0;
            if (key) prices[key] = cost;
          });
          if (Object.keys(prices).length) setStockPricePerKgState(prev => ({ ...prev, ...prices }));
        }

        if (laborRes && Array.isArray(laborRes.ResultSet)) {
          const rates = {};
          laborRes.ResultSet.forEach(l => {
            const key = l.LaborName || l.Role || l.Name || l.name;
            const rate = parseFloat(l.Rate || l.RatePerHour || l.RatePerMonth || l.RatePerHour || 0) || 0;
            if (key) rates[key] = rate;
          });
          if (Object.keys(rates).length) setLaborRatesState(prev => ({ ...prev, ...rates }));
        }
      } catch (e) {
        console.warn('Failed to load recipe calculator data', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const addStock       = () => setStock(p => [...p, newStockRow()]);
  // updateStock auto-fills unitCost when a stock `name` or `unit` is selected
  const updateStock    = (id, f, v) => setStock(p => p.map(i => {
    if (i.id !== id) return i;
    const next = { ...i, [f]: v };

    // if user changed the name or unit, auto fill unitCost from fetched stock prices
    if (f === "name" || f === "unit") {
      const pricePerKg = stockPricePerKgState[next.name] || 0;
      if (pricePerKg) {
        // convert pricePerKg to price per selected unit
        const unit = next.unit || "kg";
        let unitPrice = pricePerKg;
        if (unit === "g") unitPrice = pricePerKg / 1000;
        if (unit.toLowerCase() === "ml") unitPrice = pricePerKg / 1000;
        if (unit === "piece") unitPrice = pricePerKg; // fallback
        next.unitCost = unitPrice.toFixed(2).toString();
      }
    }

    return next;
  }));
  const removeStock    = (id) => setStock(p => p.filter(i => i.id!==id));

  const addLabor       = () => setLabor(p => [...p, newLaborRow()]);
  const updateLabor    = (id, f, v) => setLabor(p => p.map(i => {
    if (i.id !== id) return i;
    const next = { ...i, [f]: v };
    // if role selected and a default rate exists, fill hourlyRate unless user already set one
    if (f === 'role') {
      const def = laborRatesState[next.role];
      if (def && (!next.hourlyRate || parseFloat(next.hourlyRate) === 0)) next.hourlyRate = def.toFixed(2).toString();
    }
    return next;
  }));
  const removeLabor    = (id) => setLabor(p => p.filter(i => i.id!==id));

  const addOverhead    = () => setOverhead(p => [...p, newOverheadRow()]);
  const updateOverhead = (id, f, v) => setOverhead(p => p.map(i => {
    if (i.id !== id) return i;
    const next = { ...i, [f]: v };
    // if the user selected an overhead name and we have a default rate, fill it
    if (f === 'name') {
      const def = OVERHEAD_RATES[next.name];
      if (def && (!next.rate || parseFloat(next.rate) === 0)) next.rate = def.toFixed(2).toString();
    }
    return next;
  }));
  const removeOverhead = (id) => setOverhead(p => p.filter(i => i.id!==id));

  const handleCalculate = () => {
    if (!selectedRecipe) return toast.error("Please select a recipe.");
    const stockTotal    = stock.reduce((s,i) => s + ((parseFloat(i.quantity)||0) * (parseFloat(i.unitCost)||0)), 0);
    const laborTotal    = labor.reduce((s,l) => {
      const h = parseFloat(l.hours) || 0;
      const m = parseFloat(l.minutes) || 0;
      const hoursDecimal = h + (m / 60);
      return s + (hoursDecimal * (parseFloat(l.hourlyRate) || 0));
    }, 0);
    const overheadTotal = overhead.reduce((s,o) => s + ((parseFloat(o.hours)||0) * (parseFloat(o.rate)||0)), 0);
    const totalCost     = stockTotal + laborTotal + overheadTotal;
    const margin = parseFloat(profitMargin);
    if (isNaN(margin) || margin <= 0) return toast.error('Please enter a profit margin greater than 0%.');
    // For typical profit margins (<100) we compute selling price from margin-on-price formula.
    // For very large margins (>=100) fall back to a markup-on-cost calculation to avoid invalid/negative values.
    const suggestedPrice = margin < 100
      ? totalCost / (1 - margin/100)
      : totalCost * (1 + margin/100);
    setResult({ stockTotal, laborTotal, overheadTotal, totalCost, suggestedPrice, margin });
  };

  const handleSave = () => {
    if (!result) return toast.error("Nothing to save. Please select a recipe or enter inputs.");
    const recipeName = recipesList.find(r => String(r.id) === String(selectedRecipe))?.name || "Custom";
    const payload = {
      id: generateId(),
      recipe: recipeName,
      result,
      savedAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
      existing.unshift(payload);
      localStorage.setItem('savedCalculations', JSON.stringify(existing));
      toast.success('Calculation saved. Open "Saved Calculations" tab to view.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save calculation.');
    }
  };

  // Auto-calculate live whenever inputs change (auto-update summary)
  React.useEffect(() => {
    if (!selectedRecipe) {
      setResult(null);
      return;
    }
    const stockTotal    = stock.reduce((s,i) => s + ((parseFloat(i.quantity)||0) * (parseFloat(i.unitCost)||0)), 0);
    const laborTotal    = labor.reduce((s,l) => s + ((parseFloat(l.hours)||0) * (parseFloat(l.hourlyRate)||0)), 0);
    const overheadTotal = overhead.reduce((s,o) => s + ((parseFloat(o.hours)||0) * (parseFloat(o.rate)||0)), 0);
    const totalCost     = stockTotal + laborTotal + overheadTotal;
    const margin = parseFloat(profitMargin);
    let suggestedPrice = 0;
    if (!isNaN(margin) && margin > 0) {
      suggestedPrice = margin < 100 ? totalCost / (1 - margin/100) : totalCost * (1 + margin/100);
    }
    setResult({ stockTotal, laborTotal, overheadTotal, totalCost, suggestedPrice, margin: isNaN(margin) ? 0 : margin });
  }, [selectedRecipe, stock, labor, overhead, profitMargin]);

  const RemoveBtn = ({ onClick }) => (
    <button onClick={onClick} className="text-red-400 hover:text-red-600 text-base leading-none" aria-label="Remove">
      <X size={16} />
    </button>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-800">Calculate Recipe Cost</h1>

      {/* Recipe Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recipe Selection</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Select Recipe <span className="text-red-500">*</span></label>
            <select className={selectCls} value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)}>
              <option value="">-- Select Recipe --</option>
              {recipesList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Profit Margin (%) <span className="text-red-500">*</span></label>
            <input type="number" className={inputCls} value={profitMargin} min={1} max={1000} placeholder="Enter margin"
              onChange={e => {
                const v = e.target.value;
                // prevent explicit zero entry; clear instead if user types 0
                if (v === "0" || v === "0.00") setProfitMargin("");
                else setProfitMargin(v);
              }} />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Stock</h2>
          <div className="flex items-center gap-2">
            <button onClick={addStock}
              className="bg-[#18749b] hover:bg-[#2c5a97] text-white text-sm font-medium px-4 py-2 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <Link to="?active=stock"
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors w-40 text-center">
              Add New Stock
            </Link>
          </div>
        </div>

        {/* Column labels — shown once above all rows */}
        <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "3fr 1.2fr 1fr 1.5fr 1.5fr 20px" }}>
          <span className="text-xs text-gray-500">Stock</span>
          <span className="text-xs text-gray-500">Quantity</span>
          <span className="text-xs text-gray-500">Unit</span>
          <span className="text-xs text-gray-500">Unit Cost (LKR)</span>
          <span className="text-xs text-gray-500">Total (LKR)</span>
          <span />
        </div>

        <div className="space-y-2">
          {stock.map((item) => (
            <div key={item.id} className="grid gap-3 items-center" style={{ gridTemplateColumns: "3fr 1.2fr 1fr 1.5fr 1.5fr 20px" }}>
                <SearchableSelect className={selectCls} options={stockOptionsState} value={item.name}
                  onChange={(v) => updateStock(item.id, "name", v)} placeholder="-- Select --" />
              <input
                type="number"
                placeholder="0"
                min="0.01"
                step="any"
                className={inputCls}
                value={item.quantity}
                onFocus={() => {
                  if (item.quantity === "0" || item.quantity === "0.00") updateStock(item.id, "quantity", "");
                }}
                onChange={e => {
                  const v = e.target.value;
                  if (v === "0" || v === "0.00") {
                    // prevent explicit zero entry — clear instead
                    updateStock(item.id, "quantity", "");
                  } else {
                    updateStock(item.id, "quantity", v);
                  }
                }}
              />
              <select className={selectCls} value={item.unit} onChange={e => updateStock(item.id,"unit",e.target.value)}>
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input
                type="number"
                placeholder="0.00"
                className={inputCls + " bg-gray-100 cursor-not-allowed"}
                value={item.unitCost}
                readOnly
              />
              <div className="p-2 border rounded bg-gray-50 text-sm text-gray-800 flex items-center justify-center">
                {(((parseFloat(item.quantity)||0) * (parseFloat(item.unitCost)||0))).toFixed(2)}
              </div>
              {stock.length > 1
                ? <RemoveBtn onClick={() => removeStock(item.id)} />
                : <span />}
            </div>
          ))}
        </div>
      </div>

      {/* Labor */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Labor</h2>
          <div className="flex items-center gap-2">
            <button onClick={addLabor}
              className="bg-[#18749b] hover:bg-[#2c5a97] text-white text-sm font-medium px-4 py-2 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <Link to="?active=labor"
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors w-40 text-center">
              Add New Labor
            </Link>
          </div>
        </div>

        <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "3fr 1fr 1fr 2fr 2fr 20px" }}>
          <span className="text-xs text-gray-500">Role</span>
          <span className="text-xs text-gray-500">Hours</span>
          <span className="text-xs text-gray-500">Minutes</span>
          <span className="text-xs text-gray-500">Hourly Rate (LKR)</span>
          <span className="text-xs text-gray-500">Total (LKR)</span>
          <span />
        </div>

        <div className="space-y-2">
          {labor.map((item) => (
            <div key={item.id} className="grid gap-3 items-center" style={{ gridTemplateColumns: "3fr 1fr 1fr 2fr 2fr 20px" }}>
              <SearchableSelect className={selectCls} options={Object.keys(laborRatesState)} value={item.role}
                onChange={(v) => updateLabor(item.id, "role", v)} placeholder="-- Select --" />

              <input
                type="number"
                placeholder="0"
                min="0.01"
                step="any"
                className={inputCls}
                value={item.hours}
                onFocus={() => {
                  if (item.hours === "0" || item.hours === "0.00") updateLabor(item.id, "hours", "");
                }}
                onChange={e => {
                  const v = e.target.value;
                  if (v === "0" || v === "0.00") {
                    updateLabor(item.id, "hours", "");
                  } else {
                    updateLabor(item.id, "hours", v);
                  }
                }}
              />

              <input
                type="number"
                min="0"
                max="59"
                placeholder="Minutes"
                className={inputCls}
                value={item.minutes}
                onFocus={() => {
                  if (item.minutes === "0" || item.minutes === "0.00") updateLabor(item.id, "minutes", "");
                }}
                onChange={e => {
                  const v = e.target.value;
                  if (v === "0" || v === "0.00") updateLabor(item.id, "minutes", "");
                  else updateLabor(item.id, "minutes", v);
                }}
              />

              <input
                type="number"
                placeholder="0.00"
                className={inputCls + " bg-gray-100 cursor-not-allowed"}
                value={item.hourlyRate}
                readOnly
              />

              <div className="p-2 border rounded bg-gray-50 text-sm text-gray-800 flex items-center justify-center">
                {(
                  (((parseFloat(item.hours)||0) + ((parseFloat(item.minutes)||0) / 60)) * (parseFloat(item.hourlyRate)||0))
                ).toFixed(2)}
              </div>
              {labor.length > 1
                ? <RemoveBtn onClick={() => removeLabor(item.id)} />
                : <span />}
            </div>
          ))}
        </div>
      </div>

      {/* Overhead */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Overhead</h2>
          <div className="flex items-center gap-2">
            <button onClick={addOverhead}
              className="bg-[#18749b] hover:bg-[#2c5a97] text-white text-sm font-medium px-4 py-2 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <Link to="?active=overhead"
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors w-40 text-center">
              Add New Overhead
            </Link>
          </div>
        </div>

        <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "3fr 2fr 2fr 20px" }}>
          <span className="text-xs text-gray-500">Overhead Item</span>
          <span className="text-xs text-gray-500">Hours</span>
          <span className="text-xs text-gray-500">Rate (LKR/hr)</span>
          <span />
        </div>

        <div className="space-y-2">
          {overhead.map((item) => (
            <div key={item.id} className="grid gap-3 items-center" style={{ gridTemplateColumns: "3fr 2fr 2fr 20px" }}>
              <select className={selectCls} value={item.name} onChange={e => updateOverhead(item.id,"name",e.target.value)}>
                <option value="">-- Select --</option>
                {OVERHEAD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input
                type="number"
                placeholder="0"
                className={inputCls}
                value={item.hours}
                onFocus={() => {
                  if (item.hours === "0" || item.hours === "0.00") updateOverhead(item.id, "hours", "");
                }}
                onChange={e => {
                  const v = e.target.value;
                  if (v === "0" || v === "0.00") updateOverhead(item.id, "hours", "");
                  else updateOverhead(item.id, "hours", v);
                }}
              />
              <input type="number" placeholder="0.00" className={inputCls} value={item.rate}
                onChange={e => updateOverhead(item.id,"rate",e.target.value)} />
              {overhead.length > 1
                ? <RemoveBtn onClick={() => removeOverhead(item.id)} />
                : <span />}
            </div>
          ))}
        </div>
      </div>

      {/* Result Summary */}
      {result && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-blue-800 mb-4">Cost Summary</h2>
          <div className="grid grid-cols-4 gap-4 text-center mb-4">
            {[
              { label: "Stock",      value: result.stockTotal },
              { label: "Labor",      value: result.laborTotal },
              { label: "Overhead",   value: result.overheadTotal },
              { label: "Total Cost", value: result.totalCost },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-lg font-bold text-gray-800">LKR {value.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Suggested Selling Price ({result.margin}% margin)</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">LKR {result.suggestedPrice.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Save Button (calculations are auto-updated) */}
      <div className="flex justify-end">
        <button onClick={handleSave}
          className="bg-[#18749b] hover:bg-[#2c5a97] text-white font-semibold px-8 py-2.5 rounded-lg shadow transition-colors text-sm">
          Save Calculation
        </button>
      </div>
    </div>
  );
};

export default CalculateSection;