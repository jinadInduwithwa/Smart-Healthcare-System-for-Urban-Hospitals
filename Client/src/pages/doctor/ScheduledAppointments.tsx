import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getDoctorAppointments, updateAppointmentStatus } from '../../utils/api';

interface Appointment {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
  };
  availability: {
    date: string;
    startTime: string;
    endTime: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

const ScheduledAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getDoctorAppointments();
        setAppointments(data.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        addToast('Error fetching appointments: ' + (error as Error).message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    try {
      setUpdating(appointmentId);
      const updatedAppointment = await updateAppointmentStatus(appointmentId, newStatus);
      
      // Update the appointment in the state
      setAppointments(prev => prev.map(app => 
        app._id === appointmentId ? updatedAppointment.data : app
      ));
      
      addToast(`Appointment status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      addToast('Error updating appointment status: ' + (error as Error).message, 'error');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Scheduled Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No scheduled appointments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'CONFIRMED' 
                    ? 'bg-green-100 text-green-800' 
                    : appointment.status === 'PENDING' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-1">{appointment.patient.email}</p>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm">
                  <span className="font-medium">Date:</span> {new Date(appointment.availability.date).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time:</span> {appointment.availability.startTime} - {appointment.availability.endTime}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Booked on:</span> {new Date(appointment.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* Status update buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {appointment.status !== 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment._id, 'CONFIRMED')}
                    disabled={updating === appointment._id}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {updating === appointment._id ? 'Confirming...' : 'Confirm'}
                  </button>
                )}
                
                {appointment.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment._id, 'CANCELLED')}
                    disabled={updating === appointment._id}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {updating === appointment._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
                
                {appointment.status === 'CANCELLED' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment._id, 'PENDING')}
                    disabled={updating === appointment._id}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {updating === appointment._id ? 'Reactivating...' : 'Reactivate'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledAppointments;