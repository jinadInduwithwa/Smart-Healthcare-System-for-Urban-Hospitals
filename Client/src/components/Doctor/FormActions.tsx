import React from 'react';
import { FiCheck, FiBook, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface FormActionsProps {
  isLoading: boolean;
  isUploading: boolean;
  patientId: string;
  handleSubmit: (e: React.FormEvent) => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  isLoading,
  isUploading,
  patientId,
  handleSubmit
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="submit"
        disabled={isLoading || isUploading}
        className={`flex items-center px-6 py-3 rounded-lg text-lg font-medium transition-all ${
          isLoading || isUploading
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        onClick={handleSubmit}
      >
        {isLoading || isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isUploading ? 'Uploading...' : 'Saving...'}
          </>
        ) : (
          <>
            <FiCheck className="mr-2" />
            Save Consultation
          </>
        )}
      </button>
    </div>
  );
};

export default FormActions;