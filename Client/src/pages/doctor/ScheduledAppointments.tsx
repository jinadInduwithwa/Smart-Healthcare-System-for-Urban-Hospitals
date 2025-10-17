import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getDoctorAppointments, updateAppointmentStatus } from '../../utils/api';
import AppointmentList from '../../components/Doctor/AppointmentList';

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
      <AppointmentList 
        appointments={appointments} 
        updating={updating} 
        handleStatusUpdate={handleStatusUpdate} 
      />
    </div>
  );
};

export default ScheduledAppointments;