import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type AppUser = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  patientId?: string | number;
};

const NavItem = ({ to, label }: { to: string; label: string }) => {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded-md text-sm font-medium ${
        active
          ? "bg-white text-blue-900 shadow-sm"
          : "text-white/90 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
};

function getInitials(u?: AppUser) {
  const a = (u?.firstName || "").trim();
  const b = (u?.lastName || "").trim();
  const fallback = (u?.name || u?.email || "").trim();
  const fromNames = [a[0], b[0]].filter(Boolean).join("");
  if (fromNames) return fromNames.toUpperCase();
  if (fallback) return fallback[0]!.toUpperCase();
  return "U";
}

function Avatar({ user }: { user?: AppUser }) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt="profile"
        className="w-12 h-12 rounded-full border-2 border-white/40 object-cover"
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center text-white font-semibold"
      aria-label="user avatar"
    >
      {getInitials(user)}
    </div>
  );
}

export default function Sidebar() {
  const auth = (typeof useAuth === "function" ? useAuth() : null) as any;
  let user: AppUser | undefined = auth?.user;
  if (!user) {
    try {
      const raw = localStorage.getItem("user");
      if (raw) user = JSON.parse(raw) as AppUser;
    } catch {
      /* ignore */
    }
  }

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "User");

  const patientId =
    user?.patientId ??
    (user?._id ? `#${String(user._id).slice(-5).toUpperCase()}` : "—");

  const handleLogout = () => {
    if (auth && typeof auth.logout === "function") {
      auth.logout();
      window.location.href = "/signin";
    }
  };

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 flex flex-col text-white shadow-lg z-40"
      style={{
        background: "linear-gradient(180deg,#214E8A 0%,#2A6CB0 100%)",
      }}
    >
      {/* Profile */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/20">
        <Avatar user={user} />
        <div>
          <div className="font-semibold leading-tight">{displayName}</div>
          {user?.email && (
            <div className="text-xs opacity-80">{user.email}</div>
          )}
          <div className="text-xs opacity-80">Patient ID: {patientId}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-1 overflow-y-auto flex-1">
        <NavItem to="/patient/profile" label="My Profile" />
        <NavItem to="/patient/book" label="Book Appointment" />
        <NavItem to="/patient/my-appointments" label="My Appointments" />
        <NavItem to="/patient/past-records" label="Past Records" />
        <NavItem to="/patient/medical-history" label="Medical History" />
        <NavItem to="/patient/payments" label="Payment Management" />
        
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
