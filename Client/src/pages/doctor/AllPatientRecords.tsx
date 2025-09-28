import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPatients } from '../../utils/api'; // Adjust the import path as needed

// Define interfaces for TypeScript
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Patient {
  _id: string;
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

const AllPatientRecords: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const patientsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getAllPatients();
        if (response.success) {
          // Transform API response to match Patient interface
          const transformedPatients: Patient[] = response.data.map((patient: any) => ({
            _id: patient._id,
            email: patient.userId.email,
            role: patient.userId.role,
            firstName: patient.userId.firstName,
            lastName: patient.userId.lastName,
            address: patient.userId.address,
            phone: patient.userId.phone || 'N/A', // Fallback if phone is missing
            isVerified: patient.userId.isActive, // Map isActive to isVerified
            roleDocumentId: patient.roleDocumentId || 'N/A', // Fallback if missing
            healthCardId: patient.healthCardId,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
          }));
          setPatients(transformedPatients);
          setFilteredPatients(transformedPatients);
          setError(null);
        } else {
          throw new Error(response.message || 'Failed to fetch patients');
        }
      } catch (err: any) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patient records. Please check if the server is running or contact support.');
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    let filtered = patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = patient.email.toLowerCase();
      const healthCardId = patient.healthCardId.toLowerCase();
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || email.includes(term) || healthCardId.includes(term);
    });

    if (filterVerified !== 'all') {
      filtered = filtered.filter((patient) => patient.isVerified === (filterVerified === 'verified'));
    }

    if (filterGender !== 'all') {
      filtered = filtered.filter((patient) => patient.gender.toLowerCase() === filterGender.toLowerCase());
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        let compareA: string | Date;
        let compareB: string | Date;
        switch (sortBy) {
          case 'name':
            compareA = `${a.firstName} ${a.lastName}`.toLowerCase();
            compareB = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'dob':
            compareA = new Date(a.dateOfBirth);
            compareB = new Date(b.dateOfBirth);
            break;
          default:
            return 0;
        }
        if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredPatients(filtered);
  }, [searchTerm, filterVerified, filterGender, sortBy, sortOrder, patients]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleAddConsultation = (_id: string) => {
    navigate(`/doctor-dashboard/consultation/add/${_id}`);
  };

  const handleViewDetails = (_id: string) => {
    navigate(`/doctor-dashboard/consultation/patient/${_id}`);
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="sm:p-2 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-600 dark:text-blue-300">
        All Patient Records
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
      <div className="relative mb-4 sm:mb-6 w-full sm:w-1/2">
        <input
          type="text"
          placeholder="Search by name, email, or health card ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border rounded-xl bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-300"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {/* Filters for mobile */}
      <div className="flex flex-col sm:hidden space-y-2 mb-4">
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
          className="text-xs bg-blue-600 dark:bg-blue-800 text-white border-none rounded-lg focus:outline-none w-full p-2"
        >
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="text-xs bg-blue-600 dark:bg-blue-800 text-white border-none rounded-lg focus:outline-none w-full p-2"
        >
          <option value="all">All Verification Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not Verified</option>
        </select>
      </div>
      {/* Card layout for mobile */}
      <div className="block sm:hidden space-y-4">
        {currentPatients.map((patient) => (
          <div
            key={patient._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600"
          >
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
              {`${patient.firstName} ${patient.lastName}`}
            </h3>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <strong>Email:</strong> {patient.email}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <strong>Health Card ID:</strong> {patient.healthCardId}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <strong>Gender:</strong> {patient.gender.toUpperCase()}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <strong>Phone:</strong> {patient.phone}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <strong>Address:</strong> {`${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zipCode}, ${patient.address.country}`}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <strong>Verified:</strong> {patient.isVerified ? 'Verified' : 'Not Verified'}
            </p>
            <div className="flex flex-col space-y-2 mt-3">
              <button
                onClick={() => handleAddConsultation(patient._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 w-full text-sm"
              >
                Add Consultation
              </button>
              <button
                onClick={() => handleViewDetails(patient._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 w-full text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Table layout for larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr className="bg-blue-600 dark:bg-blue-800 text-white">
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900 rounded-tl-lg"
              >
                Name {getSortIcon('name')}
              </th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Health Card ID</th>
              <th
                onClick={() => handleSort('dob')}
                className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900"
              >
                Date of Birth {getSortIcon('dob')}
              </th>
              <th className="px-4 py-3 text-left">
                Gender
                <div>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="text-xs bg-blue-600 dark:bg-blue-800 text-white border-none rounded-lg focus:outline-none w-20 mt-2"
                  >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">
                Verified
                <div>
                  <select
                    value={filterVerified}
                    onChange={(e) => setFilterVerified(e.target.value)}
                    className="text-xs bg-blue-600 dark:bg-blue-800 text-white border-none rounded-lg focus:outline-none w-20 mt-2"
                  >
                    <option value="all">All</option>
                    <option value="verified">Yes</option>
                    <option value="unverified">No</option>
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients.map((patient) => (
              <tr
                key={patient._id}
                className="border-b dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <td className="px-4 py-3">{`${patient.firstName} ${patient.lastName}`}</td>
                <td className="px-4 py-3">{patient.email}</td>
                <td className="px-4 py-3">{patient.healthCardId}</td>
                <td className="px-4 py-3">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                <td className="px-4 py-3">{patient.gender.toUpperCase()}</td>
                <td className="px-4 py-3">{patient.phone}</td>
                <td className="px-4 py-3">{`${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zipCode}, ${patient.address.country}`}</td>
                <td className="px-4 py-3">{patient.isVerified ? 'Verified' : 'Not Verified'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleAddConsultation(patient._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 w-full"
                    >
                      Add Consultation
                    </button>
                    <button
                      onClick={() => handleViewDetails(patient._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 w-full"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex flex-wrap justify-center mt-4 sm:mt-6 gap-2">
        {Array.from({ length: Math.ceil(filteredPatients.length / patientsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-3 sm:px-4 py-2 rounded-lg ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllPatientRecords;