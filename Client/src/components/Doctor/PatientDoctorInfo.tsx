import React from 'react';
import { FiUser, FiCalendar } from 'react-icons/fi';

interface PatientDoctorInfoProps {
  patientName: string;
  doctorName: string;
  consultationDate: string;
  status: string;
  setStatus: (status: string) => void;
  setDateToNow: () => void;
  errors: { [key: string]: string };
}

const PatientDoctorInfo: React.FC<PatientDoctorInfoProps> = ({
  patientName,
  doctorName,
  consultationDate,
  status,
  setStatus,
  setDateToNow,
  errors
}) => {
  return (
    <div className="pb-10">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 flex items-center">
          <FiUser className="mr-2" />
          Patient and Doctor Information
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient
            </label>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl">
              {patientName}
            </div>
            {errors.patient && (
              <p className="text-red-500 text-xs mt-2">{errors.patient}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Doctor
            </label>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl">
              {doctorName}
            </div>
            {errors.doctor && (
              <p className="text-red-500 text-xs mt-2">{errors.doctor}</p>
            )}
          </div>
        </div>
        
        {/* Consultation Details */}
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FiCalendar className="mr-2" />
            Consultation Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Consultation Date
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl">
                  {consultationDate
                    ? new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata',
                      }).format(new Date(consultationDate))
                    : 'Not set'}
                </div>
                <button
                  type="button"
                  onClick={setDateToNow}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm transition-all duration-200"
                >
                  Set to Now
                </button>
              </div>
              {errors.consultationDate && (
                <p className="text-red-500 text-xs mt-2">{errors.consultationDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-2">{errors.status}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDoctorInfo;