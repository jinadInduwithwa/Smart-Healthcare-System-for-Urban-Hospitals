import React, { useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

interface MedicalReport {
  file: File;
  name: string;
  previewUrl: string;
}

interface MedicalReportUploadProps {
  medicalReports: MedicalReport[];
  setMedicalReports: (reports: MedicalReport[]) => void;
  handleMedicalReportChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeMedicalReport: (index: number) => void;
}

const MedicalReportUpload: React.FC<MedicalReportUploadProps> = ({
  medicalReports,
  setMedicalReports,
  handleMedicalReportChange,
  removeMedicalReport
}) => {
  return (
    <div className="">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 flex items-center">
          <FiFile className="mr-2" />
          Medical Reports
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Upload medical reports related to this consultation (PDF, images, Word documents)
        </p>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Medical Reports
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG, JPEG, DOC, DOCX (MAX. 5MB)
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleMedicalReportChange}
              />
            </label>
          </div>
        </div>

        {medicalReports.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Uploaded Reports
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicalReports.map((report, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <FiFile className="text-blue-500 dark:text-blue-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                          {report.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(report.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedicalReport(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                  {report.previewUrl && (
                    <div className="mt-3">
                      {report.file.type.startsWith('image/') ? (
                        <img 
                          src={report.previewUrl} 
                          alt={report.name} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FiFile className="text-gray-400 dark:text-gray-500 text-2xl" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReportUpload;