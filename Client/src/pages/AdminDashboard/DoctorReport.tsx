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

// interface DoctorReportData {
//   month: string;
//   consultations: number;
// }

// function DoctorReport() {
//   const [doctorData] = useState<DoctorReportData[]>([
//     { month: "Jan", consultations: 50 },
//     { month: "Feb", consultations: 60 },
//     { month: "Mar", consultations: 70 },
//     { month: "Apr", consultations: 80 },
//     { month: "May", consultations: 90 },
//     { month: "Jun", consultations: 100 },
//     { month: "Jul", consultations: 95 },
//     { month: "Aug", consultations: 110 },
//     { month: "Sep", consultations: 120 },
//   ]);
//   const [showChart, setShowChart] = useState(false);

//   useEffect(() => {
//     toast.success("Doctor report data loaded!");
//   }, []);

//   const handleRunReport = () => {
//     setShowChart(true);
//     toast.success("Doctor report generated successfully!");
//   };

//   // Chart.js data and options
//   const chartData = {
//     labels: doctorData.map((data) => data.month),
//     datasets: [
//       {
//         label: "Consultations",
//         data: doctorData.map((data) => data.consultations),
//         borderColor: "#10B981",
//         backgroundColor: "rgba(16, 185, 129, 0.2)",
//         fill: true,
//         tension: 0.4,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: "top" as const },
//       title: { display: true, text: "Monthly Doctor Consultations" },
//     },
//     scales: {
//       y: { beginAtZero: true, title: { display: true, text: "Number of Consultations" } },
//     },
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Doctor Report</h1>
//       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//         <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
//           Monthly Doctor Consultations
//         </h3>
//         <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//           Generates a line graph of doctor consultations over time.
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
//               Chart: Monthly Doctor Consultations
//             </h4>
//             <Line data={chartData} options={chartOptions} />
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
//               Last Updated: 11:20 AM +0530, September 28, 2025
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default DoctorReport;

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
import { BASE_URL } from '@/utils/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DoctorReportData {
  doctorId: string;
  doctorName: string;
  availableSlots: number;
}

function DoctorReport() {
  const [doctorData, setDoctorData] = useState<DoctorReportData[]>([]);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    toast.success("Doctor report data loaded!");
  }, []);

  const handleRunReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const startDate = new Date("2025-01-01").toISOString();
      const endDate = new Date("2025-09-30").toISOString();
      const response = await fetch(
        `${BASE_URL}/reports/doctor-availability?startDate=${startDate}&endDate=${endDate}`, // Use BASE_URL
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch report");
      const data = await response.json();
      setDoctorData(data.data.availableSlots);
      setShowChart(true);
      toast.success("Doctor report generated successfully!");
    } catch (error) {
      toast.error((error as Error).message || "Failed to generate report");
    }
  };

  const chartData = {
    labels: doctorData.map((data) => data.doctorName),
    datasets: [
      {
        label: "Available Slots",
        data: doctorData.map((data) => data.availableSlots),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Available Doctor Slots" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Number of Slots" } },
    },
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Doctor Report</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
          Available Doctor Slots
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Generates a chart of available doctor slots over time.
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
              Chart: Available Doctor Slots
            </h4>
            <Line data={chartData} options={chartOptions} />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Last Updated: {new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo", hour12: true })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorReport;