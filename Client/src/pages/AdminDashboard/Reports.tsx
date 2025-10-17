import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Define the interface for a report object
interface Report {
  _id: string;
  type: string;
  generatedAt: string; // Assuming it's a date string from the API
}

function Reports() {
  const [reportType, setReportType] = useState("patient");
  const [reports, setReports] = useState<Report[]>([]); // Typed as an array of Report
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/reports", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Ensure reports is an array, fallback to empty array if undefined
      setReports(response.data.data?.reports || []);
    } catch (error) {
      toast.error("Failed to fetch reports");
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:3002/api/reports/generate",
        { type: reportType },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Report generated successfully!");
      fetchReports();
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold mb-4">Generate Your Reports</h1>
      <div className="p-4 bg-white shadow-md rounded">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="mb-4 p-2 border rounded"
          disabled={isLoading}
        >
          <option value="patient">Patient Report</option>
          <option value="doctor">Doctor Report</option>
          <option value="financial">Financial Report</option>
        </select>
        <button
          onClick={generateReport}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>
      <div className="mt-4 p-4 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-2">Generated Reports</h2>
        <ul>
          {reports.map((report) => (
            <li key={report._id} className="border-b py-2">
              {report.type} - {new Date(report.generatedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Reports;