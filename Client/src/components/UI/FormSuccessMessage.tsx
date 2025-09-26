import React from 'react';

interface MessageProps {
  type: 'error' | 'success';
  message: string;
  onClose?: () => void;
}

const FormSuccessMessage: React.FC<MessageProps> = ({ type, message, onClose }) => {
  const baseStyles = 'p-4 rounded-md flex justify-between items-center';
  const typeStyles =
    type === 'error'
      ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
      : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200';

  return (
    <div className={`${baseStyles} ${typeStyles}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current hover:text-red-900 dark:hover:text-red-100 focus:outline-none"
          aria-label="Close message"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FormSuccessMessage;