import { useState } from "react";
import {
  FaCreditCard,
  FaHistory,
  FaReceipt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";
import OutstandingPayments from "./OutstandingPayments";
import PaymentHistory from "./PaymentHistory";

type TabType = "outstanding" | "history";

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("outstanding");

  const tabs = [
    {
      id: "outstanding" as TabType,
      label: "Outstanding Payments",
      icon: FaExclamationTriangle,
      description: "View and manage pending payments",
    },
    {
      id: "history" as TabType,
      label: "Payment History",
      icon: FaHistory,
      description: "View past payment records",
    },
  ];

  return (
    <div className="px-6 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Payment Management
        </h1>
        <p className="text-slate-600">
          Manage your outstanding payments and view payment history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-4 bg-slate-50">
          <p className="text-sm text-slate-600">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "outstanding" && <OutstandingPayments />}
        {activeTab === "history" && <PaymentHistory />}
      </div>
    </div>
  );
}
