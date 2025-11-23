import React from 'react';
import { FiCheck, FiX, FiRotateCcw } from 'react-icons/fi';

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

interface AppointmentCardProps {
  appointment: Appointment;
  updating: string | null;
  handleStatusUpdate: (appointmentId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, updating, handleStatusUpdate }) => {
  const getStatusClass = (status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">
          {appointment.patient.firstName} {appointment.patient.lastName}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
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
  );
};

export default AppointmentCard;