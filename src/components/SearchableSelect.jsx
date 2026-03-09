import React, { useState, useRef, useEffect } from "react";

const SearchableSelect = ({ options = [], value = "", onChange, placeholder = "-- Select --", className = "" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => setQuery(""), [value]);

  const filtered = options.filter((o) => (o || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative w-full" ref={ref}>
      <input
        type="text"
        className={className + " w-full"}
        value={open ? query : (value || "")}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onClick={() => setOpen(true)}
      />
      <button type="button" onClick={() => setOpen((s) => !s)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-auto">
        ▾
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-200 rounded shadow-sm">
          {filtered.length ? (
            filtered.map((o) => (
              <li key={o} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onMouseDown={(e) => { e.preventDefault(); onChange(o); setOpen(false); }}>
                {o}
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
