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
import {
  getPaymentHistory,
  downloadReceipt,
  processRefund,
  type PaymentRecord,
} from "@/utils/paymentApi";

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
        setPayments(paymentData);
      } catch {
        toast.error("Failed to load payment history");
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
          payment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.specialization
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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
        (payment) => new Date(payment.paymentDate) >= filterDate
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
      case "COMPLETED":
        return "text-green-600 bg-green-100";
      case "REFUNDED":
        return "text-orange-600 bg-orange-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
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
      toast.info(`Downloading receipt for ${payment.invoiceNumber}...`);
      const blob = await downloadReceipt(payment.invoiceNumber);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${payment.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Receipt downloaded successfully");
    } catch {
      toast.error("Failed to download receipt");
    }
  };

  const handleViewDetails = (payment: PaymentRecord) => {
    toast.info(`Viewing details for ${payment.invoiceNumber}`);
    // Implement view details logic
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
              <option value="COMPLETED">Completed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="PENDING">Pending</option>
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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <FaDownload className="mr-2" />
            Export
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
                  <tr key={payment.id} className="hover:bg-slate-50">
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
                        {formatDate(payment.appointmentDate)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.hospitalBranch}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {payment.doctor}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.specialization}
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
                        {formatDate(payment.paymentDate)}
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
                  filteredPayments.filter((p) => p.status === "COMPLETED")
                    .length
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
