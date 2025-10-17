import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaCreditCard,
  FaShieldAlt,
  FaHospital,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import {
  getOutstandingPayments,
  getPaymentSummary,
  createStripeCheckout,
  verifyStripePayment,
  type PaymentDetails,
  type PaymentSummary,
} from "@/utils/paymentApi";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";

export default function OutstandingPayments() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    outstandingBalance: 0,
    pendingAppointments: 0,
    insuranceCoverage: 0,
    totalPaid: 0,
    completedPayments: 0,
  });

  // Payment Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState<string>("");

  // Fetch payment data from API
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        const [payments, summaryData] = await Promise.all([
          getOutstandingPayments(),
          getPaymentSummary(),
        ]);

        setPaymentDetails(payments);
        setSummary(summaryData);
      } catch {
        toast.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleProceedPayment = async () => {
    if (paymentDetails.length === 0) {
      toast.error("No payments to process");
      return;
    }

    if (selectedPaymentMethod === "card") {
      // Process with Stripe
      await handleStripePayment();
    } else if (selectedPaymentMethod === "insurance") {
      toast.info("Insurance payment processing not yet implemented");
    } else if (selectedPaymentMethod === "hospital") {
      toast.info("Hospital payment processing not yet implemented");
    }
  };

  const handleStripePayment = async () => {
    if (paymentDetails.length === 0) {
      toast.error("No payments to process");
      return;
    }

    setProcessing(true);
    try {
      // For now, process the first payment (in a real app, you might want to process all at once)
      const payment = paymentDetails[0];

      const successUrl = `${window.location.origin}/patient/payments?payment_success=true&payment_id=${payment._id}`;
      const cancelUrl = `${window.location.origin}/patient/payments?payment_cancelled=true&payment_id=${payment._id}`;

      const checkoutData = await createStripeCheckout(
        payment._id,
        successUrl,
        cancelUrl
      );

      // Redirect to Stripe checkout
      window.location.href = checkoutData.url;
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle payment success/cancellation from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success");
    const paymentCancelled = urlParams.get("payment_cancelled");
    const paymentId = urlParams.get("payment_id");
    const sessionId = urlParams.get("session_id");

    if (paymentSuccess && paymentId) {
      // Show success modal with payment ID
      setSuccessPaymentId(paymentId);
      setShowSuccessModal(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentSuccess && sessionId) {
      // Legacy handling for session_id
      handlePaymentSuccess(sessionId);
    } else if (paymentCancelled) {
      toast.info("Payment was cancelled");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      setProcessing(true);
      toast.info("Verifying payment...");

      await verifyStripePayment(sessionId);

      toast.success("Payment completed successfully!");

      // Refresh payment data
      const [payments, summaryData] = await Promise.all([
        getOutstandingPayments(),
        getPaymentSummary(),
      ]);
      setPaymentDetails(payments);
      setSummary(summaryData);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessPaymentId("");
    // Refresh payment data after modal closes
    const fetchPaymentData = async () => {
      try {
        const [payments, summaryData] = await Promise.all([
          getOutstandingPayments(),
          getPaymentSummary(),
        ]);
        setPaymentDetails(payments);
        setSummary(summaryData);
      } catch {
        toast.error("Failed to refresh payment data");
      }
    };
    fetchPaymentData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "OVERDUE":
        return "text-red-600 bg-red-100";
      case "PAID":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-6">
        <div className="text-slate-500">Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-6">
        Payment Management
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Outstanding Balance</p>
              <p className="text-3xl font-bold text-slate-800">
                Rs. {summary.outstandingBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Pending Appointments
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {summary.pendingAppointments}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Insurance Coverage</p>
              <p className="text-3xl font-bold text-slate-800">
                {summary.insuranceCoverage}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-800">
            Payment Details
          </h2>
        </div>

        <div className="p-6">
          {paymentDetails.map((payment) => (
            <div key={payment._id || payment.id} className="mb-6 last:mb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Hospital Branch:</span>
                    <span className="font-medium">
                      {payment.appointment?.availability?.location || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Patient Name:</span>
                    <span className="font-medium">
                      {payment.patient?.userId?.firstName &&
                      payment.patient?.userId?.lastName
                        ? `${payment.patient.userId.firstName} ${payment.patient.userId.lastName}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Patient ID:</span>
                    <span className="font-medium">
                      {payment.patient?.userId?._id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Appointment Date:</span>
                    <span className="font-medium">
                      {payment.appointment?.availability?.date
                        ? new Date(
                            payment.appointment.availability.date
                          ).toLocaleDateString()
                        : "N/A"}{" "}
                      - {payment.appointment?.availability?.timeSlot || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Doctor:</span>
                    <span className="font-medium">
                      {payment.doctor?.userId?.firstName &&
                      payment.doctor?.userId?.lastName
                        ? `${payment.doctor.userId.firstName} ${payment.doctor.userId.lastName}`
                        : "N/A"}{" "}
                      - {payment.doctor?.specialization || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Invoice Number:</span>
                    <span className="font-medium">
                      {payment.invoiceNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-bold text-blue-600 text-lg">
                      Rs. {payment.amount?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Required Banner */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    Payment Required: This is a private hospital appointment.
                    Payment is required to confirm your booking.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-800">
            Select Payment Method
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card Payment */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("card")}
            >
              <div className="flex items-center mb-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    selectedPaymentMethod === "card"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPaymentMethod === "card" && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <FaCreditCard className="text-blue-600 text-xl mr-2" />
                <span className="font-medium">Card Payment</span>
              </div>
              <p className="text-sm text-slate-600">
                Pay securely with your debit or credit card
              </p>
            </div>

            {/* Insurance Coverage */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === "insurance"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("insurance")}
            >
              <div className="flex items-center mb-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    selectedPaymentMethod === "insurance"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPaymentMethod === "insurance" && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <FaShieldAlt className="text-green-600 text-xl mr-2" />
                <span className="font-medium">Insurance Coverage</span>
              </div>
              <p className="text-sm text-slate-600">
                Use your health insurance for coverage validation
              </p>
            </div>

            {/* Pay at Hospital */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === "hospital"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("hospital")}
            >
              <div className="flex items-center mb-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    selectedPaymentMethod === "hospital"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPaymentMethod === "hospital" && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <FaHospital className="text-purple-600 text-xl mr-2" />
                <span className="font-medium">Pay at Hospital</span>
              </div>
              <p className="text-sm text-slate-600">
                Pay directly at the hospital reception
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="flex justify-end">
        <button
          onClick={handleProceedPayment}
          disabled={processing || loading}
          className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
            processing || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {processing ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              {selectedPaymentMethod === "card" && "Proceed with Card Payment"}
              {selectedPaymentMethod === "insurance" &&
                "Process Insurance Coverage"}
              {selectedPaymentMethod === "hospital" &&
                "Confirm Hospital Payment"}
            </>
          )}
        </button>
      </div>

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        paymentId={successPaymentId}
      />
    </div>
  );
}
