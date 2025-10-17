// import { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// interface FinancialReportData {
//   month: string;
//   revenue: number;
// }

// function FinancialReport() {
//   const [financialData, setFinancialData] = useState<FinancialReportData[]>([]);
//   const [showChart, setShowChart] = useState(false);

//   useEffect(() => {
//     toast.success("Financial report data loaded!");
//   }, []);

//   const handleRunReport = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");
//       const startDate = new Date("2025-01-01").toISOString();
//       const endDate = new Date("2025-09-30").toISOString();
//       const response = await fetch(
//         `/api/reports/financial?startDate=${startDate}&endDate=${endDate}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (!response.ok) throw new Error("Failed to fetch report");
//       const data = await response.json();
//       setFinancialData(data.data.financialData);
//       setShowChart(true);
//       toast.success("Financial report generated successfully!");
//     } catch (error) {
//       toast.error((error as Error).message || "Failed to generate report");
//     }
//   };

//   const chartData = {
//     labels: financialData.map((data) => data.month),
//     datasets: [
//       {
//         label: "Revenue ($)",
//         data: financialData.map((data) => data.revenue),
//         borderColor: "#3B82F6",
//         backgroundColor: "rgba(59, 130, 246, 0.2)",
//         fill: true,
//         tension: 0.4,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: "top" as const },
//       title: { display: true, text: "Monthly Revenue" },
//     },
//     scales: {
//       y: { beginAtZero: true, title: { display: true, text: "Revenue ($)" } },
//     },
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Financial Report</h1>
//       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//         <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
//           Monthly Revenue
//         </h3>
//         <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//           Generates a line graph of monthly revenue.
//         </p>
//         <button
//           onClick={handleRunReport}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
//           disabled={showChart}
//         >
//           Run Report
//         </button>
//         {showChart && (
//           <div className="mt-4">
//             <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
//               Chart: Monthly Revenue
//             </h4>
//             <Line data={chartData} options={chartOptions} />
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
//               Last Updated: {new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo", hour12: true })}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default FinancialReport;

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface FinancialReportData {
  month: string;
  revenue: number;
  transactionCount: number;
  pendingAmount: number;
  refundAmount: number;
  totalTransactions: number;
}

interface PaymentSummary {
  totalRevenue: number;
  totalPending: number;
  totalRefunded: number;
  paidTransactions: number;
  pendingTransactions: number;
  refundedTransactions: number;
  netRevenue: number;
}

interface PaymentMethod {
  _id: string;
  totalAmount: number;
  transactionCount: number;
}

interface TopDoctor {
  doctorName: string;
  specialization: string;
  totalRevenue: number;
  appointmentCount: number;
}

// Define color types
type ChartColor = 'blue' | 'green' | 'purple' | 'red' | 'yellow';

function FinancialReport() {
  const [financialData, setFinancialData] = useState<FinancialReportData[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [, setTopDoctors] = useState<TopDoctor[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleRunReport = async () => {
    try {
      setIsLoading(true);
      setShowChart(false);
      setReportGenerated(false);
      
      console.log("Starting report generation...");
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please login again.");
        setIsLoading(false);
        return;
      }

      const timestamp = new Date().getTime();
      const apiUrl = `http://localhost:3002/api/reports/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&_t=${timestamp}`;

      console.log("Fetching from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        cache: 'no-store'
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);
      
      if (data.status === "success") {
        console.log("Processing successful response...");
        
        // Ensure we have proper data structure
        const financialData = data.data.financialData || [];
        const summary = data.data.summary || {
          totalRevenue: 0,
          totalPending: 0,
          totalRefunded: 0,
          paidTransactions: 0,
          pendingTransactions: 0,
          refundedTransactions: 0,
          netRevenue: 0
        };
        const paymentMethods = data.data.paymentMethods || [];
        const topDoctors = data.data.topDoctors || [];

        console.log("Processed data:", {
          financialDataCount: financialData.length,
          summary,
          paymentMethodsCount: paymentMethods.length,
          topDoctorsCount: topDoctors.length
        });

        // Update state
        setFinancialData(financialData);
        setSummary(summary);
        setPaymentMethods(paymentMethods);
        setTopDoctors(topDoctors);
        setShowChart(true);
        setReportGenerated(true);
        
        console.log("State updated, showing charts...");
        toast.success("Financial report generated successfully!");
      } else {
        throw new Error(data.message || "Failed to generate report");
      }
      
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error((error as Error).message || "Failed to generate financial report");
      
      // Fallback to mock data for demonstration
      console.log("Loading mock data as fallback...");
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for demonstration when backend is not available
  const generateMockData = () => {
    console.log("Generating mock data...");
    
    const mockFinancialData: FinancialReportData[] = [
      { month: "Jan 2025", revenue: 450000, transactionCount: 45, pendingAmount: 50000, refundAmount: 10000, totalTransactions: 50 },
      { month: "Feb 2025", revenue: 520000, transactionCount: 52, pendingAmount: 45000, refundAmount: 8000, totalTransactions: 55 },
      { month: "Mar 2025", revenue: 480000, transactionCount: 48, pendingAmount: 60000, refundAmount: 12000, totalTransactions: 53 },
      { month: "Apr 2025", revenue: 550000, transactionCount: 55, pendingAmount: 40000, refundAmount: 15000, totalTransactions: 58 },
      { month: "May 2025", revenue: 600000, transactionCount: 60, pendingAmount: 55000, refundAmount: 20000, totalTransactions: 65 },
    ];

    const mockSummary: PaymentSummary = {
      totalRevenue: 2600000,
      totalPending: 250000,
      totalRefunded: 65000,
      paidTransactions: 260,
      pendingTransactions: 25,
      refundedTransactions: 6,
      netRevenue: 2535000
    };

    const mockPaymentMethods: PaymentMethod[] = [
      { _id: "CARD", totalAmount: 1200000, transactionCount: 120 },
      { _id: "INSURANCE", totalAmount: 800000, transactionCount: 80 },
      { _id: "ONLINE", totalAmount: 400000, transactionCount: 40 },
      { _id: "CASH", totalAmount: 200000, transactionCount: 20 }
    ];

    const mockTopDoctors: TopDoctor[] = [
      { doctorName: "Dr. John Smith", specialization: "Cardiology", totalRevenue: 850000, appointmentCount: 85 },
      { doctorName: "Dr. Sarah Johnson", specialization: "Pediatrics", totalRevenue: 650000, appointmentCount: 65 },
      { doctorName: "Dr. Michael Brown", specialization: "Orthopedics", totalRevenue: 550000, appointmentCount: 55 },
      { doctorName: "Dr. Emily Davis", specialization: "Dermatology", totalRevenue: 350000, appointmentCount: 35 },
      { doctorName: "Dr. Robert Wilson", specialization: "Neurology", totalRevenue: 300000, appointmentCount: 30 },
    ];

    setFinancialData(mockFinancialData);
    setSummary(mockSummary);
    setPaymentMethods(mockPaymentMethods);
    setTopDoctors(mockTopDoctors);
    setShowChart(true);
    setReportGenerated(true);
    
    console.log("Mock data loaded successfully");
    toast.success("Demo financial report loaded (Mock Data)");
  };

  // Simple Chart Component without Chart.js
  const SimpleBarChart = ({ 
    data, 
    title,
    color = "blue" 
  }: { 
    data: { label: string; value: number }[];
    title: string;
    color?: ChartColor;
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for chart
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item.value));
    
    // Define color classes with proper typing
    const colorClasses: Record<ChartColor, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500"
    };

    const selectedColor = colorClasses[color] || colorClasses.blue;

    return (
      <div className="h-80">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h4>
        <div className="flex items-end justify-between h-64 gap-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * 200 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group relative">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${selectedColor} hover:opacity-80 cursor-pointer`}
                  style={{ height: `${barHeight}px` }}
                  title={`${item.label}: ${item.value.toLocaleString()}`}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
                  {item.label}
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {item.value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Simple Pie Chart Component
  const SimplePieChart = ({ 
    data, 
    title 
  }: { 
    data: { label: string; value: number }[];
    title: string;
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for chart
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

    return (
      <div className="h-80">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h4>
        <div className="flex flex-col lg:flex-row items-center justify-center h-64 gap-4">
          <div className="relative w-48 h-48">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const rotation = data.slice(0, index).reduce((sum, prevItem) => sum + (prevItem.value / total) * 360, 0);
              
              return (
                <div
                  key={index}
                  className="absolute top-0 left-0 w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(${colors[index % colors.length]} 0% ${percentage}%, transparent ${percentage}% 100%)`,
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              );
            })}
          </div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.label}: {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueChart = () => {
    if (!financialData || financialData.length === 0) return null;
    
    const chartData = financialData.map(data => ({
      label: data.month,
      value: data.revenue || 0
    }));

    return (
      <SimpleBarChart 
        data={chartData} 
        title="Monthly Revenue (LKR)" 
        color="blue"
      />
    );
  };

  const renderPaymentMethodsChart = () => {
    if (!paymentMethods || paymentMethods.length === 0) return null;
    
    const chartData = paymentMethods.map(method => ({
      label: method._id,
      value: method.totalAmount || 0
    }));

    return (
      <SimplePieChart 
        data={chartData} 
        title="Payment Methods Distribution"
      />
    );
  };

  

  

  const renderFinancialTable = () => {
    if (!financialData || financialData.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Detailed Financial Data
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Month</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Revenue</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Transactions</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Pending</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Refunds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {financialData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {data.month || "Unknown Month"}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-semibold">
                    LKR {(data.revenue || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {data.transactionCount || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                    LKR {(data.pendingAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    LKR {(data.refundAmount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!summary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        
        
        
        
        
        
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Financial Report</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive financial overview and analytics
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
          Select Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
        <button
          onClick={handleRunReport}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Report...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Financial Report
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Generating financial report...</p>
        </div>
      )}

      {/* Report Content */}
      {reportGenerated && showChart && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              {renderRevenueChart()}
            </div>

            {/* Payment Methods Chart */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              {renderPaymentMethodsChart()}
            </div>

            
            {/* Top Doctors */}
            
          </div>

          {/* Financial Data Table */}
          {renderFinancialTable()}

          {/* Report Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📅 Report Period: {dateRange.startDate} to {dateRange.endDate} | 
              🕒 Generated: {new Date().toLocaleString("en-US", { 
                timeZone: "Asia/Colombo", 
                hour12: true 
              })} |
              📊 Data Points: {financialData.length} months
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportGenerated && !isLoading && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Report Generated
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click "Generate Financial Report" to create your first financial report.
          </p>
          <button
            onClick={generateMockData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Load Demo Data
          </button>
        </div>
      )}
    </div>
  );
}

export default FinancialReport;