import { Outlet } from "react-router-dom";
import Header from "@/components/Admin/Header";
import Sidebar from "@/components/Admin/Sidebar";
import { useState, useEffect } from "react";

const AdminLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="font-sans min-h-screen flex flex-col lg:flex-row">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <Header
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-6 lg:ml-64 pt-20">
          <Outlet /> {/* Renders pages like Reports */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;