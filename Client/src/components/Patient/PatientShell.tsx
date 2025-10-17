import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

type Props = {
  title?: string;
  children?: React.ReactNode;
};

/**
 * PatientShell
 * - Keeps the blue sidebar fixed on the left
 * - Makes ONLY the main content scroll
 * - Offsets the content with a left margin equal to the sidebar width (w-64)
 */
export default function PatientShell({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content (scrollable) */}
      <main
        role="main"
        className="ml-64 h-screen overflow-y-auto"
      >
        <div className="p-4 md:p-6">
          {title && <h1 className="text-xl font-semibold mb-4">{title}</h1>}

          {/* If used as a wrapper, render children; otherwise render nested routes */}
          {children ? children : <Outlet />}
        </div>
      </main>
    </div>
  );
}
