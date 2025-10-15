import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPatients } from '../../utils/api'; // Adjust the import path as needed
import { FiSearch, FiFilter, FiX, FiUser, FiCalendar, FiCheckCircle, FiAlertCircle, FiChevronLeft, FiChevronRight, FiEye, FiPlus } from 'react-icons/fi';

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

      {/* Enhanced Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800  p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or health card ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <FiFilter className="text-gray-500 dark:text-gray-400 mr-2" />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <FiCheckCircle className="text-gray-500 dark:text-gray-400 mr-2" />
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Verification Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Not Verified</option>
              </select>
            </div>
            
            {(searchTerm || filterGender !== 'all' || filterVerified !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                <FiX className="mr-1" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-600 dark:text-gray-300">
          Showing <span className="font-medium">{indexOfFirstPatient + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastPatient, filteredPatients.length)}
          </span>{' '}
          of <span className="font-medium">{filteredPatients.length}</span> patients
        </p>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
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
              {currentPatients.length === 0 && !isLoading && !error && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center py-8">
                      <FiSearch className="text-2xl mb-2" />
                      <p>No patients found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
              {currentPatients.map((patient) => (
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentPatients.length === 0 && !isLoading && !error && (
            <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="text-blue-500 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No patients found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
          
          {currentPatients.map((patient) => (
            <div 
              key={patient._id} 
              className="bg-white dark:bg-gray-800  border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
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
                    <FiCalendar className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
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
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show first, last, current, and nearby pages
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              // Show ellipsis for skipped pages
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={pageNum} className="px-2 text-gray-400 dark:text-gray-600">
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPatientRecords;