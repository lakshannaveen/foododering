import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import StockSection from "./StockSection";
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
  const active = searchParams.get("active") || "stock";

  const tabClass = (name) =>
    `px-3 py-2 rounded ${active === name ? "bg-white border border-gray-300 shadow text-gray-900 font-semibold" : "bg-gray-200 text-gray-700"}`;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-2xl font-semibold mb-4">Recipe Calculator</h3>

      <div className="flex gap-2 mb-4">
        <Link to="?active=stock" className={tabClass("stock")}>Stock</Link>
        <Link to="?active=labor" className={tabClass("labor")}>Labor</Link>
        <Link to="?active=overhead" className={tabClass("overhead")}>Overhead</Link>
        <Link to="?active=calculate" className={tabClass("calculate")}>Calculate</Link>
      </div>

      <div className="space-y-3">
        {active === "stock" ? (
          <StockSection initialItems={[
            { id: 's1', name: 'Rice (50kg)', quantity: '50', unit: 'kg', unitPrice: '125.00' },
            { id: 's2', name: 'Chicken (10kg)', quantity: '10', unit: 'kg', unitPrice: '800.00' },
            { id: 's3', name: 'Onion (5kg)', quantity: '5', unit: 'kg', unitPrice: '150.00' }
          ]} />
        ) : active === "labor" ? (
          <LaborSection initialLabor={[{ id: 'l1', roleName: 'Head Cook', price: '50000', paymentType: 'monthly' }, { id: 'l2', roleName: 'Sous Chef', price: '35000', paymentType: 'monthly' }]} />
        ) : active === "overhead" ? (
          <OverheadSection initialOverhead={[{ id: 'o1', name: 'Electricity', cost: '12000' }, { id: 'o2', name: 'Gas', cost: '4000' }]} />
        ) : (
          <CalculateSection />
        )}
      </div>
    </div>
  );
};

export default RecipeCalculatorTab;
