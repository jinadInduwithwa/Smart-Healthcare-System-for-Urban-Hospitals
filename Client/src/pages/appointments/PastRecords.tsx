import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPastAppointments } from "@/utils/api"; // Function to fetch past appointments

type ApiAppointment = {
  _id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  doctor: {
    userId?: {
      firstName?: string;
      lastName?: string;
    };
    specialization?: string;
  };
  availability: {
    date: string; // e.g., '2025-08-04T00:00:00.000Z'
    startTime: string; // e.g., '09:30'
  } | string; // Can be populated object or ObjectId string
};

type AppointmentCardProps = {
  appointment: ApiAppointment;
};

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  // Handle case where availability might be a string (ObjectId)
  const availability = typeof appointment.availability === "string" ? null : appointment.availability;
  
  if (!availability) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
        <div className="font-semibold text-lg">Appointment data unavailable</div>
        <div className="text-sm text-slate-600">Availability data not populated</div>
      </div>
    );
  }
  
  const doctorName = `${appointment.doctor.userId?.firstName ?? "Dr."} ${appointment.doctor.userId?.lastName ?? ""}`;
  const appointmentDate = new Date(availability.date);
  const formattedDate = appointmentDate.toLocaleDateString();
  
  // Payment status is derived from appointment status
  const paymentStatus = appointment.status === "CONFIRMED" ? "Successful" : 
                       appointment.status === "PENDING" ? "Pending" : "Cancelled";

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="font-semibold text-lg">{`Appointment with ${doctorName}`}</div>
      <div className="text-sm text-slate-600">
        <div>{appointment.doctor.specialization}</div>
        <div>{`${formattedDate} at ${availability.startTime}`}</div>
      </div>
      <div className="mt-2">
        <div className="text-sm text-slate-600">Status: <span className="font-semibold text-green-600">{paymentStatus}</span></div>
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
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">My Past Appointments</h1>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-slate-500">Loading your past appointments...</div>
      ) : (
        <div>
          {appointments.length === 0 ? (
            <div className="text-slate-500">No past appointments found.</div>
          ) : (
            appointments.map((appointment) => (
              <AppointmentCard key={appointment._id} appointment={appointment} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PastRecords;