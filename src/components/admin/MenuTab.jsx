import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPlus,
  FaEdit,
  FaTable,
  FaSearch,
  FaFilter,
  FaSync,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaUtensils,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import {
  fetchMenuItems,
  searchMenu,
  createMenuItem,
  editMenuItem,
  toggleMenuStatus,
} from "../../actions/menuActions";
import { fetchCategories } from "../../actions/categoryActions";
import { fetchAllSubcategories } from "../../actions/subcategoryActions";
import { API_URL } from "../../services/menuService";

const log = (...a) => console.log("%c[MenuTab]", "color:#059669", ...a);
const err = (...a) => console.error("%c[MenuTab:ERROR]", "color:#ef4444", ...a);

// Convert relative image path from backend to absolute URL
const toImageSrc = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const MenuTab = () => {
  const dispatch = useDispatch();
  const { menuItems, loading, error } = useSelector((state) => state.menu);
  const { categories } = useSelector((state) => state.category);
  const { subcategories } = useSelector((state) => state.subcategory);

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  const [newItem, setNewItem] = useState({
    Name: "",
    CategoryId: "",
    SubCategoryId: "",
    Description: "",
    Status: "A",
    Sizes: [{ Size: "", Price: "" }],
  });

  const getCategoryName = (id) =>
    categories?.find((c) => String(c.CategoryId) === String(id))?.Name || id;
  const getSubcategoryName = (id) =>
    subcategories?.find((s) => String(s.SubCategoryId) === String(id))?.Name ||
    id;

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchCategories());
    dispatch(fetchAllSubcategories());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMenuItems());
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleAddItem = async () => {
    const validSizes = newItem.Sizes.filter(
      (size) => size.Size.trim() && size.Price
    );

    if (validSizes.length === 0) {
      return;
    }

    const itemData = {
      ...newItem,
      SizesJson: JSON.stringify(validSizes),
    };

    await dispatch(createMenuItem(itemData, imageFile));

    setNewItem({
      MenuItemName: "",
      CategoryId: "",
      SubCategoryId: "",
      Description: "",
      Status: "A",
      Sizes: [{ Size: "", Price: "" }],
    });
    setImageFile(null);
    setIsAdding(false);
  };

  const handleUpdateItem = async () => {
    const validSizes = editingItem.Sizes.filter(
      (size) => size.Size.trim() && size.Price
    );

    if (validSizes.length === 0) {
      toast.error("Please add at least one size with price");
      return;
    }

    const itemData = {
      ...editingItem,
      SizesJson: JSON.stringify(validSizes),
    };

    await dispatch(editMenuItem(itemData, imageFile));
    setEditingItem(null);
    setImageFile(null);
  };

  const handleToggleStatus = async (item) => {
    try {
      await dispatch(toggleMenuStatus(item));


      // Refresh the data to ensure UI is in sync with the database
      dispatch(fetchMenuItems());
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const resetFilters = () => {
    setCurrentPage(1);
  };

  const handleEditItem = (item) => {
    const itemWithSizes = {
      ...item,
      Name: item.Name || item.MenuItemName || "",
      CategoryId: String(item.CategoryId || (item.Category && item.Category.CategoryId) || ""),
      Sizes:
        item.Sizes && item.Sizes.length > 0
          ? item.Sizes
          : [{ Size: "", Price: item.Price || "" }],
    };
    setEditingItem(itemWithSizes);
  };

  const addSize = (isEditing = false) => {
    const newSize = { Size: "", Price: "" };
    if (isEditing) {
      setEditingItem({
        ...editingItem,
        Sizes: [...editingItem.Sizes, newSize],
      });
    } else {
      setNewItem({
        ...newItem,
        Sizes: [...newItem.Sizes, newSize],
      });
    }
  };

  const removeSize = (index, isEditing = false) => {
    if (isEditing) {
      const updatedSizes = editingItem.Sizes.filter((_, i) => i !== index);
      setEditingItem({
        ...editingItem,
        Sizes:
          updatedSizes.length > 0 ? updatedSizes : [{ Size: "", Price: "" }],
      });
    } else {
      const updatedSizes = newItem.Sizes.filter((_, i) => i !== index);
      setNewItem({
        ...newItem,
        Sizes:
          updatedSizes.length > 0 ? updatedSizes : [{ Size: "", Price: "" }],
      });
    }
  };

  const updateSize = (index, field, value, isEditing = false) => {
    if (isEditing) {
      const updatedSizes = [...editingItem.Sizes];
      updatedSizes[index][field] = value;
      setEditingItem({
        ...editingItem,
        Sizes: updatedSizes,
      });
    } else {
      const updatedSizes = [...newItem.Sizes];
      updatedSizes[index][field] = value;
      setNewItem({
        ...newItem,
        Sizes: updatedSizes,
      });
    }
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems || [];
  }, [menuItems]);

  const getStatusColor = (status) => {
    switch (status) {
      case "A":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "I":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "A":
        return <FaCheckCircle className="w-3 h-3" />;
      case "I":
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaTimesCircle className="w-3 h-3" />;
    }
  };

  const formatPriceRange = (sizes) => {
    if (!sizes || sizes.length === 0) return "N/A";

    const prices = sizes
      .map((size) => parseFloat(size.Price))
      .filter((price) => !isNaN(price));
    if (prices.length === 0) return "N/A";

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `${minPrice.toFixed(2)}`;
    } else {
      return `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`;
    }
  };

  const paginatedMenuItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredMenuItems.slice(startIdx, startIdx + pageSize);
  }, [filteredMenuItems, currentPage]);

  const cancelForm = () => {
    setIsAdding(false);
    setEditingItem(null);
    setImageFile(null);
    setNewItem({
      MenuItemName: "",
      CategoryId: "",
      SubCategoryId: "",
      Description: "",
      Status: "A",
      Sizes: [{ Size: "", Price: "" }],
    });
  };

  return (
    <div>
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#18749b] to-[#5A8FD1] rounded-lg">
            <FaUtensils className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaSync className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setIsAdding(true);
              setCurrentPage(1);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-[#18749b] hover:bg-[#2c5a97] transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </h4>
                <button
                  onClick={cancelForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                {/* Name */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={
                      editingItem ? editingItem.Name : newItem.Name
                    }
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({
                            ...editingItem,
                            Name: e.target.value,
                          })
                        : setNewItem({ ...newItem, Name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                    placeholder="Enter item name"
                  />
                </div>

                {/* Status */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingItem ? editingItem.Status : newItem.Status}
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({ ...editingItem, Status: e.target.value })
                        : setNewItem({ ...newItem, Status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  >
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                </div>

                {/* Category */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={
                      editingItem ? editingItem.CategoryId : newItem.CategoryId
                    }
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({
                            ...editingItem,
                            CategoryId: e.target.value,
                          })
                        : setNewItem({ ...newItem, CategoryId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat.CategoryId} value={cat.CategoryId}>
                        {cat.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SubCategory */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <select
                    value={
                      editingItem
                        ? editingItem.SubCategoryId
                        : newItem.SubCategoryId
                    }
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({
                            ...editingItem,
                            SubCategoryId: e.target.value,
                          })
                        : setNewItem({ ...newItem, SubCategoryId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  >
                    <option value="">Select Subcategory</option>
                    {(editingItem
                      ? subcategories?.filter(
                          (sub) => String(sub.CategoryId) === String(editingItem.CategoryId)
                        )
                      : subcategories?.filter(
                          (sub) => String(sub.CategoryId) === String(newItem.CategoryId)
                        )
                    ).map((sub) => (
                      <option key={sub.SubCategoryId} value={sub.SubCategoryId}>
                        {sub.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={
                      editingItem ? editingItem.Description : newItem.Description
                    }
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({
                            ...editingItem,
                            Description: e.target.value,
                          })
                        : setNewItem({ ...newItem, Description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                    placeholder="Enter item description"
                  />
                </div>

                {/* Sizes Section */}
                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Sizes & Prices *
                    </label>
                    <button
                      type="button"
                      onClick={() => addSize(!!editingItem)}
                      className="inline-flex items-center space-x-2 px-3 py-2 text-sm bg-[#18749b] text-white rounded-lg hover:bg-[#2c5a97] transition-colors"
                    >
                      <FaPlus className="w-3 h-3" />
                      <span>Add Size</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(editingItem ? editingItem.Sizes : newItem.Sizes).map(
                      (sizeObj, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Size
                            </label>
                            <select
                              value={sizeObj.Size}
                              onChange={(e) =>
                                updateSize(
                                  index,
                                  "Size",
                                  e.target.value,
                                  !!editingItem
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                            >
                              <option value="">Select Size</option>
                              <option value="Small">Small</option>
                              <option value="Medium">Medium</option>
                              <option value="Large">Large</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={sizeObj.Price}
                              onChange={(e) =>
                                updateSize(
                                  index,
                                  "Price",
                                  e.target.value,
                                  !!editingItem
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                            />
                          </div>
                          {(editingItem ? editingItem.Sizes : newItem.Sizes)
                            .length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSize(index, !!editingItem)}
                              className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove size"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  />
                  {(editingItem?.ImageUrl || imageFile) && (
                    <div className="mt-4">
                      <img
                        src={
                          imageFile
                            ? URL.createObjectURL(imageFile)
                            : toImageSrc(editingItem.ImageUrl)
                        }
                        alt="Menu Item"
                        className="h-32 w-32 object-cover rounded-lg border"
                        onError={(ev) => {
                          err("image failed to load:", ev.currentTarget.src);
                          ev.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={cancelForm}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                >
                  Cancel
                </button>
                {editingItem ? (
                  <button
                    onClick={handleUpdateItem}
                    disabled={
                      !editingItem.MenuItemName ||
                      !editingItem.CategoryId ||
                      !editingItem.SubCategoryId ||
                      !editingItem.Sizes.some(
                        (size) => size.Size.trim() && size.Price
                      )
                    }
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Item
                  </button>
                ) : (
                  <button
                    onClick={handleAddItem}
                    disabled={
                      !newItem.Name ||
                      !newItem.CategoryId ||
                      !newItem.SubCategoryId ||
                      !newItem.Sizes.some((size) => size.Size.trim() && size.Price)
                    }
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredMenuItems.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredMenuItems.length)} to{" "}
              {Math.min(currentPage * pageSize, filteredMenuItems.length)} of {filteredMenuItems.length} items
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredMenuItems.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(filteredMenuItems.length / pageSize)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading menu items...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 text-red-500 bg-red-50 border-b border-red-200">
            {error}
          </div>
        )}

        {!loading && filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <FaTable className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-500">
              {menuItems.length === 0
                ? "No menu items have been added yet."
                : "Try adjusting your search or filters."}
            </p>
            {menuItems.length > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-[#18749b] hover:text-[#2c5a97]"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!loading && filteredMenuItems.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sizes & Prices
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedMenuItems.map((item) => (
                    <tr
                      key={item.MenuItemId}
                      className={`hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          {item.ImageUrl && (
                            <div className="relative">
                              <img
                                src={toImageSrc(item.ImageUrl)}
                                alt={item.MenuItemName}
                                className="h-12 w-12 object-cover rounded-lg"
                                onError={(ev) => {
                                  err(
                                    "image failed to load:",
                                    ev.currentTarget.src
                                  );
                                  ev.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {item.MenuItemName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.Description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCategoryName(item.CategoryId)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getSubcategoryName(item.SubCategoryId)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPriceRange(item.Sizes)}
                        </div>
                        {item.Sizes && item.Sizes.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.Sizes.map((size, index) => (
                              <div key={index}>
                                {size.Size}: 
                                {parseFloat(size.Price).toFixed(2)}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            item.Status
                          )}`}
                        >
                          {getStatusIcon(item.Status)}
                          <span className="ml-1">
                            {item.Status === "A" ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-all"
                        >
                          <FaEdit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {paginatedMenuItems.map((item) => (
                <div
                  key={item.MenuItemId}
                  className={`bg-white border border-gray-200 rounded-xl p-6 hover:border-[#18749b] hover:shadow-md transition-all duration-200 ${
                    item.Status === "I" ? "opacity-70 bg-gray-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {item.ImageUrl && (
                          <div className="relative">
                            <img
                              src={toImageSrc(item.ImageUrl)}
                              alt={item.MenuItemName}
                              className="h-16 w-16 object-cover rounded-lg"
                              onError={(ev) => {
                                err(
                                  "image failed to load:",
                                  ev.currentTarget.src
                                );
                                ev.currentTarget.style.display = "none";
                              }}
                            />
                            {item.Status === "I" && (
                              <div className="absolute inset-0 bg-gray-800 bg-opacity-40 rounded-lg flex items-center justify-center">
                                <FaEyeSlash className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            {item.Name}
                            {item.Status === "I" && (
                              <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Inactive
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium">
                            {formatPriceRange(item.Sizes)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="font-medium text-gray-700">
                              Category:
                            </span>
                            <div>{getCategoryName(item.CategoryId)}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Subcategory:
                            </span>
                            <div>{getSubcategoryName(item.SubCategoryId)}</div>
                          </div>
                        </div>

                        {item.Sizes && item.Sizes.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Available Sizes:
                            </span>
                            <div className="mt-1 space-y-1">
                              {item.Sizes.map((size, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span>{size.Size}</span>
                                  <span className="font-medium">
                                    {parseFloat(size.Price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.Description && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Description:
                            </span>{" "}
                            {item.Description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        item.Status
                      )}`}
                    >
                      {getStatusIcon(item.Status)}
                      <span className="ml-1">
                        {item.Status === "A" ? "Active" : "Inactive"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleEditItem(item)}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-all"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuTab;