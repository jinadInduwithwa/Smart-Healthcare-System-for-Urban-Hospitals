import React from 'react';
import AppointmentCard from './AppointmentCard';

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

interface AppointmentListProps {
  appointments: Appointment[];
  updating: string | null;
  handleStatusUpdate: (appointmentId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, updating, handleStatusUpdate }) => {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No scheduled appointments found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          updating={updating}
          handleStatusUpdate={handleStatusUpdate}
        />
      ))}
    </div>
  );
};

export default AppointmentList;