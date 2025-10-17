import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaReceipt,
  FaDownload,
  FaEye,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaCreditCard,
  FaShieldAlt,
  FaHospital,
} from "react-icons/fa";
import jsPDF from "jspdf";
import { getPaymentHistory, type PaymentRecord } from "@/utils/paymentApi";

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);

  // Fetch payment history from API
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        const paymentData = await getPaymentHistory();
        // Extract payments array from the response
        setPayments(paymentData.payments || []);
      } catch {
        toast.error("Failed to load payment history");
        setPayments([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  // Filter payments based on search and filters
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (payment.doctor?.userId?.firstName &&
            `${payment.doctor.userId.firstName} ${payment.doctor.userId.lastName}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (payment.doctor?.specialization &&
            payment.doctor.specialization
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "last7days":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "last30days":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "last3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "last6months":
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case "lastyear":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (payment) => new Date(payment.paidAt || payment.createdAt) >= filterDate
      );
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, dateFilter]);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CARD":
        return <FaCreditCard className="text-blue-600" />;
      case "INSURANCE":
        return <FaShieldAlt className="text-green-600" />;
      case "HOSPITAL":
        return <FaHospital className="text-purple-600" />;
      case "ONLINE":
        return <FaCreditCard className="text-indigo-600" />;
      default:
        return <FaCreditCard className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
        return "text-green-600 bg-green-100";
      case "REFUNDED":
        return "text-orange-600 bg-orange-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "PROCESSING":
        return "text-blue-600 bg-blue-100";
      case "FAILED":
        return "text-red-600 bg-red-100";
      case "CANCELLED":
        return "text-gray-600 bg-gray-100";
      case "OVERDUE":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownloadReceipt = async (payment: PaymentRecord) => {
    try {
      toast.info(`Generating PDF receipt for ${payment.invoiceNumber}...`);

      // Generate PDF receipt
      generatePDFReceipt(payment);

      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Receipt download error:", error);
      toast.error("Failed to download receipt");
    }
  };

  const generatePDFReceipt = (payment: PaymentRecord) => {
    const pdf = new jsPDF();

    // Get payment details
    const patientName =
      payment.patient?.userId?.firstName && payment.patient?.userId?.lastName
        ? `${payment.patient.userId.firstName} ${payment.patient.userId.lastName}`
        : "N/A";

    const doctorName =
      payment.doctor?.userId?.firstName && payment.doctor?.userId?.lastName
        ? `${payment.doctor.userId.firstName} ${payment.doctor.userId.lastName}`
        : "N/A";

    const appointmentDate = payment.appointment?.availability?.date
      ? formatDate(payment.appointment.availability.date)
      : "N/A";

    const appointmentTime =
      payment.appointment?.availability?.timeSlot || "N/A";
    const hospitalBranch = payment.appointment?.availability?.location || "N/A";
    const paidDate = payment.paidAt
      ? formatDate(payment.paidAt)
      : formatDate(payment.createdAt);

    // Set up PDF content
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("SMART HEALTHCARE SYSTEM", 105, yPosition, { align: "center" });
    yPosition += 10;

    pdf.setFontSize(16);
    pdf.text("Payment Receipt", 105, yPosition, { align: "center" });
    yPosition += 20;

    // Invoice details
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Invoice Number: ${payment.invoiceNumber}`, 20, yPosition);
    yPosition += 8;
    pdf.text(
      `Transaction ID: ${
        payment.transactionId || payment.stripePaymentIntentId || "N/A"
      }`,
      20,
      yPosition
    );
    yPosition += 8;
    pdf.text(`Payment Date: ${paidDate}`, 20, yPosition);
    yPosition += 15;

    // Patient Information Section
    pdf.setFont("helvetica", "bold");
    pdf.text("PATIENT INFORMATION:", 20, yPosition);
    yPosition += 8;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Name: ${patientName}`, 20, yPosition);
    yPosition += 6;
    pdf.text(
      `Patient ID: ${payment.patient?.userId?._id || "N/A"}`,
      20,
      yPosition
    );
    yPosition += 15;

    // Appointment Details Section
    pdf.setFont("helvetica", "bold");
    pdf.text("APPOINTMENT DETAILS:", 20, yPosition);
    yPosition += 8;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${appointmentDate}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Time: ${appointmentTime}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Doctor: ${doctorName}`, 20, yPosition);
    yPosition += 6;
    pdf.text(
      `Specialization: ${payment.doctor?.specialization || "N/A"}`,
      20,
      yPosition
    );
    yPosition += 6;
    pdf.text(`Hospital Branch: ${hospitalBranch}`, 20, yPosition);
    yPosition += 15;

    // Payment Information Section
    pdf.setFont("helvetica", "bold");
    pdf.text("PAYMENT INFORMATION:", 20, yPosition);
    yPosition += 8;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Amount: Rs. ${payment.amount.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Payment Method: ${payment.paymentMethod}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Status: ${payment.status}`, 20, yPosition);
    yPosition += 6;
    pdf.text(
      `Currency: ${payment.currency?.toUpperCase() || "LKR"}`,
      20,
      yPosition
    );
    yPosition += 20;

    // Footer
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.text("Thank you for your payment!", 105, yPosition, {
      align: "center",
    });
    yPosition += 8;
    pdf.text(
      "For any inquiries, please contact our support team.",
      105,
      yPosition,
      { align: "center" }
    );
    yPosition += 8;
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPosition, {
      align: "center",
    });

    // Add border
    pdf.rect(10, 10, 190, 277);

    // Download the PDF
    pdf.save(`receipt-${payment.invoiceNumber}.pdf`);
  };

  const handleViewDetails = (payment: PaymentRecord) => {
    toast.info(`Viewing details for ${payment.invoiceNumber}`);
    // Implement view details logic
  };

  const handleExportAllReceipts = () => {
    if (filteredPayments.length === 0) {
      toast.error("No payment records to export");
      return;
    }

    try {
      toast.info("Generating payment history report...");
      generatePaymentHistoryPDF(filteredPayments);
      toast.success("Payment history report downloaded successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to generate report");
    }
  };

  const generatePaymentHistoryPDF = (payments: PaymentRecord[]) => {
    const pdf = new jsPDF();

    let yPosition = 20;

    // Header
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("SMART HEALTHCARE SYSTEM", 105, yPosition, { align: "center" });
    yPosition += 10;

    pdf.setFontSize(14);
    pdf.text("Payment History Report", 105, yPosition, { align: "center" });
    yPosition += 15;

    // Report Details
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Records: ${payments.length}`, 20, yPosition);
    yPosition += 6;

    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    pdf.text(
      `Total Amount: Rs. ${totalAmount.toLocaleString()}`,
      20,
      yPosition
    );
    yPosition += 15;

    // Table Headers
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Invoice", 20, yPosition);
    pdf.text("Date", 60, yPosition);
    pdf.text("Patient", 95, yPosition);
    pdf.text("Doctor", 135, yPosition);
    pdf.text("Amount", 175, yPosition);
    yPosition += 5;

    // Draw header line
    pdf.line(20, yPosition, 195, yPosition);
    yPosition += 5;

    // Table Data
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    payments.forEach((payment) => {
      // Check if we need a new page
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      const patientName =
        payment.patient?.userId?.firstName && payment.patient?.userId?.lastName
          ? `${payment.patient.userId.firstName} ${payment.patient.userId.lastName}`
          : "N/A";

      const doctorName =
        payment.doctor?.userId?.firstName && payment.doctor?.userId?.lastName
          ? `${payment.doctor.userId.firstName} ${payment.doctor.userId.lastName}`
          : "N/A";

      const appointmentDate = payment.appointment?.availability?.date
        ? formatDate(payment.appointment.availability.date)
        : "N/A";

      // Truncate long text to fit
      const truncateText = (text: string, maxLength: number) =>
        text.length > maxLength
          ? text.substring(0, maxLength - 3) + "..."
          : text;

      pdf.text(truncateText(payment.invoiceNumber, 15), 20, yPosition);
      pdf.text(truncateText(appointmentDate, 12), 60, yPosition);
      pdf.text(truncateText(patientName, 15), 95, yPosition);
      pdf.text(truncateText(doctorName, 15), 135, yPosition);
      pdf.text(`Rs. ${payment.amount.toLocaleString()}`, 175, yPosition);

      yPosition += 5;
    });

    // Footer
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.text("Generated by Smart Healthcare System", 105, yPosition, {
      align: "center",
    });

    // Add border to first page
    pdf.rect(10, 10, 190, 277);

    // Download the PDF
    pdf.save(`payment-history-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-6">
        <div className="text-slate-500">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4 md:mb-0">
          Payment History
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Total Payments:</span>
          <span className="font-semibold text-slate-800">
            {filteredPayments.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last3months">Last 3 Months</option>
              <option value="last6months">Last 6 Months</option>
              <option value="lastyear">Last Year</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportAllReceipts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            disabled={filteredPayments.length === 0}
          >
            <FaDownload className="mr-2" />
            Export All
          </button>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No payment records found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment._id || payment.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaReceipt className="text-slate-400 mr-2" />
                        <span className="text-sm font-medium text-slate-900">
                          {payment.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {payment.appointment?.availability?.date
                          ? formatDate(payment.appointment.availability.date)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.appointment?.availability?.location || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {payment.doctor?.userId?.firstName &&
                        payment.doctor?.userId?.lastName
                          ? `${payment.doctor.userId.firstName} ${payment.doctor.userId.lastName}`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.doctor?.specialization || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        Rs. {payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="ml-2 text-sm text-slate-900">
                          {payment.paymentMethod}
                        </span>
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs text-slate-500 mt-1">
                          {payment.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {payment.paidAt
                          ? formatDate(payment.paidAt)
                          : formatDate(payment.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Download Receipt"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredPayments.length > 0 && (
        <div className="mt-6 bg-slate-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {filteredPayments.length}
              </div>
              <div className="text-sm text-slate-600">Total Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                Rs.{" "}
                {filteredPayments
                  .reduce((sum, payment) => sum + payment.amount, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {
                  filteredPayments.filter(
                    (p) => p.status === "COMPLETED" || p.status === "PAID"
                  ).length
                }
              </div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
