import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaSync,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaLayerGroup,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  fetchCategories,
  addCategory,
  toggleCategoryStatus, // ✅ updated import
} from "../../actions/categoryActions";

const CategoriesTab = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);

  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({
    Name: "",
    Status: "A",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCategories());
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleAddCategory = () => {
    if (!newCategory.Name.trim())
      return toast.error("Category name is required");
    dispatch(addCategory(newCategory));
    setNewCategory({ Name: "", Status: "A" });
    setIsAdding(false);
  };

  const handleToggleStatus = (category) => {
    dispatch(toggleCategoryStatus(category));
  };

  const paginatedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    const startIdx = (currentPage - 1) * pageSize;
    return categories.slice(startIdx, startIdx + pageSize);
  }, [categories, currentPage]);

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

  return (
    <div>
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#18749b] to-[#5A8FD1] rounded-lg">
            <FaLayerGroup className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
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
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-[#18749b] hover:bg-[#2c5a97] transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Category</h3>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategory({ Name: "", Status: "A" });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCategory();
                }}
                className="space-y-4"
              >
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategory.Name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, Name: e.target.value })
                    }
                    placeholder="Enter category name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                    required
                  />
                </div>

                {/* Status Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={newCategory.Status}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, Status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  >
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewCategory({ Name: "", Status: "A" });
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newCategory.Name.trim()}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {categories.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * pageSize + 1, categories.length)} to{" "}
              {Math.min(currentPage * pageSize, categories.length)} of {categories.length} items
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
                onClick={() => setCurrentPage(Math.min(Math.ceil(categories.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(categories.length / pageSize)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading categories...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 text-red-500 bg-red-50 border-b border-red-200">
            {error}
          </div>
        )}

        {!loading && categories?.length === 0 && (
          <div className="text-center py-12">
            <FaLayerGroup className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500">
              No categories have been added yet.
            </p>
          </div>
        )}

        {!loading && categories?.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCategories.map((cat) => (
                    <tr
                      key={cat.CategoryId}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {cat.CategoryId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {cat.Name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            cat.Status
                          )}`}
                        >
                          {getStatusIcon(cat.Status)}
                          <span className="ml-1">
                            {cat.Status === "A" ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat.CategoryId}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#18749b] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {cat.CategoryId}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {cat.Name}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          cat.Status
                        )}`}
                      >
                        {getStatusIcon(cat.Status)}
                        <span className="ml-1">
                          {cat.Status === "A" ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </div>
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

export default CategoriesTab;
