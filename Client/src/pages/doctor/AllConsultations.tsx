import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultationsByPatient, downloadMedicalReport, deleteConsultation } from '../../utils/api';
import { FiChevronLeft, FiCalendar, FiFilter, FiX, FiSearch, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import ConsultationList from '../../components/Doctor/ConsultationList';
import ConsultationFilters from '../../components/Doctor/ConsultationFilters';
import ConsultationPagination from '../../components/Doctor/ConsultationPagination';

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

interface MedicalReport {
  _id: string;
  url: string;
  publicId: string;
  fileName: string;
  uploadedAt: string;
}

interface Consultation {
  _id: string;
  patientId: string;
  consultationDate: string;
  diagnosis: Diagnosis[];
  clinicalNotes: ClinicalNotes;
  medications: Medication[];
  recommendedTests: string[];
  status: string;
  medicalReports: MedicalReport[];
}

const AllConsultations: React.FC = () => {
  const { addToast } = useToast();
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
  const [expandedConsultations, setExpandedConsultations] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);
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
              _id: consult._id,
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
              medicalReports: consult.medicalReports || [],
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
      const reportsStr = consult.medicalReports.map(r => r.fileName).join(' ').toLowerCase();

      return (
        diagnosisStr.includes(searchLower) ||
        notesStr.includes(searchLower) ||
        medsStr.includes(searchLower) ||
        testsStr.includes(searchLower) ||
        statusStr.includes(searchLower) ||
        patientIdStr.includes(searchLower) ||
        reportsStr.includes(searchLower)
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

  const toggleConsultation = (id: string) => {
    const newExpanded = new Set(expandedConsultations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
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

  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'doc':
      case 'docx':
        return '📝';
      default:
        return '📁';
    }
  };

  const handleDownloadReport = async (url: string, fileName: string) => {
    try {
      await downloadMedicalReport(url, fileName);
    } catch (error) {
      console.error('Error downloading report:', error);
      // Use toast notification instead of alert
      addToast('Failed to download the medical report. Please try again.', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setConsultationToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (consultationToDelete) {
      try {
        await deleteConsultation(consultationToDelete);
        // Remove the deleted consultation from the state
        setConsultations(prev => prev.filter(consultation => consultation._id !== consultationToDelete));
        setFilteredConsultations(prev => prev.filter(consultation => consultation._id !== consultationToDelete));
        setShowDeleteConfirm(false);
        setConsultationToDelete(null);
        // Use toast notification instead of alert
        addToast('Consultation deleted successfully', 'success');
      } catch (err: any) {
        console.error('Error deleting consultation:', err);
        setShowDeleteConfirm(false);
        setConsultationToDelete(null);
        // Use toast notification instead of alert
        addToast('Failed to delete consultation. Please try again.', 'error');
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setConsultationToDelete(null);
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                <button 
                  onClick={handleDeleteCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this consultation? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <FiTrash2 className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <ConsultationFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        clearFilters={clearFilters}
      />

      <ConsultationList
        consultations={currentConsultations}
        expandedConsultations={expandedConsultations}
        toggleConsultation={toggleConsultation}
        getStatusClass={getStatusClass}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        getFileIcon={getFileIcon}
        handleDownloadReport={handleDownloadReport}
        isLoading={isLoading}
        error={error}
        onDelete={handleDeleteClick} // Add onDelete prop
      />

      <ConsultationPagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
        indexOfFirstConsult={indexOfFirstConsult}
        indexOfLastConsult={indexOfLastConsult}
        totalConsultations={filteredConsultations.length}
      />
    </div>
  );
};

export default AllConsultations;