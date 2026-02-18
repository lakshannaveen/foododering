import React, { useEffect } from "react";
import {
  FaClipboardList,
  FaUtensils,
  FaTags,
  FaLayerGroup,
  FaTable,
  FaUsers,
  FaTimes,
  FaBars,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { sessionManager } from "../../utils/sessionManager";

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navigate = useNavigate();

  const colors = {
    primary: "bg-[#18749b]",
    primaryHover: "hover:bg-[#2E5A8A]",
    primaryBorder: "border-[#18749b]",
    activeBg: "bg-[#18749b]/20",
    text: "text-gray-100",
    textHover: "hover:text-white",
    sidebarBg: "bg-gray-900",
  };

  const tabs = [
    {
      id: "orders",
      name: "Orders",
      icon: <FaClipboardList className="text-lg" />,
    },
    {
      id: "menu",
      name: "Menu Items",
      icon: <FaUtensils className="text-lg" />,
    },
    {
      id: "categories",
      name: "Categories",
      icon: <FaTags className="text-lg" />,
    },
    {
      id: "subcategories",
      name: "Subcategories",
      icon: <FaLayerGroup className="text-lg" />,
    },
    { id: "tables", name: "Tables", icon: <FaTable className="text-lg" /> },
    { id: "users", name: "Users", icon: <FaUsers className="text-lg" /> },
  ];

  // Handle logout with confirmation
  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to logout?");
    if (!ok) return;
    try { sessionManager.clearAll(); } catch (e) {}
    try {
      // Remove admin/user related keys
      localStorage.removeItem("userInfo");
      localStorage.removeItem("restaurant-cart");
      sessionStorage.removeItem("restaurant-cart");
    } catch (e) {}
    navigate("/login");
  };

  // Set default tab to subcategories on page load/refresh
  useEffect(() => {
    if (!activeTab) {
      setActiveTab("subcategories");
    }
  }, [activeTab, setActiveTab]);

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobileOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-gray-900 text-[#18749b] shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaBars className="text-xl" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 h-full transition-all duration-300 ease-in-out transform ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } lg:translate-x-0 lg:shadow-none`}
      >
        <div
          className={`${colors.sidebarBg} ${colors.text} h-full p-6 flex flex-col gap-2 overflow-y-auto`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Admin Panel
            </h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Close Sidebar"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* User profile (mobile only) */}
          <div className="lg:hidden mb-4 p-3 bg-gray-800 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#18749b] flex items-center justify-center">
              <span className="font-semibold">A</span>
            </div>
            <div>
              <p className="font-medium">Admin User</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all w-full text-left group ${
                  activeTab === tab.id
                    ? `${colors.activeBg} text-white ${colors.primaryBorder} border-l-4 font-medium`
                    : `text-gray-300 ${colors.textHover} ${colors.primaryHover} hover:border-l-4 hover:border-[#18749b]/50`
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileOpen(false);
                }}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <span
                  className={`transition-transform ${
                    activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {tab.icon}
                </span>
                <span>{tab.name}</span>

              </button>
            ))}
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-lg transition-all w-full text-left text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm lg:hidden z-30 animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
