import React from 'react';

interface ErrorMessageProps {
  error?: string;
  className?: string;
}

const FormErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div
      className={`mt-1 text-sm text-red-600 bg-red-100 dark:bg-red-900 p-2 rounded ${className}`}
    >
      {error}
    </div>
  );
};

export default FormErrorMessage;