
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultationsByPatient } from '../../utils/api';

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
  const consultationsPerPage = 10;
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
  }, [searchTerm, fromDate, toDate, sortBy, sortOrder, consultations]);

  const handleSort = () => {
    if (sortBy === 'date') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('date');
      setSortOrder('asc');
    }
  };

  const indexOfLastConsult = currentPage * consultationsPerPage;
  const indexOfFirstConsult = indexOfLastConsult - consultationsPerPage;
  const currentConsultations = filteredConsultations.slice(indexOfFirstConsult, indexOfLastConsult);

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

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-600 dark:text-blue-300">
        All Consultations
      </h2>
      {isLoading && (
        <div className="mb-4 p-3 text-center text-blue-600 dark:text-blue-300">
          Loading consultations...
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 sm:mb-6">
        <div className="relative w-full sm:w-1/2 mb-2 sm:mb-0">
          <input
            type="text"
            placeholder="Search by diagnosis, notes, medications, tests, status, or patient ID"
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
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base shadow-sm"
            placeholder="From Date"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base shadow-sm"
            placeholder="To Date"
          />
        </div>
      </div>
      {/* Card layout for all screens */}
      <div className="space-y-6">
        {currentConsultations.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-600 dark:text-gray-400">
            No consultations found for this patient.
          </div>
        )}
        {currentConsultations.map((consult, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-300"
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
                <h3 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-300">
                  {formatDate(consult.consultationDate)}
                </h3>
              </div>
              <button
                onClick={handleSort}
                className="text-sm text-blue-600 dark:text-blue-300 hover:underline flex items-center space-x-1"
              >
                <span>Sort by Date</span>
                <span>{getSortIcon()}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Patient ID:</span> {consult.patientId}
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Diagnosis:</span>{' '}
                  {consult.diagnosis.length > 0
                    ? consult.diagnosis.map(d => `${d.code}${d.description ? `: ${d.description}` : ''}`).join(', ')
                    : 'None'}
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Subjective Notes:</span> {consult.clinicalNotes.subjective}
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Objective Notes:</span> {consult.clinicalNotes.objective}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <span className="font-semibold flex items-center">
                    <svg
                      className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Medications:
                  </span>{' '}
                  {consult.medications.length > 0
                    ? consult.medications.map(m => `${m.drug} (${m.dosage}, ${m.frequency})`).join(', ')
                    : 'None'}
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Recommended Tests:</span>{' '}
                  {consult.recommendedTests.length > 0 ? consult.recommendedTests.join(', ') : 'None'}
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Status:</span>{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      consult.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                        : consult.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                        : consult.status === 'IN_PROGRESS'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {consult.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex flex-wrap justify-center mt-4 sm:mt-6 gap-2">
        {Array.from({ length: Math.ceil(filteredConsultations.length / consultationsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700'
            } shadow-sm`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllConsultations;
