import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Trash2, Save, X,
  BookOpen, Package, Users, Factory, Calculator, Bookmark,
  ClipboardList
} from 'lucide-react';
import { toast } from 'react-toastify';
import StockSection from "./StockSection";
import LaborSection from "./LaborSection";
import OverheadSection from "./OverheadSection";
import CalculateSection from "./CalculateSection";
import RecipesSection from "./RecipesSection";
import productionCostService from "../../services/productionCostService";
import { getAllMenuItems } from '../../services/menuService';
import { Loader } from 'lucide-react';

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

  React.useEffect(() => {
    if (initialRows && Array.isArray(initialRows)) {
      setRows(initialRows.map((r) => ({ ...emptyRow(), ...r })));
    }
  }, [initialRows]);

  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("active") || "recipes";

  const tabs = [
    { key: "recipes", label: "Recipes", icon: BookOpen },
    { key: "stock", label: "Stock", icon: Package },
    { key: "labor", label: "Labor", icon: Users },
    { key: "overhead", label: "Overhead", icon: Factory },
    { key: "calculate", label: "Calculate", icon: Calculator },
    { key: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <div className="bg-transparent">
      {/* Header with icon and 8‑px spacing */}
      <div className="flex items-start gap-3 mb-6">
        {/* Icon with blue background, white color, and 4px padding */}
        <div className="flex items-center justify-center bg-[#18749b] text-white p-1 rounded-lg">
          <ClipboardList size={32} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Recipe Calculator</h2>
          <p className="text-sm text-gray-500 mt-2">
            Manage stock, labor and overhead — calculate recipe cost and suggested price.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav aria-label="Recipe calculator tabs" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              to={`?active=${key}`}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${active === key
                  ? 'bg-gradient-to-r from-[#18749b] to-[#2E5A8A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-current={active === key ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Content Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {active === 'recipes' ? (
          <RecipesSection rows={rows} updateRow={updateRow} removeRow={removeRow} addRow={addRow} ingredientsList={ingredientsList} />
        ) : active === "stock" ? (
          <StockSection />
        ) : active === "labor" ? (
          <LaborSection />
        ) : active === "overhead" ? (
          <OverheadSection />
        ) : active === 'saved' ? (
          <SavedList />
        ) : (
          <CalculateSection />
        )}
      </div>
    </div>
  );
};

// Enhanced SavedList with better spacing and card style
const SavedList = () => {
  const [items, setItems] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ recipe: '', totalCost: '', suggestedPrice: '' });

  React.useEffect(() => {
    let mounted = true;
    setLoadingSaved(true);
    (async () => {
      try {
        const [list, menuResp] = await Promise.all([
          productionCostService.getAllProductionCosts(),
          (async () => {
            try { return await getAllMenuItems(); } catch (e) { return null; }
          })(),
        ]);
        if (!mounted) return;
        if (Array.isArray(list) && list.length > 0) {
          // Build a lookup from MenuItemSizeId -> "Name (Size)"
          const sizeMap = {};
          try {
            const menuItems = menuResp?.ResultSet || menuResp || [];
            if (Array.isArray(menuItems) && menuItems.length) {
              menuItems.forEach(mi => {
                const name = mi.MenuItemName || mi.Name || mi.Name || mi.menuItemName || mi.MenuItemName;
                const sizes = mi.Sizes || mi.SizesJson || mi.MenuItemSizes || mi.sizes || [];
                if (Array.isArray(sizes)) {
                  sizes.forEach(s => {
                    const sid = s.MenuItemSizeId || s.Id || s.id;
                    const label = s.Size || s.Name || s.SizeName || s.size || '';
                    if (sid) sizeMap[String(sid)] = `${name}${label ? ` (${label})` : ''}`;
                  });
                }
              });
            }
          } catch (err) { console.warn('Failed to build menu size map', err); }

          const mapped = list.map((it, idx) => {
            const mid = (it.MenuItemSizeId != null) ? String(it.MenuItemSizeId) : null;
            return {
              id: it.ProductionCostId || mid || `pc-${idx}`,
              recipe: mid ? (sizeMap[mid] || `MenuItem ${mid}`) : `MenuItem ${it.MenuItemSizeId || ''}`,
              result: { totalCost: parseFloat(it.TotalCost) || parseFloat(it.Total_Cost) || 0, suggestedPrice: parseFloat(it.SuggestedPrice) || parseFloat(it.Suggested_Price) || parseFloat(it.SuggestedSellingPrice) || parseFloat(it.TotalCost) || 0 },
              savedAt: it.CalculatedAt || new Date().toISOString(),
              raw: it,
            };
          });
          setItems(mapped);
          setLoadingSaved(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to load production costs from server', err);
      }

      // fallback to localStorage when server returns nothing or failed
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
      if (mounted) setLoadingSaved(false);
    })();
    return () => { mounted = false; };
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

  if (loadingSaved) return (
    <div className="p-6 text-sm text-gray-500 flex items-center gap-2">
      <Loader className="animate-spin" size={16} />
      <span>Loading saved calculations...</span>
    </div>
  );

  if (!items.length) return <p className="text-sm text-gray-500">No saved calculations.</p>;

  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editingId === it.id ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  className="border rounded p-2 text-sm"
                  value={editValues.recipe}
                  onChange={e => setEditValues(ev => ({ ...ev, recipe: e.target.value }))}
                  placeholder="Recipe name"
                />
                <input
                  className="border rounded p-2 text-sm"
                  value={editValues.totalCost}
                  onChange={e => setEditValues(ev => ({ ...ev, totalCost: e.target.value }))}
                  placeholder="Total cost"
                />
                <input
                  className="border rounded p-2 text-sm"
                  value={editValues.suggestedPrice}
                  onChange={e => setEditValues(ev => ({ ...ev, suggestedPrice: e.target.value }))}
                  placeholder="Suggested price"
                />
              </div>
            ) : (
              <>
                <div className="font-medium text-gray-800 truncate">{it.recipe}</div>
                <div className="text-xs text-gray-500">Saved: {new Date(it.savedAt).toLocaleString()}</div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {editingId === it.id ? (
              <>
                <button
                  title="Save"
                  aria-label="Save"
                  className="text-green-600 hover:text-green-800 p-1"
                  onClick={() => saveEdit(it.id)}
                >
                  <Save size={18} />
                </button>
                <button
                  title="Cancel"
                  aria-label="Cancel"
                  className="text-gray-600 hover:text-gray-800 p-1"
                  onClick={cancelEdit}
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-600 whitespace-nowrap">Cost: LKR {(it.result?.totalCost||0).toFixed(2)}</div>
                <div className="text-lg font-semibold text-gray-800 whitespace-nowrap">LKR {(it.result?.suggestedPrice||0).toFixed(2)}</div>
                {/* edit removed per request */}
                {/* delete button removed */}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeCalculatorTab;