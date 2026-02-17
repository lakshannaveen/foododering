import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPlus,
  FaListAlt,
  FaSearch,
  FaSync,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  fetchAllSubcategories,
  addNewSubcategory,
  toggleSubcategoryStatus,
} from "../../actions/subcategoryActions";
import { fetchCategories } from "../../actions/categoryActions";

const SubcategoriesTab = () => {
  const dispatch = useDispatch();
  const {
    subcategories = [],
    loading,
    error,
  } = useSelector((state) => state.subcategory || {});
  const { categories = [] } = useSelector((state) => state.category || {});

  const [isAdding, setIsAdding] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({
    Name: "",
    CategoryId: "",
    Status: "A",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  const getCategoryName = (CategoryId) => {
    const category = categories.find((cat) => cat.CategoryId === CategoryId);
    return category ? category.Name : "Unknown";
  };

  useEffect(() => {
    dispatch(fetchAllSubcategories());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllSubcategories());
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggleStatus = (subcategory) => {
    dispatch(toggleSubcategoryStatus(subcategory));
  };

  const paginatedSubcategories = useMemo(() => {
    if (!Array.isArray(subcategories)) return [];
    const startIdx = (currentPage - 1) * pageSize;
    return subcategories.slice(startIdx, startIdx + pageSize);
  }, [subcategories, currentPage]);
  const handleAddSubcategory = () => {
    if (!newSubcategory.Name || !newSubcategory.CategoryId) return;

    dispatch(addNewSubcategory(newSubcategory));
    setIsAdding(false);
    setNewSubcategory({ Name: "", CategoryId: "" });
  };
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
    return status === "A" ? (
      <FaCheckCircle className="w-3 h-3" />
    ) : (
      <FaTimesCircle className="w-3 h-3" />
    );
  };

  return (
    <div>
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#18749b] to-[#5A8FD1] rounded-lg">
            <FaListAlt className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Subcategories</h2>
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
            <span>Add Subcategory</span>
          </button>
        </div>
      </div>

      {/* Add Subcategory Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Subcategory</h3>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewSubcategory({ Name: "", CategoryId: "", Status: "A" });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSubcategory();
                }}
                className="space-y-4"
              >
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subcategory Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSubcategory.Name}
                    onChange={(e) =>
                      setNewSubcategory({ ...newSubcategory, Name: e.target.value })
                    }
                    placeholder="Enter subcategory name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                    required
                  />
                </div>

                {/* Parent Category Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newSubcategory.CategoryId}
                    onChange={(e) =>
                      setNewSubcategory({
                        ...newSubcategory,
                        CategoryId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.CategoryId} value={category.CategoryId}>
                        {category.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={newSubcategory.Status}
                    onChange={(e) =>
                      setNewSubcategory({
                        ...newSubcategory,
                        Status: e.target.value,
                      })
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
                      setNewSubcategory({ Name: "", CategoryId: "", Status: "A" });
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newSubcategory.Name || !newSubcategory.CategoryId}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    Add Subcategory
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {subcategories.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * pageSize + 1, subcategories.length)} to{" "}
              {Math.min(currentPage * pageSize, subcategories.length)} of {subcategories.length} items
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
                onClick={() => setCurrentPage(Math.min(Math.ceil(subcategories.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(subcategories.length / pageSize)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600">Loading subcategories...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 text-red-500 bg-red-50 border-b border-red-200">
            {error}
          </div>
        )}

        {!loading && subcategories.length === 0 && (
          <div className="text-center py-12">
            <FaListAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No subcategories found
            </h3>
            <p className="text-gray-500">
              No subcategories have been added yet.
            </p>
          </div>
        )}

        {!loading && subcategories.length > 0 && (
          <>
            <div className="overflow-x-auto">
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
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSubcategories.map((subcategory) => (
                    <tr
                      key={subcategory.SubCategoryId}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {subcategory.SubCategoryId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subcategory.Name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getCategoryName(subcategory.CategoryId)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {subcategory.CategoryId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(subcategory)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            subcategory.Status
                          )}`}
                        >
                          {getStatusIcon(subcategory.Status)}
                          <span className="ml-1">
                            {subcategory.Status === "A" ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubcategoriesTab;
