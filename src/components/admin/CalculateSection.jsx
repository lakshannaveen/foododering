import React, { useState } from "react";
import { Link } from "react-router-dom";

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

const generateId    = () => Math.random().toString(36).substr(2, 9);
const newStockRow   = () => ({ id: generateId(), name: "", quantity: "0", unit: "kg", unitCost: "0.00" });
const newLaborRow   = () => ({ id: generateId(), role: "", hours: "0", hourlyRate: "0.00" });
const newOverheadRow= () => ({ id: generateId(), name: "", cost: "0.00" });

const inputCls  = "border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const selectCls = "border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

const CalculateSection = () => {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [profitMargin, setProfitMargin]     = useState(20);

  const [stock,    setStock]    = useState([newStockRow()]);
  const [labor,    setLabor]    = useState([newLaborRow()]);
  const [overhead, setOverhead] = useState([newOverheadRow()]);
  const [result,   setResult]   = useState(null);

  const addStock       = () => setStock(p => [...p, newStockRow()]);
  const updateStock    = (id, f, v) => setStock(p => p.map(i => i.id===id ? {...i,[f]:v} : i));
  const removeStock    = (id) => setStock(p => p.filter(i => i.id!==id));

  const addLabor       = () => setLabor(p => [...p, newLaborRow()]);
  const updateLabor    = (id, f, v) => setLabor(p => p.map(i => i.id===id ? {...i,[f]:v} : i));
  const removeLabor    = (id) => setLabor(p => p.filter(i => i.id!==id));

  const addOverhead    = () => setOverhead(p => [...p, newOverheadRow()]);
  const updateOverhead = (id, f, v) => setOverhead(p => p.map(i => i.id===id ? {...i,[f]:v} : i));
  const removeOverhead = (id) => setOverhead(p => p.filter(i => i.id!==id));

  const handleCalculate = () => {
    if (!selectedRecipe) return alert("Please select a recipe.");
    const stockTotal    = stock.reduce((s,i) => s+(parseFloat(i.quantity)||0)*(parseFloat(i.unitCost)||0), 0);
    const laborTotal    = labor.reduce((s,l) => s+(parseFloat(l.hours)||0)*(parseFloat(l.hourlyRate)||0), 0);
    const overheadTotal = overhead.reduce((s,o) => s+(parseFloat(o.cost)||0), 0);
    const totalCost     = stockTotal + laborTotal + overheadTotal;
    const margin        = parseFloat(profitMargin) || 0;
    const suggestedPrice = margin < 100 ? totalCost / (1 - margin/100) : 0;
    setResult({ stockTotal, laborTotal, overheadTotal, totalCost, suggestedPrice, margin });
  };

  const RemoveBtn = ({ onClick }) => (
    <button onClick={onClick} className="text-red-400 hover:text-red-600 text-base leading-none">✕</button>
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
              {RECIPES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Profit Margin (%) <span className="text-red-500">*</span></label>
            <input type="number" className={inputCls} value={profitMargin} min={0} max={100}
              onChange={e => setProfitMargin(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Stock</h2>
          <div className="flex items-center gap-2">
            <button onClick={addStock}
              className="bg-[#18749b] hover:bg-[#2c5a97] text-white text-sm font-medium px-2 py-2 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <Link to="?active=stock"
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
              Add New Stock
            </Link>
          </div>
        </div>

        {/* Column labels — shown once above all rows */}
        <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "3fr 1.5fr 1.5fr 2fr 20px" }}>
          <span className="text-xs text-gray-500">Stock</span>
          <span className="text-xs text-gray-500">Quantity</span>
          <span className="text-xs text-gray-500">Unit</span>
          <span className="text-xs text-gray-500">Unit Cost ($)</span>
          <span />
        </div>

        <div className="space-y-2">
          {stock.map((item) => (
            <div key={item.id} className="grid gap-3 items-center" style={{ gridTemplateColumns: "3fr 1.5fr 1.5fr 2fr 20px" }}>
              <select className={selectCls} value={item.name} onChange={e => updateStock(item.id,"name",e.target.value)}>
                <option value="">-- Select --</option>
                {STOCK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input type="number" placeholder="0" className={inputCls} value={item.quantity}
                onChange={e => updateStock(item.id,"quantity",e.target.value)} />
              <select className={selectCls} value={item.unit} onChange={e => updateStock(item.id,"unit",e.target.value)}>
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input type="number" placeholder="0.00" className={inputCls} value={item.unitCost}
                onChange={e => updateStock(item.id,"unitCost",e.target.value)} />
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
              className="bg-[#18749b] hover:bg-[#2c5a97] text-white text-sm font-medium px-2 py-2 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <Link to="?active=labor"
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
              Add New Labor
            </Link>
          </div>
        </div>

        <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "3fr 2fr 2fr 20px" }}>
          <span className="text-xs text-gray-500">Role</span>
          <span className="text-xs text-gray-500">Hours</span>
          <span className="text-xs text-gray-500">Hourly Rate ($)</span>
          <span />
        </div>

        <div className="space-y-2">
          {labor.map((item) => (
            <div key={item.id} className="grid gap-3 items-center" style={{ gridTemplateColumns: "3fr 2fr 2fr 20px" }}>
              <input type="text" placeholder="e.g. Chef" className={inputCls} value={item.role}
                onChange={e => updateLabor(item.id,"role",e.target.value)} />
              <input type="number" placeholder="0" className={inputCls} value={item.hours}
                onChange={e => updateLabor(item.id,"hours",e.target.value)} />
              <input type="number" placeholder="0.00" className={inputCls} value={item.hourlyRate}
                onChange={e => updateLabor(item.id,"hourlyRate",e.target.value)} />
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
              className="bg-[#18749b] hover:bg-[#2c5a97] text-white text-sm font-medium px-2 py-2 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <Link to="?active=overhead"
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
              Add New Overhead
            </Link>
          </div>
        </div>

        <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "4fr 2fr 20px" }}>
          <span className="text-xs text-gray-500">Overhead Item</span>
          <span className="text-xs text-gray-500">Cost ($)</span>
          <span />
        </div>

        <div className="space-y-2">
          {overhead.map((item) => (
            <div key={item.id} className="grid gap-3 items-center" style={{ gridTemplateColumns: "4fr 2fr 20px" }}>
              <select className={selectCls} value={item.name} onChange={e => updateOverhead(item.id,"name",e.target.value)}>
                <option value="">-- Select --</option>
                {OVERHEAD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input type="number" placeholder="0.00" className={inputCls} value={item.cost}
                onChange={e => updateOverhead(item.id,"cost",e.target.value)} />
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
                <p className="text-lg font-bold text-gray-800">${value.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Suggested Selling Price ({result.margin}% margin)</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">${result.suggestedPrice.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <div className="flex justify-end">
        <button onClick={handleCalculate}
          className="bg-[#18749b] hover:bg-[#2c5a97] text-white font-semibold px-8 py-2.5 rounded-lg shadow transition-colors text-sm">
          Calculate Cost
        </button>
      </div>
    </div>
  );
};

export default CalculateSection;