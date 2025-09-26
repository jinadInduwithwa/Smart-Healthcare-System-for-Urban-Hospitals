import { Link, useLocation } from "react-router-dom";
import { HiHome, HiSearch } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon } from "@heroicons/react/24/outline"; // Changed from ShoppingCartIcon
import { FiUser, FiClipboard } from "react-icons/fi"; // Changed from FiPackage to FiClipboard for appointments

function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      name: "Home",
      icon: HiHome,
      path: "/",
    },
    {
      name: "Search",
      icon: HiSearch,
      path: "/search",
    },
    {
      name: "Book",
      icon: CalendarIcon,
      path: "/book-appointment",
    },
    {
      name: "Appointments",
      icon: FiClipboard,
      path: "/my-appointments",
    },
    {
      name: "Account",
      icon: FiUser,
      path: isAuthenticated ? "/profile" : "/signin",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-1 ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default MobileBottomNav;