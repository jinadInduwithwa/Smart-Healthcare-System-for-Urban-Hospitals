// import { useState, useEffect, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import { getPatientCheckInReport } from "@/utils/api";
// import { XMarkIcon } from "@heroicons/react/24/outline"; 

// interface PatientReportData {
//   _id: string;
//   month: string;
//   visits: number;
//   patients: Array<{
//     patientId: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//   }>;
// }

// // Custom Chart Component
// const CustomChart = ({ 
//   data, 
//   type = 'bar',
//   height = 400 
// }: { 
//   data: PatientReportData[];
//   type?: 'bar' | 'line';
//   height?: number;
// }) => {
//   if (!data || data.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64 text-gray-500">
//         No data available for chart
//       </div>
//     );
//   }

//   const maxValue = Math.max(...data.map(item => item.visits));
//   const totalHeight = height - 80; // Account for labels and padding

//   return (
//     <div className="w-full" style={{ height: `${height}px` }}>
//       {/* Y-axis labels */}
//       <div className="flex h-full">
//         <div className="flex flex-col justify-between pr-2 text-xs text-gray-500 w-12">
//           <span>{maxValue}</span>
//           <span>{Math.round(maxValue * 0.75)}</span>
//           <span>{Math.round(maxValue * 0.5)}</span>
//           <span>{Math.round(maxValue * 0.25)}</span>
//           <span>0</span>
//         </div>

//         {/* Chart area */}
//         <div className="flex-1 relative">
//           {/* Grid lines */}
//           <div className="absolute inset-0 flex flex-col justify-between">
//             {[0, 0.25, 0.5, 0.75, 1].map((position) => (
//               <div
//                 key={position}
//                 className="border-t border-gray-200 dark:border-gray-600"
//                 style={{ order: 1 - position }}
//               />
//             ))}
//           </div>

//           {/* Chart content */}
//           <div className="flex items-end justify-between h-full gap-2 pl-4 pr-2 pb-8">
//             {data.map((item, index) => {
//               const barHeight = maxValue > 0 ? (item.visits / maxValue) * totalHeight : 0;
//               const isActive = item.visits > 0;
              
//               return (
//                 <div
//                   key={item._id}
//                   className="flex flex-col items-center flex-1 group relative"
//                 >
//                   {/* Bar or Line */}
//                   {type === 'bar' ? (
//                     <div
//                       className={`w-full rounded-t transition-all duration-300 ${
//                         isActive
//                           ? 'bg-gradient-to-t from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer'
//                           : 'bg-gray-200 dark:bg-gray-700'
//                       }`}
//                       style={{ 
//                         height: `${barHeight}px`,
//                         minHeight: isActive ? '4px' : '2px'
//                       }}
//                     />
//                   ) : (
//                     // Line chart - using a combination of bars and connecting lines
//                     <div className="relative w-full h-full">
//                       {/* Connecting line (for next point) */}
//                       {index < data.length - 1 && (
//                         <div
//                           className="absolute top-1/2 left-1/2 bg-blue-500 h-0.5 transform -translate-y-1/2"
//                           style={{
//                             width: '100%',
//                             transform: `translateY(${-barHeight / 2}px) rotate(${
//                               Math.atan2(
//                                 (data[index + 1].visits / maxValue) * totalHeight - barHeight,
//                                 100
//                               ) * (180 / Math.PI)
//                             }deg)`,
//                             zIndex: 1
//                           }}
//                         />
//                       )}
//                       {/* Data point */}
//                       <div
//                         className={`absolute left-1/2 transform -translate-x-1/2 rounded-full transition-all duration-300 ${
//                           isActive
//                             ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer border-2 border-white shadow-lg'
//                             : 'bg-gray-300'
//                         }`}
//                         style={{
//                           width: isActive ? '12px' : '6px',
//                           height: isActive ? '12px' : '6px',
//                           bottom: `${barHeight}px`,
//                           zIndex: 2
//                         }}
//                       />
//                     </div>
//                   )}

//                   {/* X-axis label */}
//                   <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
//                     {item.month}
//                   </div>

//                   {/* Value label */}
//                   <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
//                     {item.visits}
//                   </div>

//                   {/* Tooltip */}
//                   <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
//                     <div className="font-semibold">{item.month}</div>
//                     <div>{item.visits} registrations</div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* X-axis title */}
//       <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
//         Months
//       </div>
//     </div>
//   );
// };

// function PatientReport() {
//   const [patientData, setPatientData] = useState<PatientReportData[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
//   const location = useLocation();

//   useEffect(() => {
//     console.log("PatientReport mounted");
//     console.log("Location state:", location.state);
    
//     if (location.state?.autoRun) {
//       console.log("Auto-running report and opening modal...");
//       handleRunReport();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleRunReport = useCallback(async () => {
//     console.log("=== handleRunReport called ===");
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found in localStorage");
//         throw new Error("No authentication token found");
//       }

//       const startDate = "2025-01-01";
//       const endDate = "2025-10-30T23:59:59.999Z";

//       console.log("Fetching report with token:", token);
//       const response = await getPatientCheckInReport(startDate, endDate, token);
//       console.log("API response:", JSON.stringify(response, null, 2));

//       const patientCheckIns = response?.data?.patientCheckIns || [];
//       console.log("patientCheckIns array:", patientCheckIns);
      
//       if (!Array.isArray(patientCheckIns)) {
//         console.log("patientCheckIns is not an array:", patientCheckIns);
//         toast.error("Invalid data format received from server.");
//         return;
//       }

//       setPatientData(patientCheckIns);
//       setIsModalOpen(true);
//       toast.success("Patient report generated successfully!");
//     } catch (error) {
//       let errorMessage = "Failed to generate report";
      
//       if (error instanceof Error) {
//         errorMessage = error.message;
        
//         if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
//           errorMessage = "Cannot connect to backend server. Please ensure the server is running on port 3002.";
//         }
//       }
      
//       console.error("Error fetching report:", error);
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <>
//       <div className="p-6 max-w-4xl mx-auto">
//         <Toaster position="top-right" reverseOrder={false} />
//         <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
//           Patient Registration Report
//         </h1>
        
//         <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
//           <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
//             Monthly Patient Registrations
//           </h3>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//             Click the button below to generate the report in a popup window.
//           </p>
//           <button
//             onClick={handleRunReport}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
//             disabled={isLoading}
//           >
//             {isLoading ? "Generating Report..." : "Run Report"}
//           </button>
//         </div>
//       </div>

//       {/* Modal Popup */}
//       {isModalOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//           onClick={closeModal}
//         >
//           <div 
//             className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl max-h-[90vh] w-full overflow-auto shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
//                 Patient Registration Report Details
//               </h2>
//               <button
//                 onClick={closeModal}
//                 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//               >
//                 <XMarkIcon className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="p-6">
//               {patientData.length > 0 ? (
//                 <>
//                   {/* Chart Controls */}
//                   <div className="flex justify-between items-center mb-6">
//                     <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
//                       Monthly Patient Registrations (2025)
//                     </h4>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => setChartType('bar')}
//                         className={`px-3 py-1 rounded text-sm ${
//                           chartType === 'bar' 
//                             ? 'bg-blue-600 text-white' 
//                             : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                         }`}
//                       >
//                         Bar Chart
//                       </button>
//                       <button
//                         onClick={() => setChartType('line')}
//                         className={`px-3 py-1 rounded text-sm ${
//                           chartType === 'line' 
//                             ? 'bg-blue-600 text-white' 
//                             : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                         }`}
//                       >
//                         Line Chart
//                       </button>
//                     </div>
//                   </div>

//                   {/* Chart Section */}
//                   <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
//                     <CustomChart 
//                       data={patientData} 
//                       type={chartType}
//                       height={400}
//                     />
//                     <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
//                       Y-axis: Number of Registrations
//                     </div>
//                   </div>

//                   {/* Summary Statistics */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                     <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
//                       <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Period</h5>
//                       <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                         {patientData.length} months
//                       </p>
//                     </div>
//                     <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
//                       <h5 className="text-sm font-medium text-green-800 dark:text-green-200">Total Registrations</h5>
//                       <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//                         {patientData.reduce((sum, item) => sum + item.visits, 0)}
//                       </p>
//                     </div>
//                     <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
//                       <h5 className="text-sm font-medium text-purple-800 dark:text-purple-200">Average Monthly</h5>
//                       <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                         {Math.round(patientData.reduce((sum, item) => sum + item.visits, 0) / patientData.length)}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Patient Details Table */}
//                   <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
//                     Detailed Patient Breakdown
//                   </h4>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                       <thead>
//                         <tr className="bg-gray-50 dark:bg-gray-700">
//                           <th className="px-4 py-3 border-b text-left text-gray-700 dark:text-gray-300 font-semibold">Month</th>
//                           <th className="px-4 py-3 border-b text-left text-gray-700 dark:text-gray-300 font-semibold">Registrations</th>
//                           <th className="px-4 py-3 border-b text-left text-gray-700 dark:text-gray-300 font-semibold">Patients</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {patientData.map((data) => (
//                           <tr key={data._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                             <td className="px-4 py-3 border-b text-gray-900 dark:text-gray-100 font-medium">{data.month}</td>
//                             <td className="px-4 py-3 border-b text-gray-900 dark:text-gray-100">
//                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
//                                 {data.visits}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 border-b text-gray-900 dark:text-gray-100">
//                               {data.patients.length > 0 ? (
//                                 <div className="max-h-40 overflow-y-auto">
//                                   {data.patients.map((patient) => (
//                                     <div key={patient.patientId} className="py-1 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
//                                       <div className="font-medium text-sm">
//                                         {patient.firstName} {patient.lastName}
//                                       </div>
//                                       <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                                         {patient.email}
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               ) : (
//                                 <span className="text-gray-400 dark:text-gray-500 italic">No patients</span>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center py-12">
//                   <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
//                   <p className="text-gray-500 dark:text-gray-400 text-lg">
//                     No patient registrations found for the selected period.
//                   </p>
//                   <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
//                     Try adjusting the date range or check your data.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Modal Footer */}
//             <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 Total: {patientData.reduce((sum, item) => sum + item.visits, 0)} registrations across {patientData.length} months
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={closeModal}
//                   className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={handleRunReport}
//                   disabled={isLoading}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
//                 >
//                   {isLoading ? "Regenerating..." : "Refresh Data"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default PatientReport;

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getPatientCheckInReport } from "@/utils/api";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline"; 
import jsPDF from "jspdf";

interface PatientReportData {
  _id: string;
  month: string;
  visits: number;
  patients: Array<{
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

// Custom Chart Component
const CustomChart = ({ 
  data, 
  type = 'bar',
  height = 400 
}: { 
  data: PatientReportData[];
  type?: 'bar' | 'line';
  height?: number;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for chart
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.visits));
  const totalHeight = height - 80;

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex h-full">
        <div className="flex flex-col justify-between pr-2 text-xs text-gray-500 w-12">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 0.25, 0.5, 0.75, 1].map((position) => (
              <div
                key={position}
                className="border-t border-gray-200 dark:border-gray-600"
                style={{ order: 1 - position }}
              />
            ))}
          </div>

          <div className="flex items-end justify-between h-full gap-2 pl-4 pr-2 pb-8">
            {data.map((item, index) => {
              const barHeight = maxValue > 0 ? (item.visits / maxValue) * totalHeight : 0;
              const isActive = item.visits > 0;
              
              return (
                <div
                  key={item._id}
                  className="flex flex-col items-center flex-1 group relative"
                >
                  {type === 'bar' ? (
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-t from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{ 
                        height: `${barHeight}px`,
                        minHeight: isActive ? '4px' : '2px'
                      }}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      {index < data.length - 1 && (
                        <div
                          className="absolute top-1/2 left-1/2 bg-blue-500 h-0.5 transform -translate-y-1/2"
                          style={{
                            width: '100%',
                            transform: `translateY(${-barHeight / 2}px) rotate(${
                              Math.atan2(
                                (data[index + 1].visits / maxValue) * totalHeight - barHeight,
                                100
                              ) * (180 / Math.PI)
                            }deg)`,
                            zIndex: 1
                          }}
                        />
                      )}
                      <div
                        className={`absolute left-1/2 transform -translate-x-1/2 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer border-2 border-white shadow-lg'
                            : 'bg-gray-300'
                        }`}
                        style={{
                          width: isActive ? '12px' : '6px',
                          height: isActive ? '12px' : '6px',
                          bottom: `${barHeight}px`,
                          zIndex: 2
                        }}
                      />
                    </div>
                  )}

                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
                    {item.month}
                  </div>

                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {item.visits}
                  </div>

                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    <div className="font-semibold">{item.month}</div>
                    <div>{item.visits} registrations</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
        Months
      </div>
    </div>
  );
};

function PatientReport() {
  const [patientData, setPatientData] = useState<PatientReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("PatientReport mounted");
    console.log("Location state:", location.state);
    
    if (location.state?.autoRun) {
      console.log("Auto-running report and opening modal...");
      handleRunReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunReport = useCallback(async () => {
    console.log("=== handleRunReport called ===");
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
      console.log("patientCheckIns array:", patientCheckIns);
      
      if (!Array.isArray(patientCheckIns)) {
        console.log("patientCheckIns is not an array:", patientCheckIns);
        toast.error("Invalid data format received from server.");
        return;
      }

      setPatientData(patientCheckIns);
      setIsModalOpen(true);
      toast.success("Patient report generated successfully!");
    } catch (error) {
      let errorMessage = "Failed to generate report";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "Cannot connect to backend server. Please ensure the server is running on port 3002.";
        }
      }
      
      console.error("Error fetching report:", error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Simple PDF without canvas (text-based) - FIXED VERSION
  const downloadPDF = () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create PDF with proper constructor - FIXED
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Patient Registration Report", 20, 20);
      
      // Date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Summary Statistics
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Summary Statistics", 20, 50);
      
      pdf.setFontSize(12);
      pdf.text(`Total Period: ${patientData.length} months`, 20, 65);
      const totalRegistrations = patientData.reduce((sum, item) => sum + item.visits, 0);
      pdf.text(`Total Registrations: ${totalRegistrations}`, 20, 75);
      const averageMonthly = Math.round(totalRegistrations / patientData.length);
      pdf.text(`Average Monthly: ${averageMonthly}`, 20, 85);
      
      // Monthly Data Table
      let yPosition = 110;
      pdf.setFontSize(16);
      pdf.text("Monthly Patient Registrations", 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(10);
      
      // Table Header
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, yPosition, 170, 8, 'F');
      pdf.text("Month", 22, yPosition + 6);
      pdf.text("Registrations", 80, yPosition + 6);
      pdf.text("Patients Count", 130, yPosition + 6);
      
      yPosition += 8;
      
      // Table Rows
      pdf.setTextColor(0, 0, 0);
      patientData.forEach((item, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        pdf.rect(20, yPosition, 170, 8, 'F');
        
        pdf.text(item.month, 22, yPosition + 6);
        pdf.text(item.visits.toString(), 80, yPosition + 6);
        pdf.text(item.patients.length.toString(), 130, yPosition + 6);
        
        yPosition += 8;
      });
      
      // Patient Details
      yPosition += 10;
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.text("Patient Details by Month", 20, yPosition);
      
      patientData.forEach((monthData) => {
        if (monthData.patients.length > 0) {
          yPosition += 10;
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setTextColor(59, 130, 246);
          pdf.text(`${monthData.month} - ${monthData.visits} Registrations:`, 20, yPosition);
          
          monthData.patients.forEach((patient, index) => {
            yPosition += 6;
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            const patientText = `${index + 1}. ${patient.firstName} ${patient.lastName} (${patient.email})`;
            
            // Split long text
            if (patientText.length > 80) {
              const firstLine = patientText.substring(0, 80);
              const secondLine = patientText.substring(80);
              pdf.text(firstLine, 25, yPosition);
              yPosition += 4;
              pdf.text(secondLine, 25, yPosition);
            } else {
              pdf.text(patientText, 25, yPosition);
            }
          });
        }
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, 180, 290, { align: 'right' });
        pdf.text("Smart Healthcare System - Patient Report", 20, 290);
      }

      const currentDate = new Date().toISOString().split('T')[0];
      pdf.save(`patient-report-${currentDate}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
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
            Click the button below to generate the report in a popup window.
          </p>
          <button
            onClick={handleRunReport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Generating Report..." : "Run Report"}
          </button>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl max-h-[90vh] w-full overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Patient Registration Report Details
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                </button>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div ref={reportRef} className="p-6 bg-white">
              {patientData.length > 0 ? (
                <>
                  {/* Report Header for PDF */}
                  <div className="text-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Patient Registration Report
                    </h1>
                    <p className="text-gray-600">
                      Generated on {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {/* Chart Controls */}
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-md font-medium text-gray-700">
                      Monthly Patient Registrations (2025)
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-1 rounded text-sm ${
                          chartType === 'bar' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Bar Chart
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-1 rounded text-sm ${
                          chartType === 'line' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Line Chart
                      </button>
                    </div>
                  </div>

                  {/* Chart Section */}
                  <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
                    <CustomChart 
                      data={patientData} 
                      type={chartType}
                      height={400}
                    />
                    <div className="text-center mt-4 text-sm text-gray-500">
                      Y-axis: Number of Registrations | X-axis: Months
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-800">Total Period</h5>
                      <p className="text-2xl font-bold text-blue-600">
                        {patientData.length} months
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-green-800">Total Registrations</h5>
                      <p className="text-2xl font-bold text-green-600">
                        {patientData.reduce((sum, item) => sum + item.visits, 0)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-purple-800">Average Monthly</h5>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round(patientData.reduce((sum, item) => sum + item.visits, 0) / patientData.length)}
                      </p>
                    </div>
                  </div>

                  {/* Patient Details Table */}
                  <h4 className="text-md font-medium text-gray-700 mb-4">
                    Detailed Patient Breakdown
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 border-b text-left text-gray-700 font-semibold">Month</th>
                          <th className="px-4 py-3 border-b text-left text-gray-700 font-semibold">Registrations</th>
                          <th className="px-4 py-3 border-b text-left text-gray-700 font-semibold">Patients</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientData.map((data) => (
                          <tr key={data._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 border-b text-gray-900 font-medium">{data.month}</td>
                            <td className="px-4 py-3 border-b text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {data.visits}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-b text-gray-900">
                              {data.patients.length > 0 ? (
                                <div className="max-h-40 overflow-y-auto">
                                  {data.patients.map((patient) => (
                                    <div key={patient.patientId} className="py-1 border-b border-gray-100 last:border-b-0">
                                      <div className="font-medium text-sm">
                                        {patient.firstName} {patient.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {patient.email}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">No patients</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PDF Footer */}
                  <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                    <p>Smart Healthcare System - Patient Registration Report</p>
                    <p>Page 1 of 1</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg">
                    No patient registrations found for the selected period.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting the date range or check your data.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total: {patientData.reduce((sum, item) => sum + item.visits, 0)} registrations across {patientData.length} months
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleRunReport}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? "Regenerating..." : "Refresh Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PatientReport;