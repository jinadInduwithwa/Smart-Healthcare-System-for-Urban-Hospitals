// import { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";

// // Define an interface for the overview stats (optional, for TypeScript safety)
// interface OverviewStats {
//   totalPatients: number;
//   totalDoctors: number;
//   totalReports: number;
//   lastUpdated: string;
// }

// function Overview() {
//   const [stats] = useState<OverviewStats>({
//     totalPatients: 1500,
//     totalDoctors: 75,
//     totalReports: 320,
//     lastUpdated: "09:40 AM +0530, September 28, 2025",
//   });

//   useEffect(() => {
//     // Simulate fetching data (replace with API call if needed)
//     // For now, using dummy data
//     toast.success("Overview data loaded!");
//   }, []);

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" reverseOrder={false} />
//       <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Admin Overview</h1>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
//         {/* Total Patients */}
//         <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
//           <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Total Patients</h2>
//           <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatients}</p>
//         </div>

//         {/* Total Doctors */}
//         <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
//           <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Total Doctors</h2>
//           <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.totalDoctors}</p>
//         </div>

//         {/* Total Reports */}
//         <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
//           <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Total Reports</h2>
//           <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.totalReports}</p>
//         </div>
//       </div>

//       {/* Last Updated */}
//       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mt-6">
//         <p className="text-sm text-gray-600 dark:text-gray-400">
//           Last Updated: {stats.lastUpdated}
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Overview;

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// Define an interface for the overview stats (optional, for TypeScript safety)
interface OverviewStats {
  totalPatientVisits: number;
  newRegistrations: number;
  appointmentAdherence: number;
  avgPeakTime: string;
  lastUpdated: string;
}

function Overview() {
  const [stats] = useState<OverviewStats>({
    totalPatientVisits: 2567,
    newRegistrations: 458,
    appointmentAdherence: 82,
    avgPeakTime: "12:30 PM",
    lastUpdated: "09:56 AM +0530, September 28, 2025", // Updated to current date and time
  });

  useEffect(() => {
    // Simulate fetching data (replace with API call if needed)
    toast.success("Overview data loaded!");
  }, []);

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Reports & Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Patient Visits */}
        <div className="bg-blue-50 dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Total Patient Visits</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatientVisits}</p>
        </div>

        {/* New Registrations */}
        <div className="bg-blue-50 dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">New Registrations</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.newRegistrations}</p>
        </div>

        {/* Appointment Adherence */}
        <div className="bg-blue-50 dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Appointment Adherence</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.appointmentAdherence}%</p>
        </div>

        {/* Avg. Peak Time */}
        <div className="bg-blue-50 dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Avg. Peak Time</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.avgPeakTime}</p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last Updated: {stats.lastUpdated}
        </p>
      </div>

      {/* Popular Reports */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Popular Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Monthly Patient Visit Trends</h3>
            <p className="text-gray-600 dark:text-gray-400">Generates a line graph of patient flow.</p>
            <div className="flex justify-center mt-2">
              <span role="img" aria-label="line graph" className="text-2xl">📈</span> {/* Placeholder for line graph icon */}
            </div>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Run Report</button>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Top 10 Most Utilized Services</h3>
            <p className="text-gray-600 dark:text-gray-400">Bar chart of service usage.</p>
            <div className="flex justify-center mt-2">
              <span role="img" aria-label="bar chart" className="text-2xl">📊</span> {/* Placeholder for bar chart icon */}
            </div>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Run Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;