import React, { useState } from 'react';
import { FiChevronDown, FiFile, FiDownload } from 'react-icons/fi';

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

interface ConsultationCardProps {
  consultation: Consultation;
  isExpanded: boolean;
  toggleConsultation: (id: string) => void;
  getStatusClass: (status: string) => string;
  formatDate: (dateStr: string) => string;
  formatDateTime: (dateStr: string) => string;
  getFileIcon: (fileName: string) => string;
  handleDownloadReport: (url: string, fileName: string) => void;
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  isExpanded,
  toggleConsultation,
  getStatusClass,
  formatDate,
  formatDateTime,
  getFileIcon,
  handleDownloadReport
}) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
    >
      {/* Card Header */}
      <div 
        className="p-5 cursor-pointer flex justify-between items-center"
        onClick={() => toggleConsultation(consultation._id)}
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
              {formatDate(consultation.consultationDate)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Patient ID: {consultation.patientId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(consultation.status)}`}>
            {consultation.status.replace('_', ' ')}
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
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{consultation.clinicalNotes.subjective}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Objective</p>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{consultation.clinicalNotes.objective}</p>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 dark:text-white mt-5 mb-3 flex items-center">
                <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Diagnosis
              </h4>
              <div className="mt-2">
                {consultation.diagnosis.length > 0 ? (
                  <ul className="space-y-2">
                    {consultation.diagnosis.map((d, idx) => (
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
                {consultation.medications.length > 0 ? (
                  <ul className="space-y-3">
                    {consultation.medications.map((med, idx) => (
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
                {consultation.recommendedTests.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {consultation.recommendedTests.map((test, idx) => (
                      <li key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {test}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No tests recommended</p>
                )}
              </div>
              
              {/* Medical Reports Section */}
              {consultation.medicalReports && consultation.medicalReports.length > 0 && (
                <div className="mt-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiFile className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                    Medical Reports
                  </h4>
                  <div className="mt-2">
                    <ul className="space-y-2">
                      {consultation.medicalReports.map((report) => (
                        <li key={report._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getFileIcon(report.fileName)}</span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[150px]">
                                {report.fileName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateTime(report.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadReport(report.url, report.fileName)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="Download report"
                          >
                            <FiDownload className="h-5 w-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
};

export default ConsultationCard;