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
        active ? "bg-white text-blue-900 shadow-sm" : "text-white/90 hover:bg-white/10"
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
  // Pull user from AuthContext; if not present, try localStorage "user"
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

  return (
    <aside
      className="flex flex-col w-64 text-white rounded-r-xl"
      style={{
        minHeight: "100vh",
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
      <nav className="flex-1 px-3 py-6 space-y-1">
        <NavItem to="/patient/profile" label="My Profile" />
        <NavItem to="/patient/book" label="Book Appointment" />
        <NavItem to="/patient/my-appointments" label="My Appointments" />
        <NavItem to="/patient/past-records" label="Past Records" />
      </nav>
    </aside>
  );
}
