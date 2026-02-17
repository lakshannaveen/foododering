import React, { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import MenuTab from "../components/admin/MenuTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import SubcategoriesTab from "../components/admin/SubcategoriesTab";
import TablesTab from "../components/admin/TableTab";
import UsersTab from "../components/admin/UsersTab";
import OrderTab from "../components/admin/OrderTab"; // ✅ fixed import
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Protect route: check for token in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    const token = stored ? JSON.parse(stored).token : null;
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-0 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "subcategories" && <SubcategoriesTab />}
          {activeTab === "menu" && <MenuTab />}
          {activeTab === "tables" && <TablesTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "orders" && <OrderTab />} {/* ✅ corrected */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
