import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { 
  X, Plus, Save, AlertCircle, Loader, 
  ChefHat, Package, Users, Zap, Calculator, TrendingUp, Info 
} from "lucide-react";
import recipeService from "../../services/recipeService";
import laborService from "../../services/laborService";
import overheadService from "../../services/overheadService";
import productionCostService from "../../services/productionCostService";
import SearchableSelect from "../SearchableSelect";

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "piece", "tbsp", "tsp", "cup"];
const OVERHEAD_OPTIONS = ["Electricity", "Gas", "Water", "Packaging", "Cleaning Supplies", "Rent"];
const OVERHEAD_RATES = { Electricity: 30, Gas: 50, Water: 10, Packaging: 20, "Cleaning Supplies": 15, Rent: 5000 };

const generateId = () => Math.random().toString(36).substr(2, 9);
const newStockRow = () => ({ id: generateId(), name: "", quantity: "", unit: "kg", unitCost: "0.00", saved: false });
const newLaborRow = () => ({ id: generateId(), role: "", hours: "", minutes: "", hourlyRate: "0.00", saved: false });
const newOverheadRow = () => ({ id: generateId(), name: "", minutes: "", rate: "0.00", saved: false });

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow";
const selectCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow";

const CalculateSection = () => {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [profitMargin, setProfitMargin] = useState("");

  const [recipesList, setRecipesList] = useState([]);
  const [stockOptionsState, setStockOptionsState] = useState([]);
  const [stockPricePerKgState, setStockPricePerKgState] = useState({});
  const [laborRatesState, setLaborRatesState] = useState({});
  const [overheadOptionsState, setOverheadOptionsState] = useState([]);
  const [overheadRatesState, setOverheadRatesState] = useState({});

  const [stock, setStock] = useState([newStockRow()]);
  const [labor, setLabor] = useState([newLaborRow()]);
  const [overhead, setOverhead] = useState([newOverheadRow()]);
  const [result, setResult] = useState(null);

  const [missingIngredients, setMissingIngredients] = useState(false);
  const [missingIngredientNames, setMissingIngredientNames] = useState([]);
  const [missingLabor, setMissingLabor] = useState(false);
  const [missingLaborNames, setMissingLaborNames] = useState([]);
  const [missingOverhead, setMissingOverhead] = useState(false);
  const [missingOverheadNames, setMissingOverheadNames] = useState([]);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [savingIngredient, setSavingIngredient] = useState(null);
  const [savingLabor, setSavingLabor] = useState(null);
  const [savingOverhead, setSavingOverhead] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [recipesRes, ingRes, laborResRaw, overheadAllRes] = await Promise.all([
          recipeService.getAllRecipes(),
          recipeService.getAllIngredients(),
          laborService.getAllLabor(),
          overheadService.getAllOverhead(),
        ]);
        const laborRes = Array.isArray(laborResRaw) ? { ResultSet: laborResRaw } : (laborResRaw || {});
        if (!mounted) return;
        if (recipesRes && Array.isArray(recipesRes.ResultSet)) {
          const mapped = recipesRes.ResultSet.map(r => ({
            id: r.RecipeId || r.Id || r.id,
            name: r.RecipeName || r.Name || r.recipeName || r.name,
            menuItemSizeId: r.MenuItemSizeId || r.menuItemSizeId || null,
          }));
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
            const rate = parseFloat(l.Rate || l.RatePerHour || l.RatePerMonth || 0) || 0;
            if (key) rates[key] = rate;
          });
          if (Object.keys(rates).length) setLaborRatesState(prev => ({ ...prev, ...rates }));
        }
        try {
          const list = Array.isArray(overheadAllRes) ? overheadAllRes : (overheadAllRes?.ResultSet || []);
          if (Array.isArray(list) && list.length) {
            const opts = [];
            const rates = {};
            list.forEach(o => {
              const name = o.OverheadName || o.Name || o.Overhead || o.name;
              const rate = parseFloat(o.CostPerHour ?? o.Cost ?? 0) || 0;
              if (name) { opts.push(name); rates[name] = rate; }
            });
            if (opts.length) setOverheadOptionsState(opts);
            if (Object.keys(rates).length) setOverheadRatesState(prev => ({ ...prev, ...rates }));
          }
        } catch (e) { console.warn('Failed to process overheads from API', e); }
      } catch (e) { console.warn('Failed to load recipe calculator data', e); }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const addStock = () => setStock(p => [...p, newStockRow()]);

  const handleRecipeSelect = async (recipeId) => {
    setSelectedRecipe(recipeId);
    setIsLoadingRecipe(true);
    setMissingIngredients(false); setMissingIngredientNames([]);
    setMissingLabor(false); setMissingLaborNames([]);
    setMissingOverhead(false); setMissingOverheadNames([]);
    setStock([newStockRow()]); setLabor([newLaborRow()]); setOverhead([newOverheadRow()]);
    if (!recipeId) { setIsLoadingRecipe(false); return; }
    try {
      const [ingRes, laborRes, overheadRes] = await Promise.all([
        recipeService.getIngredientsByRecipe(recipeId),
        recipeService.getLaborByRecipe(recipeId),
        recipeService.getOverheadByRecipe(recipeId),
      ]);
      const availableIngredients = stockOptionsState.map(i => i.toLowerCase());
      const availableLabor = Object.keys(laborRatesState).map(l => l.toLowerCase());
      const availableOverhead = overheadOptionsState.map(o => o.toLowerCase());

      if (ingRes && Array.isArray(ingRes.ResultSet) && ingRes.ResultSet.length > 0) {
        const missingNames = [];
        const validRows = [];
        ingRes.ResultSet.forEach((item) => {
          const ingredientName = item.IngredientName || "";
          if (ingredientName && availableIngredients.includes(ingredientName.toLowerCase())) {
            validRows.push({ id: generateId(), name: ingredientName, quantity: item.QuantityRequired?.toString() || "0", unit: item.Unit || "kg", unitCost: stockPricePerKgState[ingredientName] ? (stockPricePerKgState[ingredientName] / (item.Unit === "g" || item.Unit === "ml" ? 1000 : 1)).toFixed(2).toString() : "0.00", saved: true });
          } else if (ingredientName) { missingNames.push(ingredientName); }
        });
        if (missingNames.length > 0) { setMissingIngredients(true); setMissingIngredientNames(missingNames); setStock([newStockRow()]); }
        else if (validRows.length > 0) { setStock(validRows); setMissingIngredients(false); }
        else { setMissingIngredients(true); setStock([newStockRow()]); }
      } else { setMissingIngredients(true); setStock([newStockRow()]); }

      if (laborRes && Array.isArray(laborRes.ResultSet) && laborRes.ResultSet.length > 0) {
        const missingNames = [];
        const validRows = [];
        laborRes.ResultSet.forEach((item) => {
          const laborName = item.LaborName || "";
          if (laborName && availableLabor.includes(laborName.toLowerCase())) {
            validRows.push({ id: generateId(), role: laborName, hours: item.MinutesRequired ? Math.floor(parseInt(item.MinutesRequired) / 60).toString() : "0", minutes: item.MinutesRequired ? (parseInt(item.MinutesRequired) % 60).toString() : "0", hourlyRate: item.Rate?.toString() || laborRatesState[laborName]?.toString() || "0.00", saved: true });
          } else if (laborName) { missingNames.push(laborName); }
        });
        if (missingNames.length > 0) { setMissingLabor(true); setMissingLaborNames(missingNames); setLabor([newLaborRow()]); }
        else if (validRows.length > 0) { setLabor(validRows); setMissingLabor(false); }
        else { setMissingLabor(true); setLabor([newLaborRow()]); }
      } else { setMissingLabor(true); setLabor([newLaborRow()]); }

      if (overheadRes && Array.isArray(overheadRes.ResultSet) && overheadRes.ResultSet.length > 0) {
        const missingNames = [];
        const validRows = [];
        overheadRes.ResultSet.forEach((item) => {
          const overheadName = item.OverheadName || "";
          if (overheadName && availableOverhead.includes(overheadName.toLowerCase())) {
            validRows.push({ id: generateId(), name: overheadName, minutes: item.MinutesRequired ? item.MinutesRequired.toString() : "0", rate: item.CostPerHour?.toString() || overheadRatesState[overheadName]?.toFixed(2).toString() || OVERHEAD_RATES[overheadName]?.toFixed(2).toString() || "0.00", saved: true });
          } else if (overheadName) { missingNames.push(overheadName); }
        });
        if (missingNames.length > 0) { setMissingOverhead(true); setMissingOverheadNames(missingNames); setOverhead([newOverheadRow()]); }
        else if (validRows.length > 0) { setOverhead(validRows); setMissingOverhead(false); }
        else { setMissingOverhead(true); setOverhead([newOverheadRow()]); }
      } else { setMissingOverhead(true); setOverhead([newOverheadRow()]); }
    } catch (e) {
      console.warn('Failed to load recipe data', e);
      toast.error('Failed to load recipe details');
    } finally { setIsLoadingRecipe(false); }
  };

  const updateStock = (id, f, v) => setStock(p => p.map(i => {
    if (i.id !== id) return i;
    const next = { ...i, [f]: v };
    if (f === "name" || f === "unit") {
      const pricePerKg = stockPricePerKgState[next.name] || 0;
      if (pricePerKg) {
        const unit = next.unit || "kg";
        let unitPrice = pricePerKg;
        if (unit === "g") unitPrice = pricePerKg / 1000;
        if (unit.toLowerCase() === "ml") unitPrice = pricePerKg / 1000;
        next.unitCost = unitPrice.toFixed(2).toString();
      }
    }
    return next;
  }));
  const removeStock = (id) => setStock(p => p.filter(i => i.id !== id));

  const addLabor = () => setLabor(p => [...p, newLaborRow()]);
  const updateLabor = (id, f, v) => setLabor(p => p.map(i => {
    if (i.id !== id) return i;
    const next = { ...i, [f]: v };
    if (f === 'role') {
      const def = laborRatesState[next.role];
      if (def && (!next.hourlyRate || parseFloat(next.hourlyRate) === 0)) next.hourlyRate = def.toFixed(2).toString();
    }
    return next;
  }));
  const removeLabor = (id) => setLabor(p => p.filter(i => i.id !== id));

  const addOverhead = () => setOverhead(p => [...p, newOverheadRow()]);
  const updateOverhead = (id, f, v) => setOverhead(p => p.map(i => {
    if (i.id !== id) return i;
    const next = { ...i, [f]: v };
    if (f === 'name') {
      const def = overheadRatesState[next.name] ?? OVERHEAD_RATES[next.name];
      if (def && (!next.rate || parseFloat(next.rate) === 0)) next.rate = def.toFixed(2).toString();
    }
    return next;
  }));

  // Calculate overhead hours from minutes for total calculation
  const getOverheadHours = (minutes) => (parseFloat(minutes) || 0) / 60;
  const removeOverhead = (id) => setOverhead(p => p.filter(i => i.id !== id));

  // Save handlers for adding new items to recipe
  const handleSaveIngredient = async (item) => {
    if (!selectedRecipe) return toast.error('Please select a recipe first');
    if (!item.name) return toast.error('Please select an ingredient');
    if (!item.quantity || parseFloat(item.quantity) <= 0) return toast.error('Please enter a valid quantity');

    setSavingIngredient(item.id);
    try {
      // Find the ingredient ID from the stock options
      const ingredient = stockOptionsState.find(i => i.toLowerCase() === item.name.toLowerCase());
      if (!ingredient) {
        // Try to get from the original response - we need to look up by name
        return toast.error('Ingredient not found in stock list');
      }
      
      // Get ingredient ID from the price list
      const ingredientId = Object.entries(stockPricePerKgState).find(([key]) => key.toLowerCase() === item.name.toLowerCase())?.[1];
      if (!ingredientId) {
        // We don't have the ID, we need to search through ingredients
        const response = await recipeService.getAllIngredients();
        const ing = response?.ResultSet?.find(i => (i.IngredientName || i.Name || i.name)?.toLowerCase() === item.name.toLowerCase());
        if (!ing) return toast.error('Ingredient not found');
        
        const res = await recipeService.addIngredientToRecipe(ing.IngredientId || ing.Id || ing.id, selectedRecipe, item.quantity);
        if (res?.StatusCode === 200 || res?.status === 200) {
          toast.success('Ingredient added to recipe');
          setStock(p => p.map(i => i.id === item.id ? { ...i, saved: true } : i));
        } else {
          toast.error(res?.Result || 'Failed to add ingredient');
        }
      } else {
        // Use the price key which contains the ID - actually we need to find the ingredient differently
        // Let me use a different approach - search in the original ingredients list
        const response = await recipeService.getAllIngredients();
        const ing = response?.ResultSet?.find(i => (i.IngredientName || i.Name || i.name)?.toLowerCase() === item.name.toLowerCase());
        if (!ing) return toast.error('Ingredient not found in database');
        
        const res = await recipeService.addIngredientToRecipe(ing.IngredientId || ing.Id || ing.id, selectedRecipe, item.quantity);
        if (res?.StatusCode === 200 || res?.status === 200) {
          toast.success('Ingredient added to recipe');
          setStock(p => p.map(i => i.id === item.id ? { ...i, saved: true } : i));
        } else {
          toast.error(res?.Result || 'Failed to add ingredient');
        }
      }
    } catch (err) {
      console.error('Error saving ingredient:', err);
      toast.error('Failed to save ingredient');
    } finally {
      setSavingIngredient(null);
    }
  };

  const handleSaveLabor = async (item) => {
    if (!selectedRecipe) return toast.error('Please select a recipe first');
    if (!item.role) return toast.error('Please select a labor role');
    const totalMinutes = (parseFloat(item.hours) || 0) * 60 + (parseFloat(item.minutes) || 0);
    if (totalMinutes <= 0) return toast.error('Please enter valid hours or minutes');

    setSavingLabor(item.id);
    try {
      const response = await laborService.getAllLabor();
      const laborData = response?.ResultSet || response || [];
      const laborItem = laborData.find(l => (l.LaborName || l.Role || l.Name || l.name)?.toLowerCase() === item.role.toLowerCase());
      if (!laborItem) return toast.error('Labor role not found');

      const laborId = laborItem.LaborId || laborItem.Id || laborItem.id;
      const res = await recipeService.addLaborByRecipe(laborId, selectedRecipe, totalMinutes.toString());
      if (res?.StatusCode === 200 || res?.status === 200) {
        toast.success('Labor added to recipe');
        setLabor(p => p.map(l => l.id === item.id ? { ...l, saved: true } : l));
      } else {
        toast.error(res?.Result || 'Failed to add labor');
      }
    } catch (err) {
      console.error('Error saving labor:', err);
      toast.error('Failed to save labor');
    } finally {
      setSavingLabor(null);
    }
  };

  const handleSaveOverhead = async (item) => {
    if (!selectedRecipe) return toast.error('Please select a recipe first');
    if (!item.name) return toast.error('Please select an overhead item');
    if (!item.minutes || parseFloat(item.minutes) <= 0) return toast.error('Please enter valid minutes');

    setSavingOverhead(item.id);
    try {
      const response = await overheadService.getAllOverhead();
      const overheadData = Array.isArray(response) ? response : (response?.ResultSet || []);
      const overheadItem = overheadData.find(o => (o.OverheadName || o.Name || o.Overhead || o.name)?.toLowerCase() === item.name.toLowerCase());
      if (!overheadItem) return toast.error('Overhead item not found');

      const overheadId = overheadItem.OverheadId || overheadItem.Id || overheadItem.id;
      const res = await recipeService.addOverheadByRecipe(selectedRecipe, overheadId, item.minutes);
      if (res?.StatusCode === 200 || res?.status === 200) {
        toast.success('Overhead added to recipe');
        setOverhead(p => p.map(o => o.id === item.id ? { ...o, saved: true } : o));
      } else {
        toast.error(res?.Result || 'Failed to add overhead');
      }
    } catch (err) {
      console.error('Error saving overhead:', err);
      toast.error('Failed to save overhead');
    } finally {
      setSavingOverhead(null);
    }
  };

  const handleCalculate = () => {
    if (!selectedRecipe) return toast.error("Please select a recipe.");
    if (missingIngredients || missingLabor || missingOverhead) return toast.error("Please add missing ingredients, labor, or overhead to the recipe.");
    const stockTotal = stock.reduce((s, i) => s + ((parseFloat(i.quantity) || 0) * (parseFloat(i.unitCost) || 0)), 0);
    const laborTotal = labor.reduce((s, l) => { const h = parseFloat(l.hours) || 0; const m = parseFloat(l.minutes) || 0; return s + ((h + m / 60) * (parseFloat(l.hourlyRate) || 0)); }, 0);
    const overheadTotal = overhead.reduce((s, o) => s + (getOverheadHours(o.minutes) * (parseFloat(o.rate) || 0)), 0);
    const totalCost = stockTotal + laborTotal + overheadTotal;
    const margin = parseFloat(profitMargin);
    if (isNaN(margin) || margin <= 0) return toast.error('Please enter a profit margin greater than 0%.');
    const suggestedPrice = margin < 100 ? totalCost / (1 - margin / 100) : totalCost * (1 + margin / 100);
    setResult({ stockTotal, laborTotal, overheadTotal, totalCost, suggestedPrice, margin });
  };

  const handleSave = async () => {
    if (!result) return toast.error("Nothing to save. Please select a recipe or enter inputs.");
    const recipeName = recipesList.find(r => String(r.id) === String(selectedRecipe))?.name || "Custom";
    const payload = { id: generateId(), recipe: recipeName, result, savedAt: new Date().toISOString() };
    // mark saving state so UI can disable button
    setIsSaving(true);
    try {
      const existing = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
      existing.unshift(payload);
      localStorage.setItem('savedCalculations', JSON.stringify(existing));

      // Attempt to persist to backend ProductionCosts and show a single clear outcome to user
      try {
        const recipeObj = recipesList.find(r => String(r.id) === String(selectedRecipe));
        const menuItemSizeId = recipeObj?.menuItemSizeId || 0;
        const suggested = parseFloat(result.suggestedPrice);
        const totalForServer = (!isNaN(suggested) && suggested > 0) ? suggested : parseFloat(result.totalCost || 0);
        const data = {
          MenuItemSizeId: menuItemSizeId,
          IngredientCost: (result.stockTotal || 0).toFixed(2),
          LaborCost: (result.laborTotal || 0).toFixed(2),
          OverheadCost: (result.overheadTotal || 0).toFixed(2),
          // Send suggested selling price as TotalCost when available (per request)
          TotalCost: totalForServer.toFixed(2),
          SuggestedPrice: (result.suggestedPrice || 0).toFixed(2),
        };

        const res = await productionCostService.addProductionCosts(data);

        if (res?.success) {
          toast.success('Calculation saved and persisted to server. Open "Saved Calculations" tab to view.');
        } else {
          // Extract server message when possible
          let serverMsg = res?.message || '';
          if (!serverMsg && res?.error) {
            if (typeof res.error === 'string') serverMsg = res.error;
            else if (res.error.Result) serverMsg = res.error.Result;
            else serverMsg = JSON.stringify(res.error);
          }
          if (!serverMsg) serverMsg = 'Failed to save production cost to server';
          // Show the backend error (e.g. "Error converting data type varchar to int.")
          toast.error(`Production cost save failed: ${serverMsg}`);
          toast.info('Calculation saved locally only.');
        }
      } catch (err) {
        console.warn('Failed saving production cost to server', err);
        toast.error('Failed to save production cost to server (network error)');
        toast.info('Calculation saved locally only.');
      }
    } catch (e) { console.error(e); toast.error('Failed to save calculation.'); }
    finally { setIsSaving(false); }
  };

  React.useEffect(() => {
    if (!selectedRecipe) { setResult(null); return; }
    const stockTotal = stock.reduce((s, i) => s + ((parseFloat(i.quantity) || 0) * (parseFloat(i.unitCost) || 0)), 0);
    const laborTotal = labor.reduce((s, l) => { const h = parseFloat(l.hours) || 0; const m = parseFloat(l.minutes) || 0; return s + ((h + m / 60) * (parseFloat(l.hourlyRate) || 0)); }, 0);
    const overheadTotal = overhead.reduce((s, o) => s + (getOverheadHours(o.minutes) * (parseFloat(o.rate) || 0)), 0);
    const totalCost = stockTotal + laborTotal + overheadTotal;
    const margin = parseFloat(profitMargin);
    let suggestedPrice = 0;
    if (!isNaN(margin) && margin > 0) suggestedPrice = margin < 100 ? totalCost / (1 - margin / 100) : totalCost * (1 + margin / 100);
    setResult({ stockTotal, laborTotal, overheadTotal, totalCost, suggestedPrice, margin: isNaN(margin) ? 0 : margin });
  }, [selectedRecipe, stock, labor, overhead, profitMargin]);

  const RemoveBtn = ({ onClick }) => (
    <button onClick={onClick} className="text-red-500 hover:text-red-600 transition-colors p-1 focus:outline-none focus:ring-0" aria-label="Remove">
      <X size={16} />
    </button>
  );

  // Computed line items for summary
  const stockLineItems = stock.filter(i => i.name && parseFloat(i.quantity) > 0 && parseFloat(i.unitCost) > 0).map(i => ({
    label: i.name,
    detail: `${i.quantity} ${i.unit} × LKR ${parseFloat(i.unitCost).toFixed(2)}`,
    total: (parseFloat(i.quantity) * parseFloat(i.unitCost)).toFixed(2),
  }));

  const laborLineItems = labor.filter(l => l.role && (parseFloat(l.hours) > 0 || parseFloat(l.minutes) > 0) && parseFloat(l.hourlyRate) > 0).map(l => {
    const h = parseFloat(l.hours) || 0;
    const m = parseFloat(l.minutes) || 0;
    const totalHours = h + m / 60;
    const timeLabel = h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`;
    return {
      label: l.role,
      detail: `${timeLabel} × LKR ${parseFloat(l.hourlyRate).toFixed(2)}/hr`,
      total: (totalHours * parseFloat(l.hourlyRate)).toFixed(2),
    };
  });

  const overheadLineItems = overhead.filter(o => o.name && parseFloat(o.minutes) > 0 && parseFloat(o.rate) > 0).map(o => {
    const mins = parseFloat(o.minutes);
    const hrs = mins / 60;
    return {
      label: o.name,
      detail: `${mins} min × LKR ${parseFloat(o.rate).toFixed(2)}/hr`,
      total: (hrs * parseFloat(o.rate)).toFixed(2),
    };
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ChefHat className="text-blue-600" size={24} />
        Recipe Cost Calculator
      </h1>

      {/* Recipe Selection Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2 rounded-t-xl">
          <ChefHat size={18} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-700">Recipe Selection</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Recipe <span className="text-red-500">*</span></label>
              <SearchableSelect className={selectCls} options={recipesList} value={selectedRecipe} onChange={(val) => handleRecipeSelect(val)} placeholder="-- Select Recipe --" dropdownClassName="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto" />
              {isLoadingRecipe && (
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                  <Loader size={16} className="animate-spin" /><span>Loading recipe details...</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Profit Margin (%) <span className="text-red-500">*</span></label>
              <input type="number" className={inputCls} value={profitMargin} min={1} max={1000} placeholder="Enter margin" onChange={e => { const v = e.target.value; if (v === "0" || v === "0.00") setProfitMargin(""); else setProfitMargin(v); }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between flex-wrap gap-4 rounded-t-xl">
          <div className="flex items-center gap-2"><Package size={18} className="text-blue-600" /><h2 className="text-sm font-semibold text-gray-700">Stock / Ingredients</h2></div>
          <div className="flex items-center gap-3">
            <button onClick={addStock} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#18749b] to-[#2c5a97] hover:from-[#0f5a7a] hover:to-[#1e3f6b] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-md"><Plus size={16} />Add Row</button>
            <Link to="?active=stock" className="inline-flex items-center gap-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"><Package size={16} />Manage Stock</Link>
          </div>
        </div>
        {missingIngredients && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{missingIngredientNames.length > 0 ? `Ingredients are not found in stock: ${missingIngredientNames.join(', ')}. Click "Manage Stock" to add new stocks.` : 'This recipe has no ingredients linked. You can add them manually below.'}</p>
          </div>
        )}
        <div className="p-6">
          <div className="grid gap-3 mb-6 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ gridTemplateColumns: stock.some(i => i.saved) ? "3fr 1.2fr 1fr 1.5fr 1.5fr" : "3fr 1.2fr 1fr 1.5fr 1.5fr 36px " }}>
            <span>Ingredient</span><span>Quantity</span><span>Unit</span><span>Unit Cost (LKR)</span><span>Total (LKR)</span>
          </div>
          <div className="space-y-3">
            {stock.map((item) => (
              <div key={item.id} className="grid gap-3 items-center bg-gray-50/30 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow" style={{ gridTemplateColumns: item.saved ? "3fr 1.2fr 1fr 1.5fr 1.5fr" : "3fr 1.2fr 1fr 1.5fr 1.5fr 36px 18px " }}>
                <SearchableSelect 
                  className={selectCls} 
                  options={stockOptionsState} 
                  value={item.name} 
                  onChange={(v) => updateStock(item.id, "name", v)} 
                  placeholder="-- Select --" 
                  dropdownClassName="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                  disabled={item.saved}
                />
                <input type="number" placeholder="0" min="0.01" step="any" className={inputCls} value={item.quantity} onFocus={() => { if (item.quantity === "0" || item.quantity === "0.00") updateStock(item.id, "quantity", ""); }} onChange={e => { const v = e.target.value; if (v === "0" || v === "0.00") updateStock(item.id, "quantity", ""); else updateStock(item.id, "quantity", v); }} />
                <select className={selectCls} value={item.unit} onChange={e => updateStock(item.id, "unit", e.target.value)} disabled={item.saved}>{UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}</select>
                <input type="number" placeholder="0.00" className={inputCls + " bg-gray-100 cursor-not-allowed"} value={item.unitCost} readOnly />
                <div className="p-2 border rounded-lg bg-gray-100 text-sm text-gray-800 font-medium flex items-center justify-center">{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0)).toFixed(2)}</div>
                {!item.saved ? (
                  <button 
                    onClick={() => handleSaveIngredient(item)} 
                    disabled={savingIngredient === item.id}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 text-blue-600 hover:bg-blue-500/30 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-0"
                    title="Save to recipe"
                  >
                    {savingIngredient === item.id ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                ) : <div></div>}
                {(stock.length > 1 && !item.saved) ? <RemoveBtn onClick={() => removeStock(item.id)} /> : (stock.length > 1 ? <div></div> : <div></div>)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Labor Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between flex-wrap gap-4 rounded-t-xl">
          <div className="flex items-center gap-2"><Users size={18} className="text-blue-600" /><h2 className="text-sm font-semibold text-gray-700">Labor</h2></div>
          <div className="flex items-center gap-3">
            <button onClick={addLabor} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#18749b] to-[#2c5a97] hover:from-[#0f5a7a] hover:to-[#1e3f6b] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-md"><Plus size={16} />Add Row</button>
            <Link to="?active=labor" className="inline-flex items-center gap-1.5 border border-gray-300 from-[#18749b] to-[#2c5a97] hover:from-[#0f5a7a] hover:to-[#1e3f6b] text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"><Users size={16} />Manage Labor</Link>
          </div>
        </div>
        {missingLabor && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{missingLaborNames.length > 0 ? `The following labor roles are not available: ${missingLaborNames.join(', ')}. Please add them using "Manage Labor".` : 'This recipe has no labor linked. You can add labor manually below.'}</p>
          </div>
        )}
        <div className="p-6">
          <div className="grid gap-3 mb-6 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ gridTemplateColumns: labor.some(i => i.saved) ? "3fr 1fr 1fr 2fr 2fr" : "3fr 1fr 1fr 2fr 2fr 36px " }}>
            <span>Role</span><span>Hours</span><span>Minutes</span><span>Hourly Rate (LKR)</span><span>Total (LKR)</span>
          </div>
          <div className="space-y-3">
            {labor.map((item) => (
              <div key={item.id} className="grid gap-3 items-center bg-gray-50/30 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow" style={{ gridTemplateColumns: item.saved ? "3fr 1fr 1fr 2fr 2fr" : "3fr 1fr 1fr 2fr 2fr 36px 18px " }}>
                <SearchableSelect 
                  className={selectCls} 
                  options={Object.keys(laborRatesState)} 
                  value={item.role} 
                  onChange={(v) => updateLabor(item.id, "role", v)} 
                  placeholder="-- Select --" 
                  dropdownClassName="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                  disabled={item.saved}
                />
                <input type="number" placeholder="0" min="0.01" step="any" className={inputCls} value={item.hours} onFocus={() => { if (item.hours === "0" || item.hours === "0.00") updateLabor(item.id, "hours", ""); }} onChange={e => { const v = e.target.value; if (v === "0" || v === "0.00") updateLabor(item.id, "hours", ""); else updateLabor(item.id, "hours", v); }} />
                <input type="number" min="0" max="59" placeholder="Minutes" className={inputCls} value={item.minutes} onFocus={() => { if (item.minutes === "0" || item.minutes === "0.00") updateLabor(item.id, "minutes", ""); }} onChange={e => { const v = e.target.value; if (v === "0" || v === "0.00") updateLabor(item.id, "minutes", ""); else updateLabor(item.id, "minutes", v); }} />
                <input type="number" placeholder="0.00" className={inputCls + " bg-gray-100 cursor-not-allowed"} value={item.hourlyRate} readOnly />
                <div className="p-2 border rounded-lg bg-gray-100 text-sm text-gray-800 font-medium flex items-center justify-center">{(((parseFloat(item.hours) || 0) + (parseFloat(item.minutes) || 0) / 60) * (parseFloat(item.hourlyRate) || 0)).toFixed(2)}</div>
                {!item.saved ? (
                  <button 
                    onClick={() => handleSaveLabor(item)} 
                    disabled={savingLabor === item.id}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 text-blue-600 hover:bg-blue-500/30 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-0"
                    title="Save to recipe"
                  >
                    {savingLabor === item.id ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                ) : <div></div>}
                {(labor.length > 1 && !item.saved) ? <RemoveBtn onClick={() => removeLabor(item.id)} /> : (labor.length > 1 ? <div></div> : <div></div>)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overhead Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between flex-wrap gap-4 rounded-t-xl">
          <div className="flex items-center gap-2"><Zap size={18} className="text-blue-600" /><h2 className="text-sm font-semibold text-gray-700">Overhead</h2></div>
          <div className="flex items-center gap-3">
            <button onClick={addOverhead} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#18749b] to-[#2c5a97] hover:from-[#0f5a7a] hover:to-[#1e3f6b] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-md"><Plus size={16} />Add Row</button>
            <Link to="?active=overhead" className="inline-flex items-center gap-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"><Zap size={16} />Manage Overhead</Link>
          </div>
        </div>
        {missingOverhead && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{missingOverheadNames.length > 0 ? `The following overhead items are not available: ${missingOverheadNames.join(', ')}. Please add them using "Manage Overhead".` : 'This recipe has no overhead linked. You can add overhead manually below.'}</p>
          </div>
        )}
        <div className="p-6">
          <div className="grid gap-3 mb-6 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ gridTemplateColumns: overhead.some(i => i.saved) ? "3fr 2fr 2fr 2fr" : "3fr 2fr 2fr 2fr 36px " }}>
            <span>Overhead Item</span><span>Minutes Required</span><span>Rate (LKR/hr)</span><span>Total (LKR)</span>
          </div>
          <div className="space-y-3">
            {overhead.map((item) => (
              <div key={item.id} className="grid gap-3 items-center bg-gray-50/30 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow" style={{ gridTemplateColumns: item.saved ? "3fr 2fr 2fr 2fr" : "3fr 2fr 2fr 2fr 36px 18px " }}>
                <SearchableSelect 
                  className={selectCls} 
                  options={overheadOptionsState.length ? overheadOptionsState : OVERHEAD_OPTIONS} 
                  value={item.name} 
                  onChange={(v) => updateOverhead(item.id, "name", v)} 
                  placeholder="-- Select --" 
                  dropdownClassName="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                  disabled={item.saved}
                />
                <input type="number" placeholder="0" className={inputCls} value={item.minutes} onFocus={() => { if (item.minutes === "0" || item.minutes === "0.00") updateOverhead(item.id, "minutes", ""); }} onChange={e => { const v = e.target.value; if (v === "0" || v === "0.00") updateOverhead(item.id, "minutes", ""); else updateOverhead(item.id, "minutes", v); }} />
                <input type="number" placeholder="0.00" className={inputCls} value={item.rate} onChange={e => updateOverhead(item.id, "rate", e.target.value)} />
                <div className="p-2 border rounded-lg bg-gray-100 text-sm text-gray-800 font-medium flex items-center justify-center">{(getOverheadHours(item.minutes) * (parseFloat(item.rate) || 0)).toFixed(2)}</div>
                {!item.saved ? (
                  <button 
                    onClick={() => handleSaveOverhead(item)} 
                    disabled={savingOverhead === item.id}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 text-blue-600 hover:bg-blue-500/30 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-0"
                    title="Save to recipe"
                  >
                    {savingOverhead === item.id ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                ) : <div></div>}
                {(overhead.length > 1 && !item.saved) ? <RemoveBtn onClick={() => removeOverhead(item.id)} /> : (overhead.length > 1 ? <div></div> : <div></div>)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── UPDATED Result Summary ── */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#18749b] to-[#2c5a97] flex items-center gap-2 rounded-t-xl">
            <Calculator size={20} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Cost Summary</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Three breakdown panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Stock Breakdown */}
              <div className="rounded-lg border border-blue-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                    <Package size={13} /> Stock / Ingredients
                  </span>
                  <span className="text-xs font-bold text-blue-800">LKR {result.stockTotal.toFixed(2)}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {stockLineItems.length > 0 ? stockLineItems.map((item, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">LKR {item.total}</span>
                    </div>
                  )) : (
                    <div className="px-4 py-3 flex items-center gap-2 text-xs text-red-600">
                      <Info size={13} /> No stock items with cost entered
                    </div>
                  )}
                </div>
              </div>

              {/* Labor Breakdown */}
              <div className="rounded-lg border border-green-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                    <Users size={13} /> Labor
                  </span>
                  <span className="text-xs font-bold text-blue-800">LKR {result.laborTotal.toFixed(2)}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {laborLineItems.length > 0 ? laborLineItems.map((item, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">LKR {item.total}</span>
                    </div>
                  )) : (
                    <div className="px-4 py-3 flex items-center gap-2 text-xs text-red-600">
                      <Info size={13} /> No labor hours recorded
                    </div>
                  )}
                </div>
              </div>

              {/* Overhead Breakdown */}
              <div className="rounded-lg border border-purple-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                    <Zap size={13} /> Overhead
                  </span>
                  <span className="text-xs font-bold text-blue-800">LKR {result.overheadTotal.toFixed(2)}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {overheadLineItems.length > 0 ? overheadLineItems.map((item, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">LKR {item.total}</span>
                    </div>
                  )) : (
                    <div className="px-4 py-3 flex items-center gap-2 text-xs text-red-600">
                      <Info size={13} /> No overhead costs entered
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total Cost row */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calculator size={15} className="text-gray-500" />
                Total Cost
                <span className="text-xs font-normal text-gray-600">(Stock + Labor + Overhead)</span>
              </span>
              <span className="text-lg font-bold text-gray-800">LKR {result.totalCost.toFixed(2)}</span>
            </div>

            {/* Suggested Selling Price */}
            <div className="bg-gradient-to-r from-[#18749b] to-[#2c5a97] rounded-lg px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 text-blue-100">
                <TrendingUp size={18} />
                <span className="text-sm font-medium">
                  Suggested Selling Price
                  <span className="ml-1 text-blue-200">({result.margin}% margin)</span>
                </span>
              </div>
              <span className="text-3xl font-bold text-white">LKR {result.suggestedPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          aria-busy={isSaving}
          className={`inline-flex items-center gap-2 bg-gradient-to-r from-[#18749b] to-[#2c5a97] text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all text-sm ${isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:from-[#0f5a7a] hover:to-[#1e3f6b]'}`}
        >
          {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Calculation'}
        </button>
      </div>
    </div>
  );
};

export default CalculateSection;