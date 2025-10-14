import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
import { getPatientCheckInReport } from "@/utils/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PatientReportData {
  month: string;
  visits: number;
  patients: Array<{
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

function PatientReport() {
  const [patientData, setPatientData] = useState<PatientReportData[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log("PatientReport mounted");
    console.log("Location state:", location.state);
    toast.success("Patient report page loaded!");
    
    // Auto-run report if coming from another page with autoRun flag
    if (location.state?.autoRun) {
      console.log("Auto-running report...");
      handleRunReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleRunReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        throw new Error("No authentication token found");
      }

      const startDate = "2025-01-01";
      const endDate = "2025-10-30T23:59:59.999Z";

      console.log("Fetching report with token:", token);
      const response = await getPatientCheckInReport(startDate, endDate, token);
      console.log("API response:", JSON.stringify(response, null, 2));

      const patientCheckIns = response?.data?.patientCheckIns || [];
      if (!Array.isArray(patientCheckIns)) {
        console.log("patientCheckIns is not an array:", patientCheckIns);
        toast.error("Invalid data format received from server.");
        setPatientData([]);
        setShowChart(false);
        return;
      }

      setPatientData(patientCheckIns);
      setShowChart(true);
      toast.success("Patient report generated successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate report";
      console.error("Error fetching report:", error);
      toast.error(errorMessage);
      setPatientData([]);
      setShowChart(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chartData = {
    labels: patientData.map((data) => data.month),
    datasets: [
      {
        label: "Patient Registrations",
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
      title: { display: true, text: "Monthly Patient Registrations (2025)" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Registrations" },
      },
    },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Patient Registration Report
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
          Monthly Patient Registrations
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Generates a report of patient registrations from January to October 2025, including patient details.
        </p>
        <button
          onClick={handleRunReport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Generating Report..." : "Run Report"}
        </button>

        {showChart && patientData.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
              Chart: Monthly Patient Registrations
            </h4>
            <Line data={chartData} options={chartOptions} />
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mt-6 mb-4">
              Patient Details
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Month</th>
                    <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Registrations</th>
                    <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {patientData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 border-b text-gray-900 dark:text-gray-100">{data.month}</td>
                      <td className="px-4 py-2 border-b text-gray-900 dark:text-gray-100">{data.visits}</td>
                      <td className="px-4 py-2 border-b text-gray-900 dark:text-gray-100">
                        {data.patients.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {data.patients.map((patient) => (
                              <li key={patient.patientId}>
                                {patient.firstName} {patient.lastName} ({patient.email})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "No patients"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : showChart && patientData.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No patient registrations found for the selected period.
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Click 'Run Report' to generate the patient registration chart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientReport;

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
// import { getPatientCheckInReport } from "@/utils/api";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// interface PatientReportData {
//   month: string;
//   visits: number;
//   patients: Array<{
//     patientId: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//   }>;
// }

// function PatientReport() {
//   const [patientData, setPatientData] = useState<PatientReportData[]>([]);
//   const [showChart, setShowChart] = useState(false);
//   const [loading, setLoading] = useState(false); // Added loading state

//   // Function to fetch report data
//   const handleRunReport = async () => {
//     setLoading(true); // Set loading state
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("No token found in localStorage");
//         throw new Error("No authentication token found");
//       }

//       const startDate = "2025-01-01";
//       const endDate = "2025-10-30T23:59:59.999Z";

//       console.log("Fetching report with token:", token);
//       const response = await getPatientCheckInReport(startDate, endDate, token);
//       console.log("API response:", JSON.stringify(response, null, 2));

//       const patientCheckIns = response?.data?.patientCheckIns || [];
//       if (!Array.isArray(patientCheckIns)) {
//         console.error("patientCheckIns is not an array:", patientCheckIns);
//         toast.error("Invalid data format received from server.");
//         setPatientData([]);
//         setShowChart(false);
//         return;
//       }

//       setPatientData(patientCheckIns);
//       setShowChart(true);
//       toast.success("Patient report generated successfully!");
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Failed to generate report";
//       console.error("Error fetching report:", error);
//       toast.error(errorMessage);
//       setPatientData([]);
//       setShowChart(false);
//     } finally {
//       setLoading(false); // Reset loading state
//     }
//   };

//   // Automatically run report on component mount
//   useEffect(() => {
//     handleRunReport();
//   }, []);

//   // Toast on page load
//   useEffect(() => {
//     toast.success("Patient report page loaded!");
//   }, []);

//   const chartData = {
//     labels: patientData.map((data) => data.month),
//     datasets: [
//       {
//         label: "Patient Registrations",
//         data: patientData.map((data) => data.visits),
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
//       legend: {
//         position: "top" as const,
//       },
//       title: {
//         display: true,
//         text: "Monthly Patient Registrations (2025)",
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: "Number of Registrations",
//         },
//       },
//     },
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Patient Registration Report</h1>
//       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//         <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
//           Monthly Patient Registrations
//         </h3>
//         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//           Generates a report of patient registrations from January to October 2025, including patient details.
//         </p>
//         <button
//           onClick={handleRunReport}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
//           disabled={loading || showChart}
//         >
//           {loading ? "Loading..." : "Run Report"}
//         </button>
//         {loading ? (
//           <div className="mt-6 text-center">
//             <p className="text-gray-500 dark:text-gray-400">Loading report data...</p>
//           </div>
//         ) : showChart && patientData.length > 0 ? (
//           <div className="mt-6">
//             <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
//               Chart: Monthly Patient Registrations
//             </h4>
//             <Line data={chartData} options={chartOptions} />
//             <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mt-6 mb-4">
//               Patient Details
//             </h4>
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Month</th>
//                     <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Registrations</th>
//                     <th className="px-4 py-2 border-b text-left text-gray-700 dark:text-gray-300">Patients</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {patientData.map((data, index) => (
//                     <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
//                       <td className="px-4 py-2 border-b text-gray-900 dark:text-gray-100">{data.month}</td>
//                       <td className="px-4 py-2 border-b text-gray-900 dark:text-gray-100">{data.visits}</td>
//                       <td className="px-4 py-2 border-b text-gray-900 dark:text-gray-100">
//                         {data.patients.length > 0 ? (
//                           <ul className="list-disc list-inside">
//                             {data.patients.map((patient) => (
//                               <li key={patient.patientId}>
//                                 {patient.firstName} {patient.lastName} ({patient.email})
//                               </li>
//                             ))}
//                           </ul>
//                         ) : (
//                           "No patients"
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         ) : (
//           <div className="mt-6 text-center">
//             <p className="text-gray-500 dark:text-gray-400">
//               {patientData.length === 0 && !showChart
//                 ? "No patient registrations found for the selected period."
//                 : "Click 'Run Report' to generate the chart."}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default PatientReport;