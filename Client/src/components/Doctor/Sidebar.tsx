
import { Link, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiBook,
  FiPieChart,
  FiUser,
  FiUsers,
  FiHome,
} from "react-icons/fi";
import { MdOutlinePowerSettingsNew } from "react-icons/md";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

interface SubMenuItem {
  path: string;
  title: string;
}

interface MenuItem {
  path?: string;
  title: string;
  icon: JSX.Element;
  subItems?: SubMenuItem[];
  onClick?: () => void;
}

const menuItems: MenuItem[] = [
  { path: "/doctor-dashboard/overview", title: "Overview", icon: <FiPieChart /> },
  {
    path: "/doctor-dashboard/appointments",
    title: "Appointments",
    icon: <FiCalendar />,
    subItems: [
      { path: "/doctor-dashboard/appointments/schedule", title: "Schedule" },
      { path: "/doctor-dashboard/appointments/history", title: "History" },
    ],
  },
  {
    path: "/doctor-dashboard/patient-records",
    title: "Patient Records",
    icon: <FiBook />,
    subItems: [
      { path: "/doctor-dashboard/patient-records/all", title: "All Records" },
      { path: "/doctor-dashboard/patient-records/card", title: "Search Card" },
    ],
  },
  {
    path: "/doctor-dashboard/settings",
    title: "Settings",
    icon: <FiHome />,
    subItems: [
      { path: "/doctor-dashboard/settings/profile", title: "Profile" },
      { path: "/doctor-dashboard/settings/notifications", title: "Notifications" },
    ],
  },
  {
    path: "/doctor-dashboard/patients",
    title: "Patients",
    icon: <FiUsers />,
    subItems: [
      { path: "/doctor-dashboard/patients/active", title: "Active Patients" },
      { path: "/doctor-dashboard/patients/archived", title: "Archived Patients" },
    ],
  },
  {
    path: "/doctor-dashboard/profile",
    title: "Profile",
    icon: <FiUser />,
  },
  {
    title: "Logout",
    icon: <MdOutlinePowerSettingsNew />,
    onClick: () => {},
  },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, toggleSidebar }: SidebarProps) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

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
    }
  };

  const toggleMenu = (path: string) => {
    setOpenMenus((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]
    );
  };

  const updatedMenuItems = menuItems.map((item) =>
    item.title === "Logout" ? { ...item, onClick: handleLogout } : item
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 bg-blue-700 text-white dark:bg-blue-800 transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          {/* Profile Header */}
          <div className="mb-6 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src="/assets/Home/doctor_avatar.jpg" // Replace with actual doctor avatar path
                  alt="Doctor Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() || "Dr. User" : "Dr. User"}
                </h3>
                <p className="text-blue-100 text-sm truncate">
                  Doctor ID: #{user?.id || "DOC123"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            className="p-2 text-white hover:bg-blue-700 rounded-lg mb-4 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <ul className="space-y-2 font-medium">
            {updatedMenuItems.map((item) => (
              <li key={item.title}>
                {item.subItems ? (
                  <div
                    className="flex items-center p-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                    onClick={() => toggleMenu(item.path!)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="flex-1">{item.title}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openMenus.includes(item.path!) ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    onClick={item.onClick}
                    className={`flex items-center p-2 rounded-lg hover:bg-blue-700 ${
                      item.onClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {item.path ? (
                      <Link to={item.path} className="flex items-center w-full text-white">
                        <span className="mr-3">{item.icon}</span>
                        <span className="flex-1">{item.title}</span>
                      </Link>
                    ) : (
                      <>
                        <span className="mr-3">{item.icon}</span>
                        <span className="flex-1">{item.title}</span>
                      </>
                    )}
                  </div>
                )}
                {item.subItems && openMenus.includes(item.path!) && (
                  <ul className="pl-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.path}>
                        <Link
                          to={subItem.path}
                          className="flex items-center p-2 text-sm text-white rounded-lg hover:bg-blue-700"
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
