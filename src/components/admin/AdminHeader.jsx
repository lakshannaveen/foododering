import React from "react";
import { FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa";

const AdminHeader = ({ title }) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Page Title */}
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          {title}
        </h1>

        {/* Right: User & Actions */}
        <div className="flex items-center gap-3">
          {/* Settings */}
         

          {/* User Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white font-medium">

          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
