import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultationsByPatient } from '../../utils/api';
import { FiSearch, FiCalendar, FiFilter, FiX, FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';

// Define interface for Consultation
interface Diagnosis {
  code: string;
  description?: string;
}

interface ClinicalNotes {
  subjective: string;
  objective: string;
}

interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
}

interface Consultation {
  patientId: string;
  consultationDate: string;
  diagnosis: Diagnosis[];
  clinicalNotes: ClinicalNotes;
  medications: Medication[];
  recommendedTests: string[];
  status: string;
}

const AllConsultations: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedConsultations, setExpandedConsultations] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const consultationsPerPage = 5;
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!patientId) {
        setError('No patient ID provided.');
        return;
      }
      setIsLoading(true);
      try {
        const response = await getConsultationsByPatient(patientId);
        if (response.success) {
          // Transform API response to match Consultation interface
          const transformedConsultations: Consultation[] = response.data.map((consult: any) => {
            if (!consult.patient || !consult.patient._id) {
              throw new Error('Invalid consultation data: patient ID is missing');
            }
            return {
              patientId: consult.patient._id,
              consultationDate: consult.consultationDate,
              diagnosis: consult.diagnosis || [],
              clinicalNotes: {
                subjective: consult.clinicalNotes?.subjective || 'N/A',
                objective: consult.clinicalNotes?.objective || 'N/A',
              },
              medications: consult.medications || [],
              recommendedTests: consult.recommendedTests || [],
              status: consult.status || 'UNKNOWN',
            };
          });
          setConsultations(transformedConsultations);
          setFilteredConsultations(transformedConsultations);
          setError(null);
        } else {
          throw new Error(response.message || 'Failed to fetch consultations');
        }
      } catch (err: any) {
        console.error('Error fetching consultations:', err);
        if (err.message === 'No authentication token found') {
          navigate('/login');
        } else {
          setError('Failed to load consultations. Please check if the server is running or contact support.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();
  }, [patientId, navigate]);

  useEffect(() => {
    let filtered = consultations.filter((consult) => {
      const date = new Date(consult.consultationDate);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      if (from && date < from) return false;
      if (to && date > to) return false;

      // Status filter
      if (statusFilter !== 'ALL' && consult.status !== statusFilter) return false;

      const searchLower = searchTerm.toLowerCase();
      const diagnosisStr = consult.diagnosis.map(d => `${d.code} ${d.description || ''}`).join(' ').toLowerCase();
      const notesStr = `${consult.clinicalNotes.subjective} ${consult.clinicalNotes.objective}`.toLowerCase();
      const medsStr = consult.medications.map(m => `${m.drug} ${m.dosage} ${m.frequency}`).join(' ').toLowerCase();
      const testsStr = consult.recommendedTests.join(' ').toLowerCase();
      const statusStr = consult.status.toLowerCase();
      const patientIdStr = consult.patientId.toLowerCase();

      return (
        diagnosisStr.includes(searchLower) ||
        notesStr.includes(searchLower) ||
        medsStr.includes(searchLower) ||
        testsStr.includes(searchLower) ||
        statusStr.includes(searchLower) ||
        patientIdStr.includes(searchLower)
      );
    });

    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.consultationDate);
        const dateB = new Date(b.consultationDate);
        if (dateA < dateB) return sortOrder === 'asc' ? -1 : 1;
        if (dateA > dateB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredConsultations(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, fromDate, toDate, sortBy, sortOrder, consultations, statusFilter]);

  const handleSort = () => {
    if (sortBy === 'date') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('date');
      setSortOrder('asc');
    }
  };

  const toggleConsultation = (index: number) => {
    const newExpanded = new Set(expandedConsultations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedConsultations(newExpanded);
  };

  const indexOfLastConsult = currentPage * consultationsPerPage;
  const indexOfFirstConsult = indexOfLastConsult - consultationsPerPage;
  const currentConsultations = filteredConsultations.slice(indexOfFirstConsult, indexOfLastConsult);
  const totalPages = Math.ceil(filteredConsultations.length / consultationsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getSortIcon = () => {
    if (sortBy !== 'date') return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(new Date(dateStr));
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setStatusFilter('ALL');
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Patient Consultations</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">View and manage all consultations for this patient</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors flex items-center"
          >
            <FiChevronLeft className="mr-1" /> Back
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-6 p-6  flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading consultations...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start">
            <FiX className="text-xl mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading consultations</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="mb-6  p-5 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by diagnosis, notes, medications, tests, status, or patient ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <FiCalendar className="text-gray-500 dark:text-gray-400 mr-2" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="mx-2 text-gray-500 dark:text-gray-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center">
              <FiFilter className="text-gray-500 dark:text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            {(searchTerm || fromDate || toDate || statusFilter !== 'ALL') && (
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
          Showing <span className="font-medium">{indexOfFirstConsult + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastConsult, filteredConsultations.length)}
          </span>{' '}
          of <span className="font-medium">{filteredConsultations.length}</span> consultations
        </p>
        <button
          onClick={handleSort}
          className="mt-2 sm:mt-0 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Sort by Date {getSortIcon()}
        </button>
      </div>

      {/* Consultation Cards */}
      <div className="space-y-5">
        {currentConsultations.length === 0 && !isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <FiSearch className="text-blue-500 dark:text-blue-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No consultations found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
        
        {currentConsultations.map((consult, index) => {
          const globalIndex = indexOfFirstConsult + index;
          const isExpanded = expandedConsultations.has(globalIndex);
          
          return (
            <div 
              key={globalIndex} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Card Header */}
              <div 
                className="p-5 cursor-pointer flex justify-between items-center"
                onClick={() => toggleConsultation(globalIndex)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <svg
                      className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(consult.consultationDate)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Patient ID: {consult.patientId}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(consult.status)}`}>
                    {consult.status.replace('_', ' ')}
                  </span>
                  <FiChevronDown className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {/* Card Content (Expandable) */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Clinical Notes
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subjective</p>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">{consult.clinicalNotes.subjective}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Objective</p>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">{consult.clinicalNotes.objective}</p>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mt-5 mb-3 flex items-center">
                        <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Diagnosis
                      </h4>
                      <div className="mt-2">
                        {consult.diagnosis.length > 0 ? (
                          <ul className="space-y-2">
                            {consult.diagnosis.map((d, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                                <div>
                                  <span className="font-medium">{d.code}</span>
                                  {d.description && <span className="text-gray-600 dark:text-gray-400"> - {d.description}</span>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No diagnosis recorded</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Medications
                      </h4>
                      <div className="mt-2">
                        {consult.medications.length > 0 ? (
                          <ul className="space-y-3">
                            {consult.medications.map((med, idx) => (
                              <li key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="font-medium text-gray-900 dark:text-white">{med.drug}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {med.dosage} • {med.frequency}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No medications prescribed</p>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mt-5 mb-3 flex items-center">
                        <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Recommended Tests
                      </h4>
                      <div className="mt-2">
                        {consult.recommendedTests.length > 0 ? (
                          <ul className="flex flex-wrap gap-2">
                            {consult.recommendedTests.map((test, idx) => (
                              <li key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                {test}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No tests recommended</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      View Full Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

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

export default AllConsultations;