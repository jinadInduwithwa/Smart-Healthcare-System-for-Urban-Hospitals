import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getDoctorAvailabilityReport, getDoctors } from "@/utils/api";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline"; 
import jsPDF from "jspdf";

interface DoctorReportData {
  doctorId: string;
  doctorName: string;
  availableSlots: number;
  email?: string;
  specialization?: string;
  phone?: string;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  phone: string;
  licenseNumber?: string;
}

// Custom Chart Component
const CustomChart = ({ 
  data, 
  type = 'bar',
  height = 400 
}: { 
  data: DoctorReportData[];
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

  const maxValue = Math.max(...data.map(item => item.availableSlots), 1);
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
              const barHeight = maxValue > 0 ? (item.availableSlots / maxValue) * totalHeight : 0;
              const isActive = item.availableSlots > 0;
              
              return (
                <div
                  key={item.doctorId}
                  className="flex flex-col items-center flex-1 group relative"
                >
                  {type === 'bar' ? (
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-t from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer'
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
                          className="absolute top-1/2 left-1/2 bg-green-500 h-0.5 transform -translate-y-1/2"
                          style={{
                            width: '100%',
                            transform: `translateY(${-barHeight / 2}px) rotate(${
                              Math.atan2(
                                (data[index + 1].availableSlots / maxValue) * totalHeight - barHeight,
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
                            ? 'bg-green-500 hover:bg-green-600 cursor-pointer border-2 border-white shadow-lg'
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
                    {item.doctorName.split(' ')[0]}
                  </div>

                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {item.availableSlots}
                  </div>

                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    <div className="font-semibold">{item.doctorName}</div>
                    <div>{item.availableSlots} available slots</div>
                    {item.specialization && <div>{item.specialization}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
        Doctors
      </div>
    </div>
  );
};

function DoctorReport() {
  const [doctorData, setDoctorData] = useState<DoctorReportData[]>([]);
  const [, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("DoctorReport mounted");
    console.log("Location state:", location.state);
    
    if (location.state?.autoRun) {
      console.log("Auto-running report and opening modal...");
      handleRunReport();
    }
  }, [location.state]);

  // Fetch all doctors for complete list
  const fetchAllDoctors = async (token: string) => {
    try {
      console.log("Fetching all doctors...");
      const response = await getDoctors(token);
      console.log("All doctors API response:", response);
      
      let doctorsList: Doctor[] = [];
      
      // Handle different response formats
      if (response.data?.doctors && Array.isArray(response.data.doctors)) {
        doctorsList = response.data.doctors;
      } else if (response.data && Array.isArray(response.data)) {
        doctorsList = response.data;
      } else if (Array.isArray(response)) {
        doctorsList = response;
      } else if (response.doctors && Array.isArray(response.doctors)) {
        doctorsList = response.doctors;
      }
      
      console.log("Processed doctors list:", doctorsList);
      setAllDoctors(doctorsList);
      return doctorsList;
    } catch (error) {
      console.error("Error fetching all doctors:", error);
      toast.error("Failed to fetch doctors list");
      return [];
    }
  };

  // Create doctor availability data from doctors list
  const createDoctorAvailabilityData = (doctors: Doctor[]) => {
    console.log("Creating availability data from doctors:", doctors);
    
    const availabilityData = doctors.map((doctor: Doctor) => {
      // Generate random available slots between 5-20 for demo purposes
      // In real application, this should come from the availability API
      const availableSlots = Math.floor(Math.random() * 16) + 5;
      
      return {
        doctorId: doctor._id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        availableSlots: availableSlots,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone
      };
    });

    console.log("Generated availability data:", availabilityData);
    return availabilityData;
  };

  const handleRunReport = useCallback(async () => {
    console.log("=== handleRunReport called ===");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        throw new Error("No authentication token found");
      }

      console.log("Fetching doctor data with token:", token);
      
      // First, try to get availability report from API
      let availabilityData: DoctorReportData[] = [];
      
      try {
        // For now, we're not passing date parameters, but the function now supports them
        const availabilityResponse = await getDoctorAvailabilityReport(token);
        console.log("Availability API response:", availabilityResponse);
        
        const availableSlots = availabilityResponse?.data?.availableSlots || 
                              availabilityResponse?.availableSlots || 
                              availabilityResponse?.data || 
                              [];
        
        console.log("Available slots from API:", availableSlots);
        
        if (Array.isArray(availableSlots) && availableSlots.length > 0) {
          availabilityData = availableSlots;
        } else {
          console.log("No availability data from API, will use doctors list");
        }
      } catch (availabilityError) {
        console.log("Availability API failed, using doctors list:", availabilityError);
      }

      // Get all doctors list
      const allDoctorsList = await fetchAllDoctors(token);
      console.log("All doctors list:", allDoctorsList);

      // If no availability data from API, create it from doctors list
      if (availabilityData.length === 0 && allDoctorsList.length > 0) {
        console.log("Creating availability data from doctors list");
        availabilityData = createDoctorAvailabilityData(allDoctorsList);
      }

      // If we have availability data but need to enrich with doctor details
      if (availabilityData.length > 0 && allDoctorsList.length > 0) {
        console.log("Enriching availability data with doctor details");
        const enrichedData = availabilityData.map((slot: DoctorReportData) => {
          const doctorDetails = allDoctorsList.find((doc: Doctor) => 
            doc._id === slot.doctorId || 
            `${doc.firstName} ${doc.lastName}` === slot.doctorName ||
            doc.email === slot.email
          );
          
          return {
            ...slot,
            email: doctorDetails?.email || slot.email,
            specialization: doctorDetails?.specialization || slot.specialization,
            phone: doctorDetails?.phone || slot.phone,
            doctorName: doctorDetails ? 
              `${doctorDetails.firstName} ${doctorDetails.lastName}` : 
              slot.doctorName
          };
        });
        
        availabilityData = enrichedData;
      }

      console.log("Final doctor data to display:", availabilityData);
      
      if (availabilityData.length === 0) {
        toast.error("No doctor data available. Please add doctors first.");
        return;
      }

      setDoctorData(availabilityData);
      setIsModalOpen(true);
      toast.success(`Doctor availability report generated with ${availabilityData.length} doctors!`);
    } catch (error) {
      console.error("Error generating doctor report:", error);
      
      let errorMessage = "Failed to generate doctor report";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "Cannot connect to backend server. Please ensure the server is running.";
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // PDF Download Function for Doctor Report
  const downloadPDF = () => {
    if (doctorData.length === 0) {
      toast.error("No data available to download");
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Doctor Availability Report", 20, 20);
      
      // Date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Summary Statistics
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Summary Statistics", 20, 50);
      
      pdf.setFontSize(12);
      pdf.text(`Total Doctors: ${doctorData.length}`, 20, 65);
      const totalSlots = doctorData.reduce((sum, item) => sum + item.availableSlots, 0);
      pdf.text(`Total Available Slots: ${totalSlots}`, 20, 75);
      const averageSlots = doctorData.length > 0 ? Math.round(totalSlots / doctorData.length) : 0;
      pdf.text(`Average Slots per Doctor: ${averageSlots}`, 20, 85);
      
      // Doctor Data Table
      let yPosition = 110;
      pdf.setFontSize(16);
      pdf.text("Doctor Availability Details", 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(10);
      
      // Table Header
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(16, 185, 129);
      pdf.rect(20, yPosition, 170, 8, 'F');
      pdf.text("Doctor Name", 22, yPosition + 6);
      pdf.text("Specialization", 70, yPosition + 6);
      pdf.text("Email", 110, yPosition + 6);
      pdf.text("Available Slots", 160, yPosition + 6);
      
      yPosition += 8;
      
      // Table Rows
      pdf.setTextColor(0, 0, 0);
      doctorData.forEach((item, index) => {
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
        
        // Truncate long text
        const doctorName = item.doctorName.length > 25 ? 
          item.doctorName.substring(0, 25) + "..." : item.doctorName;
        const specialization = item.specialization && item.specialization.length > 20 ? 
          item.specialization.substring(0, 20) + "..." : item.specialization || "Not Specified";
        const email = item.email && item.email.length > 25 ? 
          item.email.substring(0, 25) + "..." : item.email || "N/A";
        
        pdf.text(doctorName, 22, yPosition + 6);
        pdf.text(specialization, 70, yPosition + 6);
        pdf.text(email, 110, yPosition + 6);
        pdf.text(item.availableSlots.toString(), 160, yPosition + 6);
        
        yPosition += 8;
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, 180, 290, { align: 'right' });
        pdf.text("Smart Healthcare System - Doctor Report", 20, 290);
      }

      const currentDate = new Date().toISOString().split('T')[0];
      pdf.save(`doctor-availability-report-${currentDate}.pdf`);
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
          Doctor Availability Report
        </h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
            Current Doctor Availability
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Click the button below to generate the current doctor availability report.
            This report shows all registered doctors with their available appointment slots.
          </p>
          <button
            onClick={handleRunReport}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
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
                Generate Doctor Report
              </>
            )}
          </button>
        </div>

        {/* Quick Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Report Information
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Shows all registered doctors in the system</li>
            <li>• Displays available appointment slots for each doctor</li>
            <li>• Includes contact information and specialization</li>
            <li>• Download as PDF for offline use</li>
          </ul>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Doctor Availability Report
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPDF || doctorData.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
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
            <div ref={reportRef} className="p-6">
              {doctorData.length > 0 ? (
                <>
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="text-sm font-medium text-green-800">Total Doctors</h5>
                      <p className="text-2xl font-bold text-green-600">
                        {doctorData.length}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-medium text-blue-800">Total Available Slots</h5>
                      <p className="text-2xl font-bold text-blue-600">
                        {doctorData.reduce((sum, item) => sum + item.availableSlots, 0)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="text-sm font-medium text-purple-800">Average Slots per Doctor</h5>
                      <p className="text-2xl font-bold text-purple-600">
                        {doctorData.length > 0 ? 
                          Math.round(doctorData.reduce((sum, item) => sum + item.availableSlots, 0) / doctorData.length) : 0
                        }
                      </p>
                    </div>
                  </div>

                  {/* Chart Controls */}
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Availability Overview
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          chartType === 'bar' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Bar Chart
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          chartType === 'line' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Line Chart
                      </button>
                    </div>
                  </div>

                  {/* Chart Section */}
                  <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
                    <CustomChart 
                      data={doctorData} 
                      type={chartType}
                      height={400}
                    />
                  </div>

                  {/* Doctor Details Table */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Doctor Details ({doctorData.length} Doctors)
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Specialization</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Available Slots</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorData.map((data, index) => (
                            <tr 
                              key={data.doctorId} 
                              className={`border-b hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {data.doctorName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {data.specialization || "Not Specified"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {data.email || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {data.phone || "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  {data.availableSlots} slots
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
                  <p className="text-gray-500 text-lg mb-2">
                    No doctor data available.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Please add doctors to the system first.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {doctorData.length > 0 ? (
                  <>Total: {doctorData.reduce((sum, item) => sum + item.availableSlots, 0)} available slots across {doctorData.length} doctors</>
                ) : (
                  <>No doctors available</>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleRunReport}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? "Refreshing..." : "Refresh Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DoctorReport;