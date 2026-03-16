import React, { useState, useRef, useEffect } from "react";

const SearchableSelect = ({ options = [], value = "", onChange, placeholder = "-- Select --", className = "", disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const [dropUp, setDropUp] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(192);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => setQuery(""), [value]);

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const buffer = 16; // keep a little breathing room from viewport edge

    // If there's not enough space below, open upwards
    if (spaceBelow < 220 && spaceAbove > spaceBelow) {
      setDropUp(true);
      setMenuMaxHeight(Math.max(120, Math.floor(spaceAbove - buffer)));
    } else {
      setDropUp(false);
      setMenuMaxHeight(Math.max(120, Math.floor(spaceBelow - buffer)));
    }
  }, [open]);

  // normalize options to objects: { value, label }
  const norm = options.map((o) => {
    if (typeof o === 'string') return { value: o, label: o };
    if (o && typeof o === 'object') {
      // common shapes: { id, name } or { value, label }
      if ('value' in o && 'label' in o) return { value: o.value, label: o.label };
      if ('id' in o && ('name' in o || 'RecipeName' in o)) return { value: o.id ?? o.Id ?? o.RecipeId, label: o.name ?? o.Name ?? o.RecipeName };
      if ('id' in o && 'name' in o) return { value: o.id, label: o.name };
      if ('RecipeId' in o || 'RecipeName' in o) return { value: o.RecipeId ?? o.Id, label: o.RecipeName ?? o.Name };
      // fallback: try to use first string field
      const label = o.label || o.name || o.Name || o.RecipeName || JSON.stringify(o);
      const val = o.value || o.id || o.RecipeId || o.Id || label;
      return { value: val, label };
    }
    return { value: '', label: '' };
  });

  const filtered = norm.filter((o) => (o.label || "").toLowerCase().includes(query.toLowerCase()));

  const selectedLabel = (() => {
    const found = norm.find(n => String(n.value) === String(value));
    return found ? found.label : "";
  })();

  return (
    <div className="relative w-full" ref={ref}>
      <input
        type="text"
        className={className + " w-full" + (disabled ? " bg-gray-100 cursor-not-allowed" : "")}
        value={open ? query : (selectedLabel || "")}
        placeholder={placeholder}
        onFocus={() => !disabled && setOpen(true)}
        onChange={(e) => { if (!disabled) { setQuery(e.target.value); setOpen(true); } }}
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        readOnly={disabled}
      />
      {!disabled && (
        <button type="button" onClick={() => setOpen((s) => !s)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-auto">
          ▾
        </button>
      )}

      {open && !disabled && (
        <ul
          className="absolute z-50 mt-1 w-full overflow-auto bg-white border border-gray-200 rounded shadow-sm"
          style={{
            maxHeight: `${menuMaxHeight}px`,
            top: dropUp ? 'auto' : 'calc(100% + 0.25rem)',
            bottom: dropUp ? 'calc(100% + 0.25rem)' : 'auto',
          }}
        >
          {filtered.length ? (
            filtered.map((o) => (
              <li key={String(o.value)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setOpen(false); }}>
                {o.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No results</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
