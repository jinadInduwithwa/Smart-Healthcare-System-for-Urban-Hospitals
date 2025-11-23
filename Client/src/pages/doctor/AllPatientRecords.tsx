import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPatients } from '../../utils/api';
import { FiChevronLeft, FiSearch, FiFilter, FiCheckCircle, FiX } from 'react-icons/fi';
import PatientTable from '../../components/Doctor/PatientTable';
import PatientGrid from '../../components/Doctor/PatientGrid';
import PatientFilters from '../../components/Doctor/PatientFilters';
import PatientPagination from '../../components/Doctor/PatientPagination';

// Define interfaces for TypeScript
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Patient {
  _id: string; // Consultation record ID
  userId: string; // User ID (userId._id from API)
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
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Added view mode toggle
  const patientsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await getAllPatients();
        if (response.success) {
          // Transform API response to match Patient interface
          const transformedPatients: Patient[] = response.data.map((patient: any) => ({
            _id: patient._id,
            userId: patient.userId._id, // Map userId._id
            email: patient.userId.email,
            role: patient.userId.role,
            firstName: patient.userId.firstName,
            lastName: patient.userId.lastName,
            address: patient.userId.address,
            phone: patient.userId.phone || 'N/A',
            isVerified: patient.userId.isActive,
            roleDocumentId: patient.roleDocumentId || 'N/A',
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
      } finally {
        setIsLoading(false);
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterVerified, filterGender, sortBy, sortOrder, patients]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleAddConsultation = (userId: string) => {
    navigate(`/doctor-dashboard/consultation/add/${userId}`);
  };

  const handleViewDetails = (userId: string) => {
    navigate(`/doctor-dashboard/consultation/patient/${userId}`);
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterVerified('all');
    setFilterGender('all');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Patient Records</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and access all patient information</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
            }`}
          >
            Table View
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
            }`}
          >
            Grid View
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors flex items-center"
          >
            <FiChevronLeft className="mr-1" /> Back
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading patient records...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start">
            <FiX className="text-xl mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading patient records</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <PatientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
        filterVerified={filterVerified}
        setFilterVerified={setFilterVerified}
        clearFilters={clearFilters}
      />

      {viewMode === 'table' ? (
        <PatientTable
          patients={currentPatients}
          handleSort={handleSort}
          getSortIcon={getSortIcon}
          handleAddConsultation={handleAddConsultation}
          handleViewDetails={handleViewDetails}
          formatDate={formatDate}
        />
      ) : (
        <PatientGrid
          patients={currentPatients}
          handleAddConsultation={handleAddConsultation}
          handleViewDetails={handleViewDetails}
          formatDate={formatDate}
        />
      )}

      <PatientPagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
        indexOfFirstPatient={indexOfFirstPatient}
        indexOfLastPatient={indexOfLastPatient}
        totalPatients={filteredPatients.length}
      />
    </div>
  );
};

export default AllPatientRecords;