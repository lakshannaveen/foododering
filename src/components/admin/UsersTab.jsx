import React, { useEffect, useState, useMemo } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPlus,
  FaTimes,
  FaUserCircle,
  FaSync,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdmins } from "../../actions/adminActions";

const UsersTab = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admins);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;
  const [newUser, setNewUser] = useState({
    Name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAdmins());
    setTimeout(() => setRefreshing(false), 500);
  };

  const paginatedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    const startIdx = (currentPage - 1) * pageSize;
    return users.slice(startIdx, startIdx + pageSize);
  }, [users, currentPage]);

  return (
    <div>
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#18749b] to-[#5A8FD1] rounded-lg">
            <FaUser className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
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
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New User</h3>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewUser({ Name: "", email: "", password: "" });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: Add admin user API call
                  console.log("Adding user:", newUser);
                  setIsAdding(false);
                  setNewUser({ Name: "", email: "", password: "" });
                }}
                className="space-y-4"
              >
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.Name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, Name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Enter password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#18749b]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewUser({ Name: "", email: "", password: "" });
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newUser.Name || !newUser.email || !newUser.password}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {users.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * pageSize + 1, users.length)} to{" "}
              {Math.min(currentPage * pageSize, users.length)} of {users.length} items
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
                onClick={() => setCurrentPage(Math.min(Math.ceil(users.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(users.length / pageSize)}
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
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#18749b] border-t-transparent"></div>
              <span className="text-gray-600 text-lg">Loading users...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 text-red-700 bg-red-50 border-b border-red-200 flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <FaTimes className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium">Error loading users</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && users?.length === 0 && (
          <div className="text-center py-12">
            <FaUserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              No admin users have been added yet.
            </p>
          </div>
        )}

        {!loading && users.length > 0 && (
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
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.AdminId}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 text-sm">
                            {user.AdminId}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.Name}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaEnvelope className="w-4 h-4 text-gray-400 mr-2" />
                          {user.Email}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {paginatedUsers.map((user) => (
                <div
                  key={user.AdminId}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#18749b] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#18749b] to-[#2A4A76] rounded-full flex items-center justify-center text-white font-bold">
                        <FaUser className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {user.Name}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-1">ID:</span>
                          {user.AdminId}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-900 p-2 bg-gray-50 rounded-lg">
                      <FaEnvelope className="w-4 h-4 text-[#18749b] mr-2" />
                      <span className="truncate">{user.Email}</span>
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

export default UsersTab;
