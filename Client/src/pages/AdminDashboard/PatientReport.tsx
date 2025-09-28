import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Line } from "react-chartjs-2";  // Fixed: Correct package name
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";  // This will resolve after npm install

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PatientReportData {
  month: string;
  visits: number;
}

function PatientReport() {
  const [patientData] = useState<PatientReportData[]>([
    { month: "Jan", visits: 120 },
    { month: "Feb", visits: 150 },
    { month: "Mar", visits: 180 },
    { month: "Apr", visits: 200 },
    { month: "May", visits: 220 },
    { month: "Jun", visits: 250 },
    { month: "Jul", visits: 230 },
    { month: "Aug", visits: 270 },
    { month: "Sep", visits: 300 },
  ]);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    toast.success("Patient report data loaded!");
  }, []);

  const handleRunReport = () => {
    setShowChart(true);
    toast.success("Patient report generated successfully!");
  };

  // Chart.js data and options
  const chartData = {
    labels: patientData.map((data) => data.month),
    datasets: [
      {
        label: "Patient Visits",
        data: patientData.map((data) => data.visits),
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
      title: { display: true, text: "Monthly Patient Visits" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Number of Visits" } },
    },
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Patient Report</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
          Monthly Patient Visits
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Generates a line graph of patient visits over time.
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
              Chart: Monthly Patient Visits
            </h4>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientReport;