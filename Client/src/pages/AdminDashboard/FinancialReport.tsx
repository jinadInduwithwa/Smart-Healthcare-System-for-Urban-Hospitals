import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface FinancialReportData {
  month: string;
  revenue: number;
}

function FinancialReport() {
  const [financialData] = useState<FinancialReportData[]>([
    { month: "Jan", revenue: 5000 },
    { month: "Feb", revenue: 5500 },
    { month: "Mar", revenue: 6000 },
    { month: "Apr", revenue: 6500 },
    { month: "May", revenue: 7000 },
    { month: "Jun", revenue: 7500 },
    { month: "Jul", revenue: 7200 },
    { month: "Aug", revenue: 7800 },
    { month: "Sep", revenue: 8000 },
  ]);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    toast.success("Financial report data loaded!");
  }, []);

  const handleRunReport = () => {
    setShowChart(true);
    toast.success("Financial report generated successfully!");
  };

  // Chart.js data and options
  const chartData = {
    labels: financialData.map((data) => data.month),
    datasets: [
      {
        label: "Revenue ($)",
        data: financialData.map((data) => data.revenue),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Monthly Revenue" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Revenue ($)" } },
    },
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Financial Report</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
          Monthly Revenue
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Generates a line graph of monthly revenue.
        </p>
        <button
          onClick={handleRunReport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={showChart}
        >
          Run Report
        </button>
        {showChart && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
              Chart: Monthly Revenue
            </h4>
            <Line data={chartData} options={chartOptions} />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Last Updated: 11:24 AM +0530, September 28, 2025
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialReport;