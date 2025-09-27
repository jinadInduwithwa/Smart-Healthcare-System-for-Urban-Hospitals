
import { FaMoon, FaSun, FaBell } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { MdOutlinePowerSettingsNew } from "react-icons/md";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

interface HeaderProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
  toggleSidebar: () => void;
  isSidebarOpen: boolean; // Prop to track sidebar visibility
}

const Header = ({ toggleDarkMode, darkMode, toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    if (!isAuthenticated) {
      toast.error("You are not logged in.");
      return;
    }

    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <nav className={`fixed top-0 z-50 w-screen bg-blue-700 dark:bg-blue-800  border-blue-800  text-white ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        <div className="px-3 py-3 lg:px-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 lg:hidden"
                aria-label="Toggle sidebar"
              >
                <HiOutlineMenuAlt2 className="text-2xl text-blue-100 dark:text-blue-200" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800">
                <FaBell className="text-xl text-blue-100 dark:text-blue-200" />
              </button>
            </div>
           
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 min-w-[40px] flex items-center justify-center"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-blue-100" />}
              </button>
              {/* User Dropdown */}
              {isAuthenticated && user && (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    onBlur={handleBlur}
                    className="flex items-center space-x-2 p-2 text-blue-100 hover:bg-blue-700 dark:text-blue-200 dark:hover:bg-blue-800 rounded-full focus:outline-none"
                    aria-label="User menu"
                  >
                    <FiUser className="text-xl" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.email || "Dr. User"}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-blue-600 dark:bg-blue-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-lg">
                      <Link
                        to="/doctor-dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-800"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiUser className="mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-blue-100 hover:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        <MdOutlinePowerSettingsNew className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
