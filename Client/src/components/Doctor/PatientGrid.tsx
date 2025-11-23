import React from 'react';
import { FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Patient {
  _id: string;
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  address: Address;
  phone: string;
  isVerified: boolean;
  roleDocumentId: string;
  healthCardId: string;
  dateOfBirth: string;
  gender: string;
}

interface PatientGridProps {
  patients: Patient[];
  handleAddConsultation: (userId: string) => void;
  handleViewDetails: (userId: string) => void;
  formatDate: (dateString: string) => string;
}

const PatientGrid: React.FC<PatientGridProps> = ({
  patients,
  handleAddConsultation,
  handleViewDetails,
  formatDate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {patients.length === 0 && (
        <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <FiUser className="text-blue-500 dark:text-blue-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No patients found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
      
      {patients.map((patient) => (
        <div 
          key={patient._id} 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                  <FiUser className="text-gray-500 dark:text-gray-400 text-xl" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                    {patient.email}
                  </p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                patient.isVerified 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
              }`}>
                {patient.isVerified ? (
                  <>
                    <FiCheckCircle className="mr-1" /> Verified
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="mr-1" /> Pending
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <FiUser className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300 capitalize">{patient.gender}</span>
              </div>
              <div className="flex items-center text-sm">
                <svg className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">{formatDate(patient.dateOfBirth)}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">ID: </span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{patient.healthCardId}</span>
              </div>
            </div>
          </div>
          
          <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddConsultation(patient.userId)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
              >
                Add Consultation
              </button>
              <button
                onClick={() => handleViewDetails(patient.userId)}
                className="flex-1 bg-white hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 px-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientGrid;