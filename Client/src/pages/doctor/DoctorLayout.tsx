
import { Outlet } from "react-router-dom";
import Header from "@/components/Doctor/Header";
import Sidebar from "@/components/Doctor/Sidebar";
import { useState, useEffect } from "react";

const DoctorLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar always visible by default

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
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="p-6 lg:ml-64 pt-20">
          <Outlet /> {/* This renders Patient Records, Appointments, etc. */}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
