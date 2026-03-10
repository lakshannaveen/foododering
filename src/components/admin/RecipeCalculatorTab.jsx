import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import StockSection from "./StockSection";
import LaborSection from "./LaborSection";
import OverheadSection from "./OverheadSection";
import CalculateSection from "./CalculateSection";

const emptyRow = () => ({ name: "", quantity: "", unit: "kg", unitCost: "" });

const RecipeCalculatorTab = ({ externalLaborTotal = 0, externalOverheadTotal = 0, initialRows = null, ingredientsList = [] }) => {
  const [rows, setRows] = useState([emptyRow()]);
  const [savedList, setSavedList] = useState([]);

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
  const active = searchParams.get("active") || "stock";

  const tabOrder = ["stock", "labor", "overhead", "calculate", "saved"];
  const tabClass = (name) =>
    `flex-1 flex justify-center items-center px-4 py-2 rounded-md transition text-sm ${
      active === name
        ? "bg-gradient-to-r from-[#18749b] to-[#2E5A8A] text-white shadow-md font-semibold"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="bg-transparent p-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-semibold">Recipe Calculator</h3>
          <p className="text-sm text-gray-500 mt-1">Manage stock, labor and overhead — calculate recipe cost and suggested price.</p>
        </div>   
      </div>

      <nav aria-label="Recipe calculator tabs" className="mb-4">
        <div className="flex gap-2">
          <Link to="?active=stock" className={tabClass("stock")} aria-current={active === 'stock'}>Stock</Link>
          <Link to="?active=labor" className={tabClass("labor")} aria-current={active === 'labor'}>Labor</Link>
          <Link to="?active=overhead" className={tabClass("overhead")} aria-current={active === 'overhead'}>Overhead</Link>
          <Link to="?active=calculate" className={tabClass("calculate")} aria-current={active === 'calculate'}>Calculate</Link>
          <Link to="?active=saved" className={tabClass("saved")} aria-current={active === 'saved'}>Saved</Link>
        </div>
      </nav>

      <div className="space-y-3">
        {active === "stock" ? (
          <StockSection />
        ) : active === "labor" ? (
          <LaborSection />
        ) : active === "overhead" ? (
          <OverheadSection />
        ) : active === 'saved' ? (
          <div className="bg-transparent p-0">
            <h4 className="text-lg font-semibold mb-3">Saved Calculations</h4>
            <SavedList />
          </div>
        ) : (
          <CalculateSection />
        )}
      </div>
    </div>
  );
};

const SavedList = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ recipe: '', totalCost: '', suggestedPrice: '' });

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedCalculations') || 'null');
      if (Array.isArray(saved) && saved.length) {
        setItems(saved);
      } else {
        setItems([
          { id: 'hc1', recipe: 'Margherita Pizza', result: { totalCost: 420.0, suggestedPrice: 525.0 }, savedAt: '2026-03-01T10:00:00Z' },
          { id: 'hc2', recipe: 'Beef Burger', result: { totalCost: 320.0, suggestedPrice: 400.0 }, savedAt: '2026-03-02T14:30:00Z' },
        ]);
      }
    } catch (e) {
      setItems([
        { id: 'hc1', recipe: 'Margherita Pizza', result: { totalCost: 420.0, suggestedPrice: 525.0 }, savedAt: '2026-03-01T10:00:00Z' },
        { id: 'hc2', recipe: 'Beef Burger', result: { totalCost: 320.0, suggestedPrice: 400.0 }, savedAt: '2026-03-02T14:30:00Z' },
      ]);
    }
  }, []);

  const persist = (next) => {
    try {
      localStorage.setItem('savedCalculations', JSON.stringify(next));
    } catch (e) {
      console.error('persist failed', e);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this saved calculation?')) return;
    const next = items.filter(i => i.id !== id);
    setItems(next);
    persist(next);
    toast.success('Saved calculation deleted');
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditValues({ recipe: it.recipe || '', totalCost: (it.result?.totalCost||0).toString(), suggestedPrice: (it.result?.suggestedPrice||0).toString() });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ recipe: '', totalCost: '', suggestedPrice: '' });
  };

  const saveEdit = (id) => {
    const next = items.map(it => {
      if (it.id !== id) return it;
      const updated = {
        ...it,
        recipe: editValues.recipe,
        result: {
          ...it.result,
          totalCost: parseFloat(editValues.totalCost) || 0,
          suggestedPrice: parseFloat(editValues.suggestedPrice) || 0,
        }
      };
      return updated;
    });
    setItems(next);
    persist(next);
    cancelEdit();
    toast.success('Saved changes');
  };

  if (!items.length) return <p className="text-sm text-gray-500">No saved calculations.</p>;

  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center">
          <div className="flex-1">
            {editingId === it.id ? (
              <div className="grid grid-cols-3 gap-2 items-center">
                <input className="border rounded p-2" value={editValues.recipe} onChange={e => setEditValues(ev => ({ ...ev, recipe: e.target.value }))} />
                <input className="border rounded p-2" value={editValues.totalCost} onChange={e => setEditValues(ev => ({ ...ev, totalCost: e.target.value }))} />
                <input className="border rounded p-2" value={editValues.suggestedPrice} onChange={e => setEditValues(ev => ({ ...ev, suggestedPrice: e.target.value }))} />
              </div>
            ) : (
              <>
                <div className="font-medium">{it.recipe}</div>
                <div className="text-xs text-gray-500">Saved: {new Date(it.savedAt).toLocaleString()}</div>
              </>
            )}
          </div>
          <div className="text-right flex items-center gap-3">
            {editingId === it.id ? (
              <>
                <button title="Save" aria-label="Save" className="text-green-600 hover:text-green-800 p-1" onClick={() => saveEdit(it.id)}>
                  <Save size={16} />
                </button>
                <button title="Cancel" aria-label="Cancel" className="text-gray-600 hover:text-gray-800 p-1" onClick={cancelEdit}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-600">Cost: LKR {(it.result?.totalCost||0).toFixed(2)}</div>
                <div className="text-lg font-semibold">Price: LKR {(it.result?.suggestedPrice||0).toFixed(2)}</div>
                <button title="Edit" aria-label="Edit" className="text-blue-600 hover:text-blue-800 p-1" onClick={() => startEdit(it)}>
                  <Edit size={16} />
                </button>
                <button title="Delete" aria-label="Delete" className="text-red-600 hover:text-red-800 p-1" onClick={() => handleDelete(it.id)}>
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeCalculatorTab;
