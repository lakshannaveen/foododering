import React from "react";
import { useNavigate } from "react-router-dom";
import { sessionManager } from "../../utils/sessionManager";
import { FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa";

const AdminHeader = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to logout?");
    if (!ok) return;
    try { sessionManager.clearAll(); } catch (e) {}
    try {
      // Remove only admin-related keys to avoid side-effects on other users/sessions
      localStorage.removeItem("userInfo");
      localStorage.removeItem("restaurant-cart");
      sessionStorage.removeItem("restaurant-cart");
    } catch (e) {}
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Page Title */}
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h1>

        {/* Right: User & Actions */}
        <div className="flex items-center gap-3">
          {/* Settings */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-md border border-red-100 bg-white/80"
            title="Logout"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* User Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white font-medium"></div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
