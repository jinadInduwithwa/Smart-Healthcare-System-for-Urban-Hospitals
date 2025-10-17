import React from 'react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  isUploading: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading, isUploading }) => {
  if (!isLoading && !isUploading) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-xl flex items-center">
      <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {isUploading ? 'Uploading medical reports...' : 'Saving consultation...'}
    </div>
  );
};

export default LoadingIndicator;