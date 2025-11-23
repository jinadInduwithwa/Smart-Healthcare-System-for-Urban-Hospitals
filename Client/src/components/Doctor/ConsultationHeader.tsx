import React from 'react';
import { FiBook, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface ConsultationHeaderProps {
  patientId: string;
}

const ConsultationHeader: React.FC<ConsultationHeaderProps> = ({ patientId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">New Consultation</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Create a new patient consultation record</p>
      </div>
      <div className="mt-4 md:mt-0 flex space-x-3">
        <button
          onClick={() => navigate(`/doctor-dashboard/consultation/patient/${patientId}`)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FiBook className="mr-2" />
          Patient History
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
        >
          <FiX className="mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConsultationHeader;