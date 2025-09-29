import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function PatientShell() {
  return (
    <div className="flex">
      {/* Always visible (no 'hidden md:flex') */}
      <Sidebar />
      <main className="flex-1 px-6 md:px-10 py-6 bg-slate-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
