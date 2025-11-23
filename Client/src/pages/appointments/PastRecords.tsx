import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPastAppointments } from "@/utils/api"; // Function to fetch past appointments

type ApiAppointment = {
  _id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  doctor?: {
    userId?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    specialization?: string;
    licenseNumber?: string;
    createdAt?: string;
    updatedAt?: string;
    _id?: string;
  };
  availability: {
    date: string; // e.g., '2025-08-04T00:00:00.000Z'
    startTime: string; // e.g., '09:30'
    _id?: string;
    doctor?: string;
    __v?: number;
  } | string; // Can be populated object or ObjectId string
  patient?: string;
  amountCents?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

type AppointmentCardProps = {
  appointment: ApiAppointment;
};

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  // Handle case where availability might be a string (ObjectId)
  const availability = typeof appointment.availability === "string" ? null : appointment.availability;
  
  if (!availability) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Appointment Data Unavailable</h3>
        </div>
        <p className="text-slate-600">Availability data not populated for this appointment.</p>
      </div>
    );
  }
  
  // Correctly extract doctor name from the nested structure with null checks
  const doctorFirstName = appointment.doctor?.userId?.firstName ?? "Dr.";
  const doctorLastName = appointment.doctor?.userId?.lastName ?? "";
  const doctorName = `${doctorFirstName} ${doctorLastName}`.trim() || "Dr. Unknown";
  
  const appointmentDate = new Date(availability.date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = availability.startTime;
  
  // Payment status is derived from appointment status
  const paymentStatus = appointment.status === "CONFIRMED" ? "Successful" : 
                       appointment.status === "PENDING" ? "Pending" : "Cancelled";
  
  // Status badge styling
  const getStatusBadgeClass = () => {
    switch (appointment.status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Format amount if available
  const formattedAmount = appointment.amountCents ? 
    `Rs. ${(appointment.amountCents / 100).toFixed(2)}` : 
    "Amount not specified";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Appointment with {doctorName}</h3>
          <p className="text-slate-600">{appointment.doctor?.specialization || "Specialization not specified"}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClass()}`}>
          {paymentStatus}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500">Date & Time</p>
            <p className="font-medium text-slate-800">{formattedDate} at {formattedTime}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500">Amount</p>
            <p className="font-medium text-slate-800">{formattedAmount}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
        <div className="flex items-center text-sm text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Appointment ID: {appointment._id.slice(-6)}
        </div>
      </div>
    </div>
  );
};

// Helper function to check if an appointment is in the past
const isPastAppointment = (appointment: ApiAppointment): boolean => {
  // Handle case where availability might be a string (ObjectId)
  const availability = typeof appointment.availability === "string" ? null : appointment.availability;
  if (!availability?.date) {
    console.log("Skipping appointment due to missing availability data:", appointment._id);
    return false; // Skip if availability data is not populated
  }
  
  try {
    const appointmentDate = new Date(availability.date);
    // Check if date is valid
    if (isNaN(appointmentDate.getTime())) {
      console.log("Skipping appointment due to invalid date:", appointment._id, availability.date);
      return false;
    }
    
    // Get today's date (without time) in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a date object for the appointment date at midnight in local timezone
    const appointmentLocalDate = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    
    const isPast = appointmentLocalDate < today;
    console.log(`Appointment ${appointment._id}: ${appointmentLocalDate.toDateString()} < ${today.toDateString()} = ${isPast}`);
    
    // Return true if appointment date is before today
    return isPast;
  } catch (e) {
    console.error("Error processing appointment date for appointment:", appointment._id, e);
    return false;
  }
};

const PastRecords = () => {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching past appointments...");
        
        // Check if token exists
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);
        if (!token) {
          throw new Error("No authentication token found");
        }
        
        const res = await getPastAppointments();
        console.log("API response received:", res);
        const items: ApiAppointment[] = res?.data ?? [];
        console.log("Appointments data:", items);
        
        // Filter to show only past appointments (before today)
        const pastAppointments = items.filter(isPastAppointment);
        
        console.log("Filtered past appointments:", pastAppointments);
        console.log("Past appointments count:", pastAppointments.length);
        setAppointments(pastAppointments);
      } catch (e: any) {
        console.error("Error fetching past appointments:", e);
        const errorMessage = e.message || "Failed to load past appointments";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">My Past Appointments</h1>
        <p className="text-slate-600 mt-2">View your completed medical appointments and consultation history</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">Error Loading Appointments</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your past appointments...</p>
        </div>
      ) : (
        <div>
          {appointments.length === 0 ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Past Appointments</h3>
                <p className="text-slate-600 mb-6">You don't have any past appointments yet. When you complete appointments, they will appear here.</p>
                <a 
                  href="/patient/book" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Book Your First Appointment
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-slate-600">
                  Showing <span className="font-bold">{appointments.length}</span> completed appointments
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Sorted by most recent</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PastRecords;