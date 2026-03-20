




import React, { useState, useEffect } from "react";
import { getAllMenuItems } from "../../services/menuService";

const RecipeModal = ({ isOpen, onClose, form, setForm, onSave, onCancel, ingredientsList }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);

  // Fetch menu items when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchMenuItems = async () => {
        setLoadingMenuItems(true);
        try {
          const data = await getAllMenuItems();
          const list = data?.ResultSet || [];
          setMenuItems(list);
          
          // If editing an existing recipe, pre-select the menu item and size
          if (form.menuItemId || form.menuItemName) {
            let menuItem = null;
            
            // First try to find by menuItemId
            if (form.menuItemId) {
              menuItem = list.find(m => 
                String(m.MenuItemId) === String(form.menuItemId) || 
                m.MenuItemId === form.menuItemId
              );
            }
            
            // If not found by ID, try to find by menuItemName
            if (!menuItem && form.menuItemName) {
              menuItem = list.find(m => m.MenuItemName === form.menuItemName);
            }
            
            if (menuItem) {
              setSelectedMenuItem(menuItem);
              setAvailableSizes(menuItem.Sizes || []);
              
              // Auto-select the size
              if (form.menuItemSizeId && menuItem.Sizes) {
                const matchingSize = menuItem.Sizes.find(s => 
                  String(s.MenuItemSizeId) === String(form.menuItemSizeId) ||
                  s.MenuItemSizeId === form.menuItemSizeId
                );
                if (matchingSize) {
                  setForm(f => ({
                    ...f,
                    menuItemId: f.menuItemId || menuItem.MenuItemId,
                    menuItemName: f.menuItemName || menuItem.MenuItemName,
                    menuItemSizeId: matchingSize.MenuItemSizeId,
                    size: matchingSize.Size
                  }));
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch menu items:", error);
        } finally {
          setLoadingMenuItems(false);
        }
      };
      fetchMenuItems();
    } else {
      // Reset state when modal closes
      setMenuItems([]);
      setSelectedMenuItem(null);
      setAvailableSizes([]);
    }
  }, [isOpen]);

  // Additional effect to handle pre-selecting when menu items are already loaded
  useEffect(() => {
    if (isOpen && menuItems.length > 0) {
      let menuItem = null;
      
      // First try to find by menuItemId (if available)
      if (form.menuItemId) {
        menuItem = menuItems.find(m => 
          String(m.MenuItemId) === String(form.menuItemId) || 
          m.MenuItemId === form.menuItemId
        );
      }
      
      // If not found by ID, try to find by menuItemName
      if (!menuItem && form.menuItemName) {
        menuItem = menuItems.find(m => 
          m.MenuItemName === form.menuItemName
        );
      }
      
      if (menuItem) {
        setSelectedMenuItem(menuItem);
        setAvailableSizes(menuItem.Sizes || []);
        
        // Auto-select size if we have menuItemSizeId
        if (form.menuItemSizeId && menuItem.Sizes) {
          const matchingSize = menuItem.Sizes.find(s => 
            String(s.MenuItemSizeId) === String(form.menuItemSizeId) ||
            s.MenuItemSizeId === form.menuItemSizeId
          );
          if (matchingSize) {
            setForm(f => ({
              ...f,
              menuItemId: f.menuItemId || menuItem.MenuItemId,
              menuItemName: f.menuItemName || menuItem.MenuItemName,
              menuItemSizeId: matchingSize.MenuItemSizeId,
              size: matchingSize.Size
            }));
          }
        }
      }
    }
  }, [isOpen, form.menuItemId, form.menuItemName, form.menuItemSizeId, menuItems]);

  // Auto-select the size when editing (after availableSizes is populated)
  // This is now handled in the other useEffects above

  // Handle form changes when editing (modal already open)
  useEffect(() => {
    if (!isOpen) return;
    
    // When form changes and has menuItemId or menuItemName, ensure menu item is selected
    if ((form.menuItemId || form.menuItemName) && menuItems.length > 0) {
      let menuItem = null;
      
      // First try to find by menuItemId
      if (form.menuItemId) {
        menuItem = menuItems.find(m => 
          String(m.MenuItemId) === String(form.menuItemId) || 
          m.MenuItemId === form.menuItemId
        );
      }
      
      // If not found by ID, try to find by menuItemName
      if (!menuItem && form.menuItemName) {
        menuItem = menuItems.find(m => m.MenuItemName === form.menuItemName);
      }
      
      if (menuItem) {
        // Only update if not already set or if different
        if (!selectedMenuItem || String(selectedMenuItem.MenuItemId) !== String(menuItem.MenuItemId)) {
          setSelectedMenuItem(menuItem);
          setAvailableSizes(menuItem.Sizes || []);
        }
        
        // Update form with menuItemId if not set
        if (!form.menuItemId) {
          setForm(f => ({ ...f, menuItemId: menuItem.MenuItemId }));
        }
        
        // Auto-select size if available
        if (form.menuItemSizeId && menuItem.Sizes && menuItem.Sizes.length > 0) {
          const matchingSize = menuItem.Sizes.find(s => 
            String(s.MenuItemSizeId) === String(form.menuItemSizeId) ||
            s.MenuItemSizeId === form.menuItemSizeId
          );
          if (matchingSize) {
            setForm(f => ({
              ...f,
              menuItemId: f.menuItemId || menuItem.MenuItemId,
              menuItemName: f.menuItemName || menuItem.MenuItemName,
              menuItemSizeId: matchingSize.MenuItemSizeId,
              size: matchingSize.Size
            }));
          }
        }
      }
    }
  }, [form.menuItemId, form.menuItemName, form.menuItemSizeId, menuItems, isOpen]);

  // Handle menu item selection
  const handleMenuItemChange = (e) => {
    const menuItemId = e.target.value;
    if (!menuItemId) {
      setSelectedMenuItem(null);
      setAvailableSizes([]);
      setForm(f => ({ ...f, menuItemId: "", menuItemName: "", menuItemSizeId: "", size: "" }));
      return;
    }

    const menuItem = menuItems.find(m => m.MenuItemId === menuItemId || m.MenuItemId === String(menuItemId));
    if (menuItem) {
      setSelectedMenuItem(menuItem);
      setAvailableSizes(menuItem.Sizes || []);
      setForm(f => ({ 
        ...f, 
        menuItemId: menuItem.MenuItemId, 
        menuItemName: menuItem.MenuItemName,
        menuItemSizeId: "",
        size: ""
      }));
    }
  };

  // Handle size selection
  const handleSizeChange = (e) => {
    const sizeId = e.target.value;
    if (!sizeId) {
      setForm(f => ({ ...f, menuItemSizeId: "", size: "" }));
      return;
    }

    const size = availableSizes.find(s => s.MenuItemSizeId === sizeId || s.MenuItemSizeId === String(sizeId));
    if (size) {
      setForm(f => ({ 
        ...f, 
        menuItemSizeId: size.MenuItemSizeId, 
        size: size.Size 
      }));
    }
  };

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{form.id ? 'Edit Recipe' : 'Add Recipe'}</h3>

        {/* Menu Item Dropdown */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-12 font-semibold text-sm text-gray-600">Menu Item *</div>
        </div>
        <div className="mt-1 grid grid-cols-12 gap-3 items-center">
          <select
            value={form.menuItemId || ""}
            onChange={handleMenuItemChange}
            disabled={loadingMenuItems}
            className="col-span-12 p-2 border rounded bg-white disabled:bg-gray-100"
          >
            <option value="">Select Menu Item</option>
            {menuItems.map(item => (
              <option key={item.MenuItemId} value={item.MenuItemId}>
                {item.MenuItemName}
              </option>
            ))}
          </select>
        </div>

        {/* Size Dropdown - Disabled until Menu Item is selected */}
        <div className="mt-4 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-12 font-semibold text-sm text-gray-600">Size *</div>
        </div>
        <div className="mt-1 grid grid-cols-12 gap-3 items-center">
          <select
            value={form.menuItemSizeId || ""}
            onChange={handleSizeChange}
            disabled={!selectedMenuItem || availableSizes.length === 0}
            className="col-span-12 p-2 border rounded bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Size</option>
            {availableSizes.map(size => (
              <option key={size.MenuItemSizeId} value={size.MenuItemSizeId}>
                {size.Size}
              </option>
            ))}
          </select>
        </div>

        {/* Recipe Name */}
        <div className="mt-4 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-12 font-semibold text-sm text-gray-600">Recipe Name *</div>
        </div>
        <div className="mt-1 grid grid-cols-12 gap-3 items-center">
          <input
            type="text"
            placeholder="Recipe name"
            value={form.name || ""}
            onChange={(e) => update('name', e.target.value)}
            className="col-span-12 p-2 border rounded"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
          <button 
            onClick={onSave} 
            disabled={!form.name || !form.menuItemId || !form.menuItemSizeId}
            className="px-4 py-2 bg-[#18749b] hover:bg-[#2c5a97] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
