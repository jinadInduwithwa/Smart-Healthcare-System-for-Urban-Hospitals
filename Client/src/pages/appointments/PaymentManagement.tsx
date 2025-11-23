import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
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
import { verifyStripePayment } from "@/utils/paymentApi";

type TabType = "outstanding" | "history";

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("outstanding");
  const [searchParams] = useSearchParams();

  // Handle payment success/failure from URL params
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const paymentCancelled = searchParams.get("payment_cancelled");
    const sessionId = searchParams.get("session_id");
    const paymentId = searchParams.get("payment_id");

    if (paymentSuccess && sessionId) {
      handlePaymentSuccess(sessionId);
    } else if (paymentCancelled && paymentId) {
      toast.error("Payment was cancelled. You can try again anytime.");
      // Clean up URL
      window.history.replaceState({}, document.title, "/patient/payments");
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      const payment = await verifyStripePayment(sessionId);
      toast.success(
        `Payment successful! Your appointment is confirmed. Transaction ID: ${payment.transactionId}`
      );
      setActiveTab("history"); // Switch to history tab to show the payment
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
    } finally {
      // Clean up URL
      window.history.replaceState({}, document.title, "/patient/payments");
    }
  };

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
