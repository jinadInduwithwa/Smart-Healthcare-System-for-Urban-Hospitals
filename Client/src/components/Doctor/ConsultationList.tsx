import React from 'react';
import ConsultationCard from './ConsultationCard';

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

interface ConsultationListProps {
  consultations: Consultation[];
  expandedConsultations: Set<string>;
  toggleConsultation: (id: string) => void;
  getStatusClass: (status: string) => string;
  formatDate: (dateStr: string) => string;
  formatDateTime: (dateStr: string) => string;
  getFileIcon: (fileName: string) => string;
  handleDownloadReport: (url: string, fileName: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ConsultationList: React.FC<ConsultationListProps> = ({
  consultations,
  expandedConsultations,
  toggleConsultation,
  getStatusClass,
  formatDate,
  formatDateTime,
  getFileIcon,
  handleDownloadReport,
  isLoading,
  error
}) => {
  if (consultations.length === 0 && !isLoading && !error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="text-blue-500 dark:text-blue-400 text-2xl" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No consultations found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {consultations.map((consultation) => {
        const isExpanded = expandedConsultations.has(consultation._id);
        
        return (
          <ConsultationCard
            key={consultation._id}
            consultation={consultation}
            isExpanded={isExpanded}
            toggleConsultation={toggleConsultation}
            getStatusClass={getStatusClass}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            getFileIcon={getFileIcon}
            handleDownloadReport={handleDownloadReport}
          />
        );
      })}
    </div>
  );
};

export default ConsultationList;