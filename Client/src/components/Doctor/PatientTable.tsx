import React from 'react';
import { FiUser, FiPlus, FiEye } from 'react-icons/fi';

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

interface PatientTableProps {
  patients: Patient[];
  handleSort: (column: string) => void;
  getSortIcon: (column: string) => string | null;
  handleAddConsultation: (userId: string) => void;
  handleViewDetails: (userId: string) => void;
  formatDate: (dateString: string) => string;
}

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  handleSort,
  getSortIcon,
  handleAddConsultation,
  handleViewDetails,
  formatDate
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th 
              onClick={() => handleSort('name')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center">
                Patient {getSortIcon('name')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Health Card ID
            </th>
            <th 
              onClick={() => handleSort('dob')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center">
                Date of Birth {getSortIcon('dob')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Gender
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {patients.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center py-8">
                  <FiUser className="text-2xl mb-2" />
                  <p>No patients found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                </div>
              </td>
            </tr>
          )}
          {patients.map((patient) => (
            <tr key={patient._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center">
                    <FiUser className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.firstName} {patient.lastName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {patient.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                {patient.healthCardId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {formatDate(patient.dateOfBirth)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                {patient.gender}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {patient.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  patient.isVerified 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                }`}>
                  {patient.isVerified ? 'Verified' : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddConsultation(patient.userId)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    title="Add Consultation"
                  >
                    <FiPlus className="mr-1" /> Add
                  </button>
                  <button
                    onClick={() => handleViewDetails(patient.userId)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    title="View Details"
                  >
                    <FiEye className="mr-1" /> View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;